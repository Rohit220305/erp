import { Body, Controller, Get, Post,  Res, Param, ParseIntPipe } from '@nestjs/common';
import { AppRequest } from 'src/package/decorator/app-request.decorator';
import type { AppRequest as IAppRequest } from 'src/package/types/app-request.type';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from 'src/package/decorator/decorator.public';
import { JwtPayload } from 'src/package/types/jwt-payload.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('login')
  async login(
    @AppRequest() req: IAppRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() body: LoginDto,
  ) {
    return this.authService.login(req, res, body);
  }

  @Public()
  @Post('select-profile')
  async selectProfile(
    @AppRequest() req: IAppRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() body: { selectionToken: string; groupId: number },
  ) {
    return this.authService.selectProfile(req, res, body);
  }

  @Post('switch-profile')
  async switchProfile(
    @AppRequest() req: IAppRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() body: { groupId: number },
  ) {
    return this.authService.switchProfile(req, res, body);
  }

  @Public()
  @Post('refresh')
  async refresh(
    @AppRequest() req: IAppRequest,
    @Res({ passthrough: true }) res: Response,
  ) {

    return this.authService.refresh(req, res);
  }

  @Post('logout')
  async logout(
    @AppRequest() req: IAppRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(req, res);
  }


  @Post('login-as-user/:targetUserId')
  async loginAsUser(
    @AppRequest() req: IAppRequest,
    @Res({ passthrough: true }) res: Response,
    @Param('targetUserId', ParseIntPipe) targetUserId: number,
  ) {
    if (!req.user?.isSuperAdmin) {
      return { success: 0, message: 'Super admin access required' };
    }
    return this.authService.loginAsUser(req, res, targetUserId);
  }


  @Post('change-password')
  async changePassword(
    @AppRequest() req: IAppRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      req.user!.sub,
      dto.currentPassword,
      dto.newPassword,
      dto.confirmPassword,
    );
  }

  @Post('reset-password/:targetUserId')
  async resetPassword(
    @AppRequest() req: IAppRequest,
    @Param('targetUserId', ParseIntPipe) targetUserId: number,
    @Body() body: any,
  ) {
    if (!req.user?.isSuperAdmin) {
      return { success: 0, message: 'Super admin access required' };
    }
    return this.authService.resetPasswordBySuperAdmin(req, targetUserId, body.newPassword);
  }

  @Get('get-user-permissions')
  async getUserPermissions(@AppRequest() req: IAppRequest,) {
    return this.authService.getUserPermissions(req);
  }

  @Get('profile-with-capabilities')
  async getProfileWithCapabilities(@AppRequest() req: IAppRequest,) {
    return this.authService.getProfileWithCapabilities(req);
  }

  @Post('back-to-session')
  async backToSession(
    @AppRequest() req: IAppRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.backToSession(req, res);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyOtp(body.email, body.otp);
  }

  @Public()
  @Post('reset-password-otp')
  async resetPasswordOtp(@Body() body: { email: string; otp: string; newPassword: string }) {
    return this.authService.resetPassword(body.email, body.otp, body.newPassword);
  }
}

