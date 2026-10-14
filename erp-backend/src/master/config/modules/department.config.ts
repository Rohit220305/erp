import { MasterModuleConfig } from '../../interfaces/master-module.interface';

export const DepartmentConfig: MasterModuleConfig = {
    label: 'Department',
    tableName: 'department_master',
    tableAlias: 'department',
    defaultSort: 'department.name',
    nameField: 'name',

    fields: {
        name: {
            type: 'string',
            required: true,
            maxLength: 255,
        },
        code: {
            type: 'string',
            required: true,
            maxLength: 255,
        },
        slug: {
            type: 'string',
            required: true,
            maxLength: 255,
        },
    },

    uniqueFields: [
        ['companyId', 'code'],
        ['companyId', 'name'],
        ['companyId', 'slug'],
    ],
};
