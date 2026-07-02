import { Body, Controller, Get, Post, Req, Res, Param, ParseIntPipe } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from 'src/package/decorator/decorator.public';
import { JwtPayload } from 'src/package/types/jwt-payload.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Public — no token required */
  @Public()
  @Post('login')
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: LoginDto,
  ) {
    return this.authService.login(req, res, body);
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    
    return this.authService.refresh(req, res);
  }

  /** Requires valid access token */
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  /**
   * Super admin only — impersonate another user.
   * Guard checks `isSuperAdmin` from JWT payload.
   */
  @Post('login-as-user/:targetUserId')
  async loginAsUser(
    @Req() req: Request & { user: JwtPayload },
    @Res({ passthrough: true }) res: Response,
    @Param('targetUserId', ParseIntPipe) targetUserId: number,
  ) {
    if (!req.user?.isSuperAdmin) {
      return { success: 0, message: 'Super admin access required' };
    }
    return this.authService.loginAsUser(res, targetUserId);
  }

  /**
   * Authenticated users can change their own password.
   * Validates current password and confirms new password match.
   */
  @Post('change-password')
  async changePassword(
    @Req() req: Request & { user: JwtPayload },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      req.user.sub,
      dto.currentPassword,
      dto.newPassword,
      dto.confirmPassword,
    );
  }

  @Post('reset-password/:targetUserId')
  async resetPassword(
    @Req() req: Request & { user: JwtPayload },
    @Param('targetUserId', ParseIntPipe) targetUserId: number,
    @Body() body: any,
  ) {
    if (!req.user?.isSuperAdmin) {
      return { success: 0, message: 'Super admin access required' };
    }
    return this.authService.resetPasswordBySuperAdmin(targetUserId, body.newPassword);
  }

  @Get('get-user-permissions')
  async getUserPermissions(@Req() req: Request) {
    return this.authService.getUserPermissions(req);
  }

  @Get('profile-with-capabilities')
  async getProfileWithCapabilities(@Req() req: Request) {
    return this.authService.getProfileWithCapabilities(req);
  }

  @Public()
  @Post('restore-session')
  async restoreSession(
    @Res({ passthrough: true }) res: Response,
    @Body('token') token: string,
  ) {
    return this.authService.restoreSession(res, token);
  }
}

