import { JwtPayload } from './jwt-payload.type';

export interface AppRequest {
  user?: JwtPayload;
  ip?: string;
  cookies?: Record<string, string>;
  headers?: {
    'user-agent'?: string;
    [key: string]: string | string[] | undefined;
  };
}
