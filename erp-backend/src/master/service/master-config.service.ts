import { Injectable, NotFoundException } from '@nestjs/common';
import { MasterModuleConfig } from '../interfaces/master-module.interface';
import { AllMasterConfigs } from '../config/modules';

@Injectable()
export class MasterConfigService {
  private registry: Map<string, MasterModuleConfig> = new Map();

  constructor() {
    for (const [moduleKey, config] of Object.entries(AllMasterConfigs)) {
      this.registry.set(moduleKey.toLowerCase(), config);
    }
  }

  getConfig(module: string): MasterModuleConfig {
    const key = (module || '').toLowerCase();
    const config = this.registry.get(key);

    if (!config) {
      throw new NotFoundException(`Master module '${module}' not found.`);
    }

    return config;
  }

  getAllModules(): string[] {
    return Array.from(this.registry.keys());
  }
}
