import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Repository } from 'typeorm/browser/repository/Repository.js';
import { ModSettingEntity } from '../entity/mod-setting.entity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { Status } from 'src/package/common/enums/enum';

@Injectable()
export class ModSettingCacheService implements OnApplicationBootstrap {
  private cache = new Map<string, string>();

  constructor(
    @InjectRepository(ModSettingEntity)
    private readonly modSettingRepo: Repository<ModSettingEntity>,
  ) {}

  async onApplicationBootstrap() {
    await this.loadAllSettings();
  }

  private async loadAllSettings() {
    try {
      const settings = await this.modSettingRepo.find({
        where: { status: Status.Active, sysRecDeleted: false },
      });

      for (const setting of settings) {
        this.cache.set(setting.code, setting.value);
      }
    } catch (error) {
      console.log('Error loading mod settings:', error);
    }
  }

  getValue(code: string): string | null {
    if (this.cache.has(code)) {
      return this.cache.get(code) || null;
    }
    return null;
  }

  async refreshCache(): Promise<void> {
    await this.loadAllSettings();
  }
    
    
    
}
