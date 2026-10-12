import { MasterModuleConfig } from '../../interfaces/master-module.interface';

export const RegionConfig: MasterModuleConfig = {
  label: 'Region',
  tableName: 'region_master',
  tableAlias: 'region',
  defaultSort: 'region.regionName',
  nameField: 'regionName',

  fields: {
    regionName: {
      type: 'string',
      required: true,
      maxLength: 255,
    },
    regionCode: {
      type: 'string',
      required: true,
      maxLength: 100,
    },
    description: {
      type: 'string',
      required: false,
      maxLength: 500,
    },
  },

  uniqueFields: [
    ['companyId', 'regionCode'],
    ['companyId', 'regionName'],
  ],
};
