import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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


const IS_PROD = () => process.env.NODE_ENV === 'production';

const accessCookieOptions = (maxAgeMs: number) => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: IS_PROD(),
  maxAge: maxAgeMs,
});

const refreshCookieOptions = (maxAgeMs: number) => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: IS_PROD(),
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
    private readonly permissionCacheService: PermissionCacheService,
    @Inject(forwardRef(() => ActivityLogService))
    private readonly activityLogService: ActivityLogService,
  ) {}


  async getGroupCapabilities(groupId: number): Promise<string[]> {
    const cached = await this.permissionCacheService.getPermissions(groupId);
    if (cached !== null) {
      return cached;
    }

    const mappings = await this.groupCapabilityRepo.find({
      where: {
        groupId,
        status: 'Active',
        capability: {
          status: 'Active',
        },
      },
      relations: { capability: true },
    });
    // console.log(mappings);
    const permissions = mappings
      .map((m) => m.capability?.capabilityCode)
      .filter(Boolean)
      .map((code) => {
        // if (code.endsWith('_ADD')) return code.replace('_ADD', '_CREATE');
        // if (code.endsWith('_EDIT')) return code.replace('_EDIT', '_UPDATE');
        return code;
      });

    await this.permissionCacheService.setPermissions(groupId, permissions);
    return permissions;
  }

  private buildPayload(user: UserEntity, impersonatorId?: number): Omit<JwtPayload, 'iat' | 'exp'> {
    return {
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      groupId: user.groupId,
      isSuperAdmin: user.isSuperAdmin,
      ...(impersonatorId ? { impersonatorId } : {}),
    };
  }


  private generateTokens(user: UserEntity, impersonatorId?: number): {
    accessToken: string;
    refreshToken: string;
    accessMaxAge: number;
    refreshMaxAge: number;
  } {
    const payload = this.buildPayload(user, impersonatorId);

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

    // Convert expires string to milliseconds for cookie maxAge
    const accessMaxAge = this.expiresInToMs(accessExpires);
    const refreshMaxAge = this.expiresInToMs(refreshExpires);
    return { accessToken, refreshToken, accessMaxAge, refreshMaxAge };
  }

  private expiresInToMs(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 15 * 60 * 1000; // fallback 15m
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


  private async buildSafeUser(user: UserEntity): Promise<Record<string, any>> {
    const company = await this.companyRepo.findOne({
      where: { id: user.companyId },
    });

    const group = await this.groupRepo.findOne({
      where: { id: user.groupId },
    });

    const { password, ...safeUser } = user as any;

    safeUser.companyName = company?.companyName ?? '';
    safeUser.groupName = group?.groupName ?? '';

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


  async login(req: Request, res: Response, body: LoginDto) {
    const { userName, password } = body;
    // console.log(`Attempting login for user: ${userName}`);
    if (!userName || !password) {
      return { success: 0, message: 'Username and password are required' };
    }

    const user = await this.userRepo.findOne({ where: { userName } });
    if (!user) {
      throw new NotFoundException({ success: 0, message: 'User not found' });
    }

    if (user.status !== 'Active') {
      return { success: 0, message: 'User account is inactive' };
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return { success: 0, message: 'Invalid credentials' };
    }
    // console.log(`User ${user.userName} authenticated successfully`);

    await this.userRepo.update(
      { id: user.id },
      { lastLoginDate: () => 'NOW()' as any },
    );

    const { accessToken, refreshToken, accessMaxAge, refreshMaxAge } =
      this.generateTokens(user);

    this.setCookies(
      res,
      accessToken,
      refreshToken,
      accessMaxAge,
      refreshMaxAge,
    );

    const data = await this.buildSafeUser(user);
    const capabilities = await this.getGroupCapabilities(user.groupId);

    // Activity Log
    await this.activityLogService.log({
      activityCode: 'AUTH_LOGIN',
      companyId: user.companyId,
      actorUserId: user.id,
      actorName: `${user.firstName} ${user.lastName}`.trim(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return {
      success: 1,
      message: 'Login successful',
      data: { ...data, token: accessToken, capabilities },
    };
  }

  async refresh(req: Request, res: Response) {
    
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      // console.log('Refresh token verified successfully for user ID:', payload.sub);
    } catch (error: any) {
      // Clear stale cookies before throwing
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
    if (!user || user.status !== 'Active') {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      throw new UnauthorizedException('User not found or inactive');
    }

    const {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessMaxAge,
      refreshMaxAge,
    } = this.generateTokens(user, payload.impersonatorId);

    this.setCookies(
      res,
      newAccessToken,
      newRefreshToken,
      accessMaxAge,
      refreshMaxAge,
    );
    // console.log('Tokens refreshed successfully for user ID:', payload.sub);
    return { success: 1, message: 'Token refreshed' };
  }

  async logout(req: Request, res: Response) {
    // console.log(req);
    const userPayload = req['user'] as JwtPayload | undefined;
    // console.log('Logging out user:', userPayload);
    if (userPayload) {
      await this.activityLogService.log({
        activityCode: 'AUTH_LOGOUT',
        companyId: userPayload.companyId,
        actorUserId: userPayload.sub,
        impersonatorId: userPayload.impersonatorId || undefined,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { success: 1, message: 'Logged out successfully' };
  }

  async loginAsUser(req: Request, res: Response, targetUserId: number) {
    const target = await this.userRepo.findOne({ where: { id: targetUserId } });
    if (!target) {
      return { success: 0, message: 'Target user not found' };
    }

    if (target.status !== 'Active') {
      return { success: 0, message: 'User is inactive' };
    }

    const currentAdminId = req['user']?.sub;
    const { accessToken, refreshToken, accessMaxAge, refreshMaxAge } =
      this.generateTokens(target, currentAdminId);

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

    const data = await this.buildSafeUser(target);
    const capabilities = await this.getGroupCapabilities(target.groupId);
    const entityName = `${target.firstName} ${target.lastName}`.trim();
    // Activity Log
    await this.activityLogService.log({
      activityCode: 'AUTH_IMPERSONATE',
      companyId: target.companyId,
      actorUserId: currentAdminId || target.id,
      impersonatorId: currentAdminId,
      entityType: 'USER',
      entityId: target.id, 
      entityName: entityName || target.userName,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return {
      success: 1,
      message: `Now acting as ${target.userName}`,
      data: { ...data, token: accessToken, capabilities },
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
      // console.log(`Current password validation result for user ${user.userName}:`, isValid);
      if (!isValid) {
        return { success: 0, message: 'Current password is incorrect' };
      }

      if (newPassword !== confirmPassword) {
        return { success: 0, message: 'New password and confirm password do not match' };
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
      return { success: 0, message: 'An unexpected error occurred. Please try again.' };
    }
  }

 
  async resetPasswordBySuperAdmin(req: Request & { user: JwtPayload }, targetUserId: number, newPassword: string) {
    const target = await this.userRepo.findOne({ where: { id: targetUserId } });
    if (!target) {
      return { success: 0, message: 'Target user not found' };
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update({ id: targetUserId }, { password: hashed });

    // Activity Log
    await this.activityLogService.log({
      activityCode: 'AUTH_ADMIN_RESET_PASSWORD',
      companyId: target.companyId,
      actorUserId: req.user.sub,
      entityType: 'USER',
      entityId: targetUserId,
      entityName: target.userName,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return { success: 1, message: 'Password reset successfully' };
  }

  async restoreSession(req: Request, res: Response, token: string) {
    if (!token) {
      return { success: 0, message: 'Session token is required' };
    }

    try {
      
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
        ignoreExpiration: true,
      });
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user || user.status !== 'Active') {
        return { success: 0, message: 'User not found or inactive' };
      }

      const { accessToken, refreshToken, accessMaxAge, refreshMaxAge } =
        this.generateTokens(user);

      let activeUserId: number | undefined = undefined;
      let activeImpersonatorId: number | undefined = undefined;
      const activeToken = req.cookies?.accessToken;
      if (activeToken) {
        try {
          const decoded = this.jwtService.verify<JwtPayload>(activeToken, {
            secret: this.config.getOrThrow<string>('JWT_SECRET'),
          });
          activeUserId = decoded.sub;
          activeImpersonatorId = decoded.impersonatorId;
        } catch {}
      }
      console.log(req.headers)
      await this.activityLogService.log({
        activityCode: 'AUTH_RETURN_SESSION',
        companyId: user.companyId,
        actorUserId: activeImpersonatorId || user.id,
        impersonatorId: activeImpersonatorId || user.id,
        entityType: 'USER',
        entityId: user.id,
        entityName: user.userName,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      this.setCookies(
        res,
        accessToken,
        refreshToken,
        accessMaxAge,
        refreshMaxAge,
      );

      const data = await this.buildSafeUser(user);
      const capabilities = await this.getGroupCapabilities(user.groupId);

      return {
        success: 1,
        message: 'Session restored successfully',
        data: { ...data, token: accessToken, capabilities },
      };
    } catch (error) {
      return { success: 0, message: 'Invalid or expired session token' };
    }
  }


  async forgotPassword(email: string) {
    if (!email) {
      return { success: 0, message: 'Email is required' };
    }
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      return { success: 0, message: 'User does not exist with email' };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10); // 10 minutes

    await this.userRepo.update({ id: user.id }, {
      resetPasswordOtp: otp,
      resetPasswordOtpExpiry: expiry
    });

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
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || user.resetPasswordOtp !== otp) {
      return { success: 0, message: 'Invalid OTP' };
    }
    if (user.resetPasswordOtpExpiry && new Date() > user.resetPasswordOtpExpiry) {
      return { success: 0, message: 'OTP expired' };
    }
    return { success: 1, message: 'OTP verified successfully' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    if (!email || !otp || !newPassword) {
      return { success: 0, message: 'Email, OTP, and new password are required' };
    }
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || user.resetPasswordOtp !== otp) {
      return { success: 0, message: 'Invalid OTP' };
    }
    if (user.resetPasswordOtpExpiry && new Date() > user.resetPasswordOtpExpiry) {
      return { success: 0, message: 'OTP expired' };
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update({ id: user.id }, {
      password: hashed,
      resetPasswordOtp: null as any,
      resetPasswordOtpExpiry: null as any,
    });

    // Activity Log
    await this.activityLogService.log({
      activityCode: 'AUTH_FORGOT_PASSWORD_RESET',
      companyId: user.companyId,
      actorUserId: user.id,
    });

    return { success: 1, message: 'Password reset successfully' };
  }

  private async sendOtpEmail(to: string, otp: string) {
    console.log(`Sending OTP ${otp} to email: ${to}`);
    const transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      port: parseInt(this.config.get<string>('SMTP_PORT') || '587', 10),
      secure: false, 
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });

    const from = this.config.get<string>('SMTP_FROM_EMAIL') || '"ERP System" <noreply@erp.com>';
    console.log(`Using SMTP from: ${from} to send OTP email to: ${to}`);
    await transporter.sendMail({
      from,
      to,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`,
      html: `<b>Your OTP for password reset is ${otp}.</b><br>It is valid for 10 minutes.`,
    });
    console.log(`OTP email sent to ${to} successfully`);
  }

  async getUserPermissions(req: Request) {
    const user = req['user'];
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }
    const capabilities = await this.getGroupCapabilities(user.groupId);
    return { success: 1, capabilities };
  }

  async getProfileWithCapabilities(req: Request) {
    const userPayload = req['user'];
    if (!userPayload) {
      throw new UnauthorizedException('User not authenticated');
    }
    const user = await this.userRepo.findOne({
      where: { id: userPayload.sub },
    });
    if (!user || user.status !== 'Active') {
      throw new UnauthorizedException('User not found or inactive');
    }
    const safeUser = await this.buildSafeUser(user);
    const capabilities = await this.getGroupCapabilities(user.groupId);
    return {
      success: 1,
      data: {
        user: safeUser,
        capabilities,
      },
    };
  }
}

