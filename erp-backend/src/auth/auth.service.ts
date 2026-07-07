import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from 'src/user/entity/user.entity';
import { CompanyEntity } from 'src/company/entity/company.entity';
import { GroupEntity } from 'src/group/entity/group.entity';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { JwtPayload } from 'src/package/types/jwt-payload.type';
import { LoginDto } from './dto/login.dto';

import { GroupCapabilityEntity } from 'src/capability/entity/group-capability.entity';
import { PermissionCacheService } from './permission.cache.service';

// ─── Cookie helpers ───────────────────────────────────────────────────────────

const IS_PROD = () => process.env.NODE_ENV === 'production';

/** Short-lived access token cookie (15 min by default) */
const accessCookieOptions = (maxAgeMs: number) => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: IS_PROD(),
  maxAge: maxAgeMs,
});

/** Long-lived refresh token cookie (7 days by default) */
const refreshCookieOptions = (maxAgeMs: number) => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: IS_PROD(),
  maxAge: maxAgeMs, 
});

// ─── Service ──────────────────────────────────────────────────────────────────

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
  ) {}

  // ─── Private helpers ────────────────────────────────────────────────────────

  /** Load capabilities by groupId */
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

  /** Build the JWT payload from a UserEntity */
  private buildPayload(user: UserEntity): Omit<JwtPayload, 'iat' | 'exp'> {
    return {
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      groupId: user.groupId,
      isSuperAdmin: user.isSuperAdmin,
    };
  }

  /**
   * Sign and return both tokens.
   * Access token  : JWT_ACCESS_EXPIRES  (default 15m)
   * Refresh token : JWT_REFRESH_EXPIRES (default 7d)
   */
  private generateTokens(user: UserEntity): {
    accessToken: string;
    refreshToken: string;
    accessMaxAge: number;
    refreshMaxAge: number;
  } {
    const payload = this.buildPayload(user);

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
    // console.log(`Generated tokens for user ${user.userName}: accessToken expires in ${accessMaxAge}ms, refreshToken expires in ${refreshMaxAge}ms`);
    return { accessToken, refreshToken, accessMaxAge, refreshMaxAge };
  }

  /** Convert a JWT expiresIn string (e.g. '15m', '7d', '2h') to milliseconds */
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

  /**
   * Build the safe user object returned in login/refresh responses.
   * Enriches with companyName, groupName, and profile photo URL.
   * Password is always stripped.
   */
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

  /** Set both tokens as httpOnly cookies on the response */
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

  // ─── Login ──────────────────────────────────────────────────────────────────

  async login(req: Request, res: Response, body: LoginDto) {
    const { userName, password } = body;
    console.log(`Attempting login for user: ${userName}`);
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
    console.log(`User ${user.userName} authenticated successfully`);

    // Update last login timestamp
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
    } = this.generateTokens(user);

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

  // ─── Logout ─────────────────────────────────────────────────────────────────

  async logout(res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { success: 1, message: 'Logged out successfully' };
  }

  // ─── Login-as-user (super admin only) ───────────────────────────────────────

  /**
   * Allows a super admin to impersonate another user.  
   * Guard must ensure only isSuperAdmin users can reach this endpoint.
   */
  async loginAsUser(res: Response, targetUserId: number) {
    const target = await this.userRepo.findOne({ where: { id: targetUserId } });
    if (!target) {
      return { success: 0, message: 'Target user not found' };
    }

    if (target.status !== 'Active') {
      return { success: 0, message: 'Target user is inactive' };
    }

    const { accessToken, refreshToken, accessMaxAge, refreshMaxAge } =
      this.generateTokens(target);

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

    return {
      success: 1,
      message: `Now acting as ${target.userName}`,
      data: { ...data, token: accessToken, capabilities },
    };
  }

  // ─── Change Password ─────────────────────────────────────────────────────────

  /**
   * Validates current password, ensures newPassword === confirmPassword,
   * then persists the new bcrypt hash.
   */
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (newPassword !== confirmPassword) {
      throw new UnauthorizedException(
        'New password and confirm password do not match',
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update({ id: userId }, { password: hashed });

    return { success: 1, message: 'Password changed successfully' };
  }

  /**
   * Super admin only — reset another user's password directly.
   */
  async resetPasswordBySuperAdmin(targetUserId: number, newPassword: string) {
    const target = await this.userRepo.findOne({ where: { id: targetUserId } });
    if (!target) {
      return { success: 0, message: 'Target user not found' };
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update({ id: targetUserId }, { password: hashed });

    return { success: 1, message: 'Password reset successfully' };
  }

  async restoreSession(res: Response, token: string) {
    if (!token) {
      return { success: 0, message: 'Session token is required' };
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });

      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user || user.status !== 'Active') {
        return { success: 0, message: 'User not found or inactive' };
      }

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

      return {
        success: 1,
        message: 'Session restored successfully',
        data: { ...data, token: accessToken, capabilities },
      };
    } catch (error) {
      return { success: 0, message: 'Invalid or expired session token' };
    }
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

