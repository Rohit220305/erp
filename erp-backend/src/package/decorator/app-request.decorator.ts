import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AppRequest as IAppRequest } from '../types/app-request.type';

export const AppRequest = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IAppRequest => {
    const request = ctx.switchToHttp().getRequest();
    return {
      user: request.user,
      ip: request.ip,
      cookies: request.cookies,
      headers: request.headers,
    };
  },
);
