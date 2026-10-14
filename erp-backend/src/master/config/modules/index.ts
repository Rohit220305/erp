import { MasterModulesRegistry } from '../../interfaces/master-module.interface';
import { DepartmentConfig } from './department.config';
import { ExpenseConfig } from './expense.config';
import { RegionConfig } from './region.config';
export const AllMasterConfigs: MasterModulesRegistry = {
  region: RegionConfig,
  expense: ExpenseConfig,
  department: DepartmentConfig,
};
