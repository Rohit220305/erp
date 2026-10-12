export interface MasterFieldConfig {
  type: 'string' | 'number' | 'enum';
  required: boolean;
  maxLength?: number;
  enumValues?: string[];
}

export interface MasterFkRef {
  field: string;
  refTable: string;
  refLabelField: string;
  crossTenant: boolean;
}

export interface MasterJoin {
  table: string;
  alias: string;
  on: string;
  select: Record<string, string>;
}

export interface MasterModuleConfig {
  label: string;
  tableName: string;
  tableAlias: string;
  defaultSort: string;
  nameField: string;
  fields: Record<string, MasterFieldConfig>;
  uniqueFields: string[][];
  fkRefs?: MasterFkRef[];
  joins?: MasterJoin[];
}

export type MasterModulesRegistry = Record<string, MasterModuleConfig>;
