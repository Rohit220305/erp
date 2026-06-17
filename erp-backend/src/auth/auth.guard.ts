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

/**
 * Global JWT Auth Guard.
 *
 * A route is treated as public (no token required) when EITHER:
 *  1. It is decorated with @Public()                — preferred, declarative
 *  2. Its path matches an entry in FALLBACK_PUBLIC_PATHS — for dynamic/static paths
 */

/** Paths that are always public regardless of @Public() decorator */
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
    // ── Strategy 1: @Public() decorator ──────────────────────────────────────
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // ── Strategy 2: Fallback configurable path list ───────────────────────────
    const request = context.switchToHttp().getRequest<Request>();
    const isPublicPath = FALLBACK_PUBLIC_PATHS.some((pattern) =>
      pattern.test(request.path),
    );
    if (isPublicPath) return true;

    // ── JWT Verification ──────────────────────────────────────────────────────
    const token = request.cookies?.accessToken;
    if (!token) {
      throw new UnauthorizedException('Access token missing');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_SECRET'),
      });

      // Attach full typed payload so controllers can use req.user
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
