import { CAPABILITIES } from "./capabilities.config";

export const routePermissions = [
  { pattern: /^\/company\/?$/, capability: CAPABILITIES.COMPANY.LIST },
  { pattern: /^\/company\/add$/, capability: CAPABILITIES.COMPANY.CREATE },
  { pattern: /^\/company\/edit\/\d+$/, capability: CAPABILITIES.COMPANY.UPDATE },
  { pattern: /^\/company\/\d+$/, capability: CAPABILITIES.COMPANY.VIEW },

  { pattern: /^\/admin\/?$/, capability: CAPABILITIES.USER.LIST },
  { pattern: /^\/admin\/add$/, capability: CAPABILITIES.USER.CREATE },
  { pattern: /^\/admin\/edit\/\d+$/, capability: CAPABILITIES.USER.UPDATE },
  { pattern: /^\/admin\/\d+$/, capability: CAPABILITIES.USER.VIEW },

  { pattern: /^\/group\/?$/, capability: CAPABILITIES.GROUP.LIST },
  { pattern: /^\/group\/add$/, capability: CAPABILITIES.GROUP.CREATE },
  { pattern: /^\/group\/edit\/\d+$/, capability: CAPABILITIES.GROUP.UPDATE },
  { pattern: /^\/group\/\d+$/, capability: CAPABILITIES.GROUP.VIEW },

  { pattern: /^\/currency\/?$/, capability: CAPABILITIES.CURRENCY.LIST },
  { pattern: /^\/currency\/add$/, capability: CAPABILITIES.CURRENCY.CREATE },
  { pattern: /^\/currency\/edit\/\d+$/, capability: CAPABILITIES.CURRENCY.UPDATE },
  { pattern: /^\/currency\/\d+$/, capability: CAPABILITIES.CURRENCY.VIEW },

  { pattern: /^\/work-centre-category\/?$/, capability: CAPABILITIES.WORK_CENTRE_CATEGORY.LIST },
  { pattern: /^\/work-centre-category\/add$/, capability: CAPABILITIES.WORK_CENTRE_CATEGORY.CREATE },
  { pattern: /^\/work-centre-category\/edit\/[a-zA-Z0-9-]+$/, capability: CAPABILITIES.WORK_CENTRE_CATEGORY.UPDATE },
  { pattern: /^\/work-centre-category\/[a-zA-Z0-9-]+$/, capability: CAPABILITIES.WORK_CENTRE_CATEGORY.VIEW },

  { pattern: /^\/package-master\/?$/, capability: CAPABILITIES.PACKAGE.LIST },
  { pattern: /^\/package-master\/add$/, capability: CAPABILITIES.PACKAGE.CREATE },
  { pattern: /^\/package-master\/edit\/[a-zA-Z0-9-]+$/, capability: CAPABILITIES.PACKAGE.UPDATE },
  { pattern: /^\/package-master\/[a-zA-Z0-9-]+$/, capability: CAPABILITIES.PACKAGE.VIEW },

  { pattern: /^\/manufacturer\/?$/, capability: CAPABILITIES.MANUFACTURER.LIST },
  { pattern: /^\/manufacturer\/add$/, capability: CAPABILITIES.MANUFACTURER.CREATE },
  { pattern: /^\/manufacturer\/edit\/[a-zA-Z0-9-]+$/, capability: CAPABILITIES.MANUFACTURER.UPDATE },
  { pattern: /^\/manufacturer\/[a-zA-Z0-9-]+$/, capability: CAPABILITIES.MANUFACTURER.VIEW },
];
