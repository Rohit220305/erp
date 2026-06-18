/**
 * Shape of the decoded JWT payload attached to every authenticated request.
 * Available via `req.user` in controllers and guards.
 */
export interface JwtPayload {
  /** User primary key */
  sub: number;
  email: string;
  companyId: number;
  groupId: number;
  isSuperAdmin: boolean;
  /** Issued-at timestamp (Unix epoch, added by JwtService) */
  iat: number;
  /** Expiry timestamp (Unix epoch, added by JwtService) */
  exp: number;
}
