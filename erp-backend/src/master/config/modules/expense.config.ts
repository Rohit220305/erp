import { MasterModuleConfig } from "src/master/interfaces/master-module.interface";


export const ExpenseConfig: MasterModuleConfig = {
    label: 'Expense',
    tableName: 'expense_master',
    tableAlias: 'expense',
    defaultSort: 'expense.name',
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
        type: {
            type: 'enum',
            required: true,
            enumValues: ['Hourly', 'Fixed', 'Other'],
        },
        amount: {
            type: 'number',
            required: true,
        },
        remark: {
            type: 'string',
            required: false,
            
        }
    },
    uniqueFields: [
        ['companyId', 'code'],
        ['companyId', 'name']
    ]
}