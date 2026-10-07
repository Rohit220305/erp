import { testModuleConfig } from './test-module.module';
import { currencyModuleConfig } from './currency.module';
import { itemModuleConfig } from './item.module';

export const MODULE_REGISTRY = {
  'test-module': testModuleConfig,
  'currency': currencyModuleConfig,
  'item': itemModuleConfig,
  'sample': {moduleName: 'Sample Module'},
};

export function getModule(slug) {
  return MODULE_REGISTRY[slug] || null;
}
