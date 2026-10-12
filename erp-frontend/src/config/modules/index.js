import { testModuleConfig } from './test-module.module';
import { currencyModuleConfig } from './currency.module';
import { itemModuleConfig } from './item.module';
import { regionModuleConfig } from './region.module';

export const MODULE_REGISTRY = {
  'test-module': testModuleConfig,
  'currency': currencyModuleConfig,
  'item': itemModuleConfig,
  'region': regionModuleConfig,
  'sample': {moduleName: 'Sample Module'},
};

export function getModule(slug) {
  return MODULE_REGISTRY[slug] || null;
}
