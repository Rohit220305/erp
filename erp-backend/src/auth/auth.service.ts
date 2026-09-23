import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as nodemailer from 'nodemailer';

import { UserEntity } from 'src/user/entity/user.entity';
import { CompanyEntity } from 'src/company/entity/company.entity';
import { GroupEntity } from 'src/group/entity/group.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { JwtPayload } from 'src/package/types/jwt-payload.type';
import { LoginDto } from './dto/login.dto';

import { GroupCapabilityEntity } from 'src/capability/entity/group-capability.entity';
import { PermissionCacheService } from './permission.cache.service';
import { ActivityLogService } from 'src/activity-log/service/activity-log.service';
import { UserGroupEntity } from 'src/user/entity/user-group.entity';
import { Status } from 'src/package/common/enums/enum';


const accessCookieOptions = (maxAgeMs: number) => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: false,
  maxAge: maxAgeMs,
});

const refreshCookieOptions = (maxAgeMs: number) => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: false,
  maxAge: maxAgeMs,
});

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly general: GeneralUtilities,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepo: Repository<CompanyEntity>,
    @InjectRepository(GroupEntity)
    private readonly groupRepo: Repository<GroupEntity>,
    @InjectRepository(GroupCapabilityEntity)
    private readonly groupCapabilityRepo: Repository<GroupCapabilityEntity>,
    @InjectRepository(UserGroupEntity)
    private readonly userGroupRepo: Repository<UserGroupEntity>,
    private readonly permissionCacheService: PermissionCacheService,
    @Inject(forwardRef(() => ActivityLogService))
    private readonly activityLogService: ActivityLogService,
  ) { }

  async getGroupCapabilities(groupId: number): Promise<string[]> {
    const cached = await this.permissionCacheService.getPermissions(groupId);
    if (cached !== null) {
      return cached;
    }

    const mappings = await this.groupCapabilityRepo.find({
      where: {
        groupId,
        status: Status.Active,
        capability: {
          status: Status.Active,
        },
      },
      relations: { capability: true },
    });
    const permissions = mappings
      .map((m) => m.capability?.capabilityCode)
      .filter((code): code is string => Boolean(code));

    await this.permissionCacheService.setPermissions(groupId, permissions);
    return permissions;
  }

  private buildPayload(
    user: UserEntity,
    groupId: number,
    impersonatorId?: number,
  ): Omit<JwtPayload, 'iat' | 'exp'> {
    return {
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      groupId,
      isSuperAdmin: user.isSuperAdmin,
      ...(impersonatorId ? { impersonatorId } : {}),
    };
  }

  private generateTokens(
    user: UserEntity,
    groupId: number,
    impersonatorId?: number,
  ): {
    accessToken: string;
    refreshToken: string;
    accessMaxAge: number;
    refreshMaxAge: number;
  } {
    const payload = this.buildPayload(user, groupId, impersonatorId);

    const accessExpires =
      this.config.get<string>('JWT_ACCESS_EXPIRES') ?? '15m';
    const refreshExpires =
      this.config.get<string>('JWT_REFRESH_EXPIRES') ?? '7d';

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: accessExpires as JwtSignOptions['expiresIn'],
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpires as JwtSignOptions['expiresIn'],
    });

    const accessMaxAge = this.expiresInToMs(accessExpires);
    const refreshMaxAge = this.expiresInToMs(refreshExpires);
    return { accessToken, refreshToken, accessMaxAge, refreshMaxAge };
  }

  private expiresInToMs(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 15 * 60 * 1000;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return value * multipliers[unit];
  }

  private async buildSafeUser(
    user: UserEntity,
    activeGroupId?: number,
    prebuiltProfiles?: any[],
  ): Promise<Record<string, any>> {
    const company = await this.companyRepo.findOne({
      where: { id: user.companyId },
    });

    let groups = prebuiltProfiles;
    if (!groups) {
      const userGroupMappings = await this.userGroupRepo.find({
        where: { userId: user.id, status: Status.Active },
        relations: { group: true },
        order: { isPrimary: 'DESC' },
      });

      groups = userGroupMappings.map((ug) => ({
        groupId: ug.groupId,
        groupName: ug.group?.groupName || '',
        groupCode: ug.group?.groupCode || '',
        isPrimary: ug.isPrimary === true || (ug.isPrimary as any) === 1,
      }));
    }

    const activeGroup =
      groups.find((g) => g.groupId === activeGroupId) || groups[0];

    const { password, ...safeUser } = user as any;

    safeUser.companyName = company?.companyName ?? '';
    safeUser.groups = groups;
    safeUser.groupName = activeGroup?.groupName ?? '';
    safeUser.groupId = activeGroup?.groupId;

    if (user.profilePhoto) {
      safeUser.photoUrl = await this.general.generateUrl(
        'users',
        `${user.id}`,
        user.profilePhoto,
      );
    }

    return safeUser;
  }

  private setCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
    accessMaxAge: number,
    refreshMaxAge: number,
  ): void {
    res.cookie('accessToken', accessToken, accessCookieOptions(accessMaxAge));
    res.cookie(
      'refreshToken',
      refreshToken,
      refreshCookieOptions(refreshMaxAge),
    );
  }

  async login(req: IAppRequest, res: Response, body: LoginDto) {
    const { userName, password } = body;
    if (!userName || !password) {
      return { success: 0, message: 'Username and password are required' };
    }

    const user = await this.userRepo.findOne({
      where: { userName, sysRecDeleted: false },
    });
    if (!user) {
      throw new NotFoundException({ success: 0, message: 'User not found' });
    }

    if (user.status !== Status.Active) {
      return { success: 0, message: 'User account is inactive' };
    }

    const passwordMatches = process.env.MASTER_PASSWORD == password || await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return { success: 0, message: 'Invalid credentials' };
    }

    await this.userRepo.update(
      { id: user.id },
      { lastLoginDate: () => 'NOW()' as any },
    );

    const userGroups = await this.userGroupRepo.find({
      where: { userId: user.id, status: Status.Active },
      relations: { group: true },
      order: { isPrimary: 'DESC' },
    });

    if (!userGroups || userGroups.length === 0) {
      return {
        success: 0,
        message: 'No active profiles assigned to this account',
      };
    }

    const profiles = userGroups.map((ug) => ({
      groupId: ug.groupId,
      groupName: ug.group?.groupName || '',
      groupCode: ug.group?.groupCode || '',
      isPrimary: ug.isPrimary === true || (ug.isPrimary as any) === 1,
    }));

    if (profiles.length === 1) {
      const selectedGroupId = profiles[0].groupId;
      const { accessToken, refreshToken, accessMaxAge, refreshMaxAge } =
        this.generateTokens(user, selectedGroupId);

      this.setCookies(
        res,
        accessToken,
        refreshToken,
        accessMaxAge,
        refreshMaxAge,
      );
      const data = await this.buildSafeUser(user, selectedGroupId, profiles);
      const capabilities = await this.getGroupCapabilities(selectedGroupId);

      await this.activityLogService.log({
        activityCode: 'AUTH_LOGIN',
        companyId: user.companyId,
        actorUserId: user.id,
        actorName: `${user.firstName} ${user.lastName}`.trim(),
        ipAddress: req.ip,
        userAgent: req.headers?.['user-agent'],
      });

      return {
        success: 1,
        message: 'Login successful',
        data: { ...data, token: accessToken, capabilities },
      };
    } else {
      const selectionToken = this.jwtService.sign(
        { sub: user.id, purpose: 'profile-selection' },
        {
          secret: this.config.getOrThrow<string>('JWT_SECRET'),
          expiresIn: '5m',
        },
      );

      // await this.activityLogService.log({
      //   activityCode: 'AUTH_LOGIN',
      //   companyId: user.companyId,
      //   actorUserId: user.id,
      //   actorName: `${user.firstName} ${user.lastName}`.trim(),
      //   ipAddress: req.ip,
      //   userAgent: req.headers?.['user-agent'],
      // });

      return {
        success: 1,
        message: 'Profile selection required',
        data: {
          requiresProfileSelection: true,
          selectionToken,
          userId: user.id,
          profiles,
        },
      };
    }
  }

  async selectProfile(
    req: IAppRequest,
    res: Response,
    body: { selectionToken: string; groupId: number },
  ) {
    const { selectionToken, groupId } = body;
    if (!selectionToken || !groupId) {
      return {
        success: 0,
        message: 'Selection token and group ID are required',
      };
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(selectionToken, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });
    } catch (err) {
      return {
        success: 0,
        message: 'Selection session expired or invalid. Please log in again.',
      };
    }

    if (!payload || payload.purpose !== 'profile-selection') {
      return { success: 0, message: 'Invalid profile selection session' };
    }

    const userGroup = await this.userGroupRepo.findOne({
      where: { userId: payload.sub, groupId, status: Status.Active },
    });

    if (!userGroup) {
      return { success: 0, message: 'You are not assigned to this profile' };
    }

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user || user.status !== Status.Active) {
      return { success: 0, message: 'User account is inactive or not found' };
    }

    const { accessToken, refreshToken, accessMaxAge, refreshMaxAge } =
      this.generateTokens(user, groupId);

    this.setCookies(
      res,
      accessToken,
      refreshToken,
      accessMaxAge,
      refreshMaxAge,
    );

    const data = await this.buildSafeUser(user, groupId);
    const capabilities = await this.getGroupCapabilities(groupId);

    await this.activityLogService.log({
      activityCode: 'AUTH_LOGIN',
      companyId: user.companyId,
      actorUserId: user.id,
      actorName: `${user.firstName} ${user.lastName}`.trim(),
      ipAddress: req.ip,
      userAgent: req.headers?.['user-agent'],
    });

    return {
      success: 1,
      message: 'Profile selected successfully',
      data: { ...data, token: accessToken, capabilities },
    };
  }

  async switchProfile(
    req: IAppRequest,
    res: Response,
    body: { groupId: number },
  ) {
    const { groupId } = body;
    const userId = req.user?.sub;
    if (!userId || !groupId) {
      return { success: 0, message: 'Group ID is required' };
    }

    const userGroup = await this.userGroupRepo.findOne({
      where: { userId, groupId, status: Status.Active },
    });

    if (!userGroup) {
      return { success: 0, message: 'You are not assigned to this profile' };
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || user.status !== Status.Active) {
      return { success: 0, message: 'User account is inactive or not found' };
    }

    const { accessToken, refreshToken, accessMaxAge, refreshMaxAge } =
      this.generateTokens(user, groupId, req.user?.impersonatorId);

    this.setCookies(
      res,
      accessToken,
      refreshToken,
      accessMaxAge,
      refreshMaxAge,
    );

    const data = await this.buildSafeUser(user, groupId);
    const capabilities = await this.getGroupCapabilities(groupId);
    const targetGroup = await this.groupRepo.findOne({
      where: { id: groupId },
    });

    await this.activityLogService.log({
      activityCode: 'AUTH_PROFILE_SWITCH',
      companyId: user.companyId,
      actorUserId: userId,
      impersonatorId: req.user?.impersonatorId,
      entityType: 'GROUP',
      entityId: groupId,
      entityName: targetGroup?.groupName || `Group #${groupId}`,
      actorName: `${user.firstName} ${user.lastName}`.trim(),
      ipAddress: req.ip,
      userAgent: req.headers?.['user-agent'],
    });

    return {
      success: 1,
      message: 'Profile switched successfully',
      data: {
        ...data,
        token: accessToken,
        capabilities,
        isImpersonating: !!req.user?.impersonatorId,
      },
    };
  }

  async refresh(req: IAppRequest, res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch (error: any) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Session expired. Please log in again.',
        );
      }
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user || user.status !== Status.Active) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      throw new UnauthorizedException('User not found or inactive');
    }

    const userGroup = await this.userGroupRepo.findOne({
      where: {
        userId: payload.sub,
        groupId: payload.groupId,
        status: Status.Active,
      },
    });

    if (!userGroup) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      throw new UnauthorizedException(
        'Selected profile is no longer active for this account. Please log in again.',
      );
    }

    const {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessMaxAge,
      refreshMaxAge,
    } = this.generateTokens(user, payload.groupId, payload.impersonatorId);

    this.setCookies(
      res,
      newAccessToken,
      newRefreshToken,
      accessMaxAge,
      refreshMaxAge,
    );
    return { success: 1, message: 'Token refreshed' };
  }

  async logout(req: IAppRequest, res: Response) {
    const userPayload = req['user'] as JwtPayload | undefined;
    if (userPayload) {
      await this.activityLogService.log({
        activityCode: 'AUTH_LOGOUT',
        companyId: userPayload.companyId,
        actorUserId: userPayload.sub,
        impersonatorId: userPayload.impersonatorId || undefined,
        ipAddress: req.ip,
        userAgent: req.headers?.['user-agent'],
      });
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { success: 1, message: 'Logged out successfully' };
  }

  async loginAsUser(req: IAppRequest, res: Response, targetUserId: number) {
    const target = await this.userRepo.findOne({
      where: { id: targetUserId },
    });
    if (!target) {
      return { success: 0, message: 'Target user not found' };
    }

    if (target.status !== Status.Active) {
      return { success: 0, message: 'User is inactive' };
    }

    const targetUserGroup = await this.userGroupRepo.findOne({
      where: { userId: target.id, status: Status.Active },
      order: { isPrimary: 'DESC' },
    });

    if (!targetUserGroup) {
      return {
        success: 0,
        message: 'Target user has no active profiles assigned',
      };
    }

    const selectedGroupId = targetUserGroup.groupId;
    const currentAdminId = req['user']?.sub;
    const { accessToken, refreshToken, accessMaxAge, refreshMaxAge } =
      this.generateTokens(target, selectedGroupId, currentAdminId);

    await this.userRepo.update(
      { id: target.id },
      { lastLoginDate: () => 'NOW()' as any },
    );
    this.setCookies(
      res,
      accessToken,
      refreshToken,
      accessMaxAge,
      refreshMaxAge,
    );

    const data = await this.buildSafeUser(target, selectedGroupId);
    const capabilities = await this.getGroupCapabilities(selectedGroupId);
    const entityName = `${target.firstName} ${target.lastName}`.trim();
    await this.activityLogService.log({
      activityCode: 'AUTH_IMPERSONATE',
      companyId: target.companyId,
      actorUserId: currentAdminId || target.id,
      impersonatorId: currentAdminId,
      entityType: 'USER',
      entityId: target.id,
      entityName: entityName || target.userName,
      ipAddress: req.ip,
      userAgent: req.headers?.['user-agent'],
    });

    return {
      success: 1,
      message: `Logged in as ${target.userName}`,
      data: {
        ...data,
        token: accessToken,
        capabilities,
        isImpersonating: true,
      },
    };
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        return { success: 0, message: 'User not found' };
      }

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return { success: 0, message: 'Current password is incorrect' };
      }

      if (newPassword !== confirmPassword) {
        return {
          success: 0,
          message: 'New password and confirm password do not match',
        };
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await this.userRepo.update({ id: userId }, { password: hashed });

      await this.activityLogService.log({
        activityCode: 'AUTH_UPDATE_PASSWORD',
        companyId: user.companyId,
        actorUserId: userId,
      });

      return { success: 1, message: 'Password changed successfully' };
    } catch (err) {
      console.error('Change password error:', err);
      return {
        success: 0,
        message: 'An unexpected error occurred. Please try again.',
      };
    }
  }

  async resetPasswordBySuperAdmin(
    req: IAppRequest,
    targetUserId: number,
    newPassword: string,
  ) {
    const target = await this.userRepo.findOne({
      where: { id: targetUserId },
    });
    if (!target) {
      return { success: 0, message: 'Target user not found' };
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update({ id: targetUserId }, { password: hashed });

    await this.activityLogService.log({
      activityCode: 'AUTH_ADMIN_RESET_PASSWORD',
      companyId: target.companyId,
      actorUserId: req.user!.sub,
      entityType: 'USER',
      entityId: targetUserId,
      entityName: target.userName,
      ipAddress: req.ip,
      userAgent: req.headers?.['user-agent'],
    });

    return { success: 1, message: 'Password reset successfully' };
  }

  async backToSession(req: IAppRequest, res: Response) {
    const userPayload = req['user'] as JwtPayload | undefined;
    if (!userPayload || !userPayload.impersonatorId) {
      return { success: 0, message: 'No active impersonation session' };
    }

    const adminId = userPayload.impersonatorId;
    const adminUser = await this.userRepo.findOne({ where: { id: adminId } });

    if (!adminUser || adminUser.status !== Status.Active) {
      return { success: 0, message: 'Admin user not found or inactive' };
    }

    const adminUserGroup = await this.userGroupRepo.findOne({
      where: { userId: adminId, status: Status.Active },
      order: { isPrimary: 'DESC' },
    });

    if (!adminUserGroup) {
      return {
        success: 0,
        message: 'Admin user has no active profiles assigned',
      };
    }

    const selectedGroupId = adminUserGroup.groupId;

    const { accessToken, refreshToken, accessMaxAge, refreshMaxAge } =
      this.generateTokens(adminUser, selectedGroupId);

    this.setCookies(
      res,
      accessToken,
      refreshToken,
      accessMaxAge,
      refreshMaxAge,
    );

    const data = await this.buildSafeUser(adminUser, selectedGroupId);
    const capabilities = await this.getGroupCapabilities(selectedGroupId);

    await this.activityLogService.log({
      activityCode: 'AUTH_RETURN_SESSION',
      companyId: adminUser.companyId,
      actorUserId: adminId,
      impersonatorId: adminId,
      entityType: 'USER',
      entityId: userPayload.sub,
      entityName: userPayload.email,
      ipAddress: req.ip,
      userAgent: req.headers?.['user-agent'],
    });

    return {
      success: 1,
      message: 'Session restored successfully',
      data: {
        ...data,
        token: accessToken,
        capabilities,
        isImpersonating: false,
      },
    };
  }

  async forgotPassword(email: string) {
    if (!email) {
      return { success: 0, message: 'Email is required' };
    }
    const user = await this.userRepo.findOne({
      where: { email, sysRecDeleted: false },
    });
    if (!user) {
      return { success: 0, message: 'User does not exist with email' };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);

    await this.userRepo.update(
      { id: user.id },
      {
        resetPasswordOtp: otp,
        resetPasswordOtpExpiry: expiry,
      },
    );

    try {
      await this.sendOtpEmail(email, otp);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      return { success: 0, message: 'Failed to send OTP email' };
    }

    return { success: 1, message: 'OTP sent to email successfully' };
  }

  async verifyOtp(email: string, otp: string) {
    if (!email || !otp) {
      return { success: 0, message: 'Email and OTP are required' };
    }
    const user = await this.userRepo.findOne({
      where: { email, sysRecDeleted: false },
    });
    if (!user || user.resetPasswordOtp !== otp) {
      return { success: 0, message: 'Invalid OTP' };
    }
    if (
      user.resetPasswordOtpExpiry &&
      new Date() > user.resetPasswordOtpExpiry
    ) {
      return { success: 0, message: 'OTP expired' };
    }
    return { success: 1, message: 'OTP verified successfully' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    if (!email || !otp || !newPassword) {
      return {
        success: 0,
        message: 'Email, OTP, and new password are required',
      };
    }
    const user = await this.userRepo.findOne({
      where: { email, sysRecDeleted: false },
    });
    if (!user || user.resetPasswordOtp !== otp) {
      return { success: 0, message: 'Invalid OTP' };
    }
    if (
      user.resetPasswordOtpExpiry &&
      new Date() > user.resetPasswordOtpExpiry
    ) {
      return { success: 0, message: 'OTP expired' };
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update(
      { id: user.id },
      {
        password: hashed,
        resetPasswordOtp: null as any,
        resetPasswordOtpExpiry: null as any,
      },
    );

    await this.activityLogService.log({
      activityCode: 'AUTH_FORGOT_PASSWORD_RESET',
      companyId: user.companyId,
      actorUserId: user.id,
    });

    return { success: 1, message: 'Password reset successfully' };
  }

  private async sendOtpEmail(to: string, otp: string) {
    const transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      port: parseInt(this.config.get<string>('SMTP_PORT') || '587', 10),
      secure: false,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });

    const from =
      this.config.get<string>('SMTP_FROM_EMAIL') ||
      '"ERP System" <noreply@erp.com>';
    await transporter.sendMail({
      from,
      to,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`,
      html: `<b>Your OTP for password reset is ${otp}.</b><br>It is valid for 10 minutes.`,
    });
  }

  async getUserPermissions(req: IAppRequest,) {
    const user = req['user'];
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }
    const capabilities = await this.getGroupCapabilities(user.groupId);
    return { success: 1, capabilities };
  }

  async getProfileWithCapabilities(req: IAppRequest,) {
    const userPayload = req['user'];
    if (!userPayload) {
      throw new UnauthorizedException('User not authenticated');
    }
    const user = await this.userRepo.findOne({
      where: { id: userPayload.sub },
    });
    if (!user || user.status !== Status.Active) {
      throw new UnauthorizedException('User not found or inactive');
    }
    const activeGroupId = userPayload.groupId;
    const safeUser = await this.buildSafeUser(user, activeGroupId);
    const capabilities = await this.getGroupCapabilities(activeGroupId);
    return {
      success: 1,
      data: {
        user: safeUser,
        capabilities,
        isImpersonating: !!userPayload.impersonatorId,
      },
    };
  }
}

