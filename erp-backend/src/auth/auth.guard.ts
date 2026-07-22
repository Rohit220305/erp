import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/package/decorator/decorator.public';
import { JwtPayload } from 'src/package/types/jwt-payload.type';


const FALLBACK_PUBLIC_PATHS: RegExp[] = [
  /^\/uploads\//,   // static file serving
];

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {}
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const isPublicPath = FALLBACK_PUBLIC_PATHS.some((pattern) =>
      pattern.test(request.path),
    );
    if (isPublicPath) return true;

    const token = request.cookies?.accessToken;
    if (!token) {
      throw new UnauthorizedException('Access token missing');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });

      request['user'] = payload;
      return true;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Access token expired. Use /auth/refresh to renew.',
        );
      }
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
