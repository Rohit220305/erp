import { Injectable } from '@nestjs/common';
import { AppRequest as IAppRequest } from 'src/package/types/app-request.type';

@Injectable()
export class PermissionCacheService {
  private cache = new Map<string, string[]>();

  private getCacheKey(groupId: number): string {
    return `permissions:group:${groupId}`;
  }

  async getPermissions(groupId: number): Promise<string[] | null> {
    const key = this.getCacheKey(groupId);
    if (this.cache.has(key)) {
      return this.cache.get(key) || null;
    }
    return null;
  }

  async setPermissions(groupId: number, permissions: string[]): Promise<void> {
    const key = this.getCacheKey(groupId);
    this.cache.set(key, permissions);
  }

  async invalidatePermissions(groupId: number): Promise<void> {
    const key = this.getCacheKey(groupId);
    this.cache.delete(key);
  }
}
