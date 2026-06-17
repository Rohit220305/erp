import { Body, Controller, Post, Req, Res, Param, ParseIntPipe } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from 'src/package/decorator/decorator.public';
import { JwtPayload } from 'src/package/types/jwt-payload.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Public — no token rquired */
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
  // @Post('login-as-user/:targetUserId')
  // async loginAsUser(
  //   @Req() req: Request & { user: JwtPayload },
  //   @Res({ passthrough: true }) res: Response,
  //   @Param('targetUserId', ParseIntPipe) targetUserId: number,
  // ) {
  //   if (!req.user?.isSuperAdmin) {
  //     return { success: 0, message: 'Super admin access required' };
  //   }
  //   return this.authService.loginAsUser(res, targetUserId);
  // }
}
