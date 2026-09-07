import { CAPABILITIES } from "./capabilities.config";

const routes = [
  { path: "/company", permission: CAPABILITIES.COMPANY.LIST },
  { path: "/company/add", permission: CAPABILITIES.COMPANY.CREATE },
  { path: "/company/edit/:id", permission: CAPABILITIES.COMPANY.UPDATE },
  { path: "/company/:id", permission: CAPABILITIES.COMPANY.VIEW },

  { path: "/user", permission: CAPABILITIES.USER.LIST },
  { path: "/user/add", permission: CAPABILITIES.USER.CREATE },
  { path: "/user/edit/:id", permission: CAPABILITIES.USER.UPDATE },
  { path: "/user/:id", permission: CAPABILITIES.USER.VIEW },

  { path: "/group", permission: CAPABILITIES.GROUP.LIST },
  { path: "/group/add", permission: CAPABILITIES.GROUP.CREATE },
  { path: "/group/edit/:id", permission: CAPABILITIES.GROUP.UPDATE },
  { path: "/group/:id", permission: CAPABILITIES.GROUP.VIEW },

  { path: "/currency", permission: CAPABILITIES.CURRENCY.LIST },
  { path: "/currency/add", permission: CAPABILITIES.CURRENCY.CREATE },
  { path: "/currency/edit/:id", permission: CAPABILITIES.CURRENCY.UPDATE },
  { path: "/currency/:id", permission: CAPABILITIES.CURRENCY.VIEW },

  { path: "/work-centre-category", permission: CAPABILITIES.WORK_CENTRE_CATEGORY.LIST },
  { path: "/work-centre-category/add", permission: CAPABILITIES.WORK_CENTRE_CATEGORY.CREATE },
  { path: "/work-centre-category/edit/:id", permission: CAPABILITIES.WORK_CENTRE_CATEGORY.UPDATE },
  { path: "/work-centre-category/:id", permission: CAPABILITIES.WORK_CENTRE_CATEGORY.VIEW },

  { path: "/manufacturer", permission: CAPABILITIES.MANUFACTURER.LIST },
  { path: "/manufacturer/add", permission: CAPABILITIES.MANUFACTURER.CREATE },
  { path: "/manufacturer/edit/:id", permission: CAPABILITIES.MANUFACTURER.UPDATE },
  { path: "/manufacturer/:id", permission: CAPABILITIES.MANUFACTURER.VIEW },

  { path: "/storage", permission: CAPABILITIES.STORAGE.LIST },
  { path: "/storage/add", permission: CAPABILITIES.STORAGE.CREATE },
  { path: "/storage/edit/:id", permission: CAPABILITIES.STORAGE.UPDATE },
  { path: "/storage/:id", permission: CAPABILITIES.STORAGE.VIEW },

  { path: "/item-category", permission: CAPABILITIES.ITEM_CATEGORY.LIST },
  { path: "/item-category/add", permission: CAPABILITIES.ITEM_CATEGORY.CREATE },
  { path: "/item-category/edit/:id", permission: CAPABILITIES.ITEM_CATEGORY.UPDATE },
  { path: "/item-category/:id", permission: CAPABILITIES.ITEM_CATEGORY.VIEW },

  { path: "/package", permission: CAPABILITIES.PACKAGE.LIST },
  { path: "/package/add", permission: CAPABILITIES.PACKAGE.CREATE },
  { path: "/package/edit/:id", permission: CAPABILITIES.PACKAGE.UPDATE },
  { path: "/package/:id", permission: CAPABILITIES.PACKAGE.VIEW },

  { path: "/item-uom", permission: CAPABILITIES.ITEM_UOM.LIST },
  { path: "/item-uom/add", permission: CAPABILITIES.ITEM_UOM.CREATE },
  { path: "/item-uom/edit/:id", permission: CAPABILITIES.ITEM_UOM.UPDATE },
  { path: "/item-uom/:id", permission: CAPABILITIES.ITEM_UOM.VIEW },

  { path: "/process", permission: CAPABILITIES.PROCESS_TEMPLATE.LIST },
  { path: "/process/add", permission: CAPABILITIES.PROCESS_TEMPLATE.CREATE },
  { path: "/process/edit/:id", permission: CAPABILITIES.PROCESS_TEMPLATE.UPDATE },
  { path: "/process/:id", permission: CAPABILITIES.PROCESS_TEMPLATE.VIEW },

  { path: "/process-template", permission: CAPABILITIES.PROCESS_TEMPLATE.LIST },
  { path: "/process-template/add", permission: CAPABILITIES.PROCESS_TEMPLATE.CREATE },
  { path: "/process-template/edit/:id", permission: CAPABILITIES.PROCESS_TEMPLATE.UPDATE },
  { path: "/process-template/:id", permission: CAPABILITIES.PROCESS_TEMPLATE.VIEW },


  { path: "/brand", permission: CAPABILITIES.BRAND.LIST },
  { path: "/brand/add", permission: CAPABILITIES.BRAND.CREATE },
  { path: "/brand/edit/:id", permission: CAPABILITIES.BRAND.UPDATE },
  { path: "/brand/:id", permission: CAPABILITIES.BRAND.VIEW },

  { path: "/work-centre", permission: CAPABILITIES.WORK_CENTRE.LIST },
  { path: "/work-centre/add", permission: CAPABILITIES.WORK_CENTRE.CREATE },
  { path: "/work-centre/edit/:id", permission: CAPABILITIES.WORK_CENTRE.UPDATE },
  { path: "/work-centre/:id", permission: CAPABILITIES.WORK_CENTRE.VIEW },

  { path: "/item", permission: CAPABILITIES.ITEM.LIST },
  { path: "/item/add", permission: CAPABILITIES.ITEM.CREATE },
  { path: "/item/edit/:id", permission: CAPABILITIES.ITEM.UPDATE },
  { path: "/item/:id", permission: CAPABILITIES.ITEM.VIEW },

  { path: "/bom", permission: CAPABILITIES.BOM.LIST },
  { path: "/bom/add", permission: CAPABILITIES.BOM.CREATE },
  { path: "/bom/edit/:id", permission: CAPABILITIES.BOM.UPDATE },
  { path: "/bom/:id", permission: CAPABILITIES.BOM.VIEW },

  { path: "/production-order", permission: CAPABILITIES.PRODUCTION_ORDER.LIST },
  { path: "/production-order/add", permission: CAPABILITIES.PRODUCTION_ORDER.CREATE },
  { path: "/production-order/edit/:id", permission: CAPABILITIES.PRODUCTION_ORDER.UPDATE },
  { path: "/production-order/:id", permission: CAPABILITIES.PRODUCTION_ORDER.VIEW },

  { path: "/production-batch", permission: CAPABILITIES.PRODUCTION_BATCH.LIST },
  { path: "/production-batch/create/:id", permission: CAPABILITIES.PRODUCTION_BATCH.CREATE },
  { path: "/production-batch/:id", permission: CAPABILITIES.PRODUCTION_BATCH.VIEW },

  { path: "/admin", permission: CAPABILITIES.USER.LIST },
];

export const routePermissions = routes.map((route) => ({
  pattern: new RegExp(`^${route.path.replace(":id", "[^/]+")}$`),
  capability: route.permission,
}));
