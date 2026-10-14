import { testModuleConfig } from './test-module.module';
import { currencyModuleConfig } from './currency.module';
import { itemModuleConfig } from './item.module';
import { regionModuleConfig } from './region.module';
import { expenseModuleConfig } from './expense.module';
import { departmentModuleConfig } from './department.module';

export const MODULE_REGISTRY = {
  currency: currencyModuleConfig,
  item: itemModuleConfig,
  region: regionModuleConfig,
  expense: expenseModuleConfig,
  department: departmentModuleConfig,
};

export function getModule(slug) {
  return MODULE_REGISTRY[slug] || null;
}
