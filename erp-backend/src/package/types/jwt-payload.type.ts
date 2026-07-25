
export interface JwtPayload {
  sub: number;
  email: string;
  companyId: number;
  groupId: number;
  isSuperAdmin: boolean;
  impersonatorId?: number;
  iat: number;
  exp: number;
}
