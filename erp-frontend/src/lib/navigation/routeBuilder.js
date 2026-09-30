const ROUTES = {
  home: { list: "/" },
  auth: { login: "/login", selectProfile: "/select-profile", forgotPassword: "/forgot-password" },
  settings: { changePassword: "/settings/change-password" },

  user: { list: "/admin", add: "/admin/add", edit: "/admin/edit/{id}", detail: "/admin/{id}", activityLogs: "/admin/activity-logs" },
  group: { list: "/group", add: "/group/add", edit: "/group/edit/{id}", detail: "/group/{id}" },
  company: { list: "/company", add: "/company/add", edit: "/company/{id}/edit-company", detail: "/company/{id}" },
  currency: { list: "/currency", add: "/currency/add", edit: "/currency/edit/{id}", detail: "/currency/{id}" },

  brand: { list: "/brand", add: "/brand/add", edit: "/brand/edit/{id}", detail: "/brand/{id}" },
  manufacturer: { list: "/manufacturer", add: "/manufacturer/add", edit: "/manufacturer/edit/{id}", detail: "/manufacturer/{id}" },
  "item-category": { list: "/item-category", add: "/item-category/add", edit: "/item-category/edit/{id}", detail: "/item-category/{id}" },
  item: { list: "/item", add: "/item/add", edit: "/item/edit/{id}", detail: "/item/{id}" },
  "item-uom": { list: "/item-uom", add: "/item-uom/add", edit: "/item-uom/edit/{id}", detail: "/item-uom/{id}" },
  "package-master": { list: "/package-master", add: "/package-master/add", edit: "/package-master/edit/{id}", detail: "/package-master/{id}" },
  storage: { list: "/storage", add: "/storage/add", edit: "/storage/edit/{id}", detail: "/storage/{id}" },

  "work-centre-category": { list: "/work-centre-category", add: "/work-centre-category/add", edit: "/work-centre-category/edit/{id}", detail: "/work-centre-category/{id}" },
  "work-centre": { list: "/work-centre", add: "/work-centre/add", edit: "/work-centre/edit/{id}", detail: "/work-centre/{id}" },
  process: { list: "/process", add: "/process/add", edit: "/process/edit/{id}", detail: "/process/{id}" },
  "process-template": { list: "/process-template", add: "/process-template/add", edit: "/process-template/edit/{id}", detail: "/process-template/{id}" },
  bom: { list: "/bom", add: "/bom/add", edit: "/bom/edit/{id}", detail: "/bom/{id}" },
  "production-order": { list: "/production-order", add: "/production-order/add", edit: "/production-order/edit/{id}", detail: "/production-order/{id}" },
  "production-batch": { list: "/production-batch", add: "/production-batch/create/{orderId}", edit: "/production-batch/edit/{id}", detail: "/production-batch/{id}", materialRequestCreate: "/production-batch/{id}/material-request/create" },
  "material-request": { list: "/material-request", add: "/material-request/add", edit: "/material-request/edit/{id}", detail: "/material-request/{id}" },
  "plant": { list: "/plant", add: "/plant/add", edit: "/plant/edit/{id}", detail: "/plant/{id}" },
  "customer-company": { list: "/customer-company", add: "/customer-company/add", edit: "/customer-company/edit/{id}", detail: "/customer-company/{id}" },
};


const ALIASES = {
  dashboard: "home",
  processtemplate: "process-template",
  itemcategory: "item-category",
  itemuom: "item-uom",
  package: "package-master",
  packagemaster: "package-master",
  workcentrecategory: "work-centre-category",
  workcentre: "work-centre",
  productionorder: "production-order",
  productionbatch: "production-batch",
  materialrequest: "material-request",
  plant: "plant",
};

function resolveModuleName(name) {
  if (!name) return name;
  if (ROUTES[name]) return name;

  const lower = name.toLowerCase();
  if (ROUTES[lower]) return lower;
  if (ALIASES[lower]) return ALIASES[lower];

  const kebab = name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  if (ROUTES[kebab]) return kebab;

  return name;
}

export function buildRoute(moduleName, action = "list", params = {}) {
  const key = resolveModuleName(moduleName);
  const moduleRoutes = ROUTES[key];
  if (!moduleRoutes) {
    throw new Error(`[routeBuilder] Unknown module "${moduleName}"`);
  }

  const pattern = moduleRoutes[action];
  if (!pattern) {
    throw new Error(`[routeBuilder] No "${action}" route defined for module "${moduleName}"`);
  }

  const usedParams = new Set();

  const path = pattern.replace(/\{(\w+)\}/g, (_, paramKey) => {
    if (params[paramKey] === undefined || params[paramKey] === null) {
      throw new Error(`[routeBuilder] Missing param "${paramKey}" for ${moduleName}.${action}`);
    }
    usedParams.add(paramKey);
    return encodeURIComponent(params[paramKey]);
  });

  const queryParts = [];
  for (const [k, v] of Object.entries(params)) {
    if (!usedParams.has(k) && v !== undefined && v !== null && v !== "") {
      queryParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    }
  }

  return queryParts.length > 0 ? `${path}?${queryParts.join("&")}` : path;
}
