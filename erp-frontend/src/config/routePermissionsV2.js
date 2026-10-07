import { MODULE_REGISTRY } from './modules';
import { routePermissions as legacyRoutePermissions } from './routePermissions';

const dynamicRoutePermissions = [];

Object.values(MODULE_REGISTRY).forEach((config) => {
  if (config.permissions && config.permissions.list) {
    const slug = config.identity?.slug || config.moduleName?.toLowerCase().replace(/\s+/g, '-');
    
    dynamicRoutePermissions.push({
      pattern: new RegExp(`^/${slug}$`),
      capability: config.permissions.list
    });
    
    if (config.permissions.create) {
      dynamicRoutePermissions.push({
        pattern: new RegExp(`^/${slug}/add$`),
        capability: config.permissions.create
      });
    }
    
    if (config.permissions.update) {
      dynamicRoutePermissions.push({
        pattern: new RegExp(`^/${slug}/edit/[^/]+$`),
        capability: config.permissions.update
      });
    }
    
    if (config.permissions.view) {
      dynamicRoutePermissions.push({
        pattern: new RegExp(`^/${slug}/[^/]+$`),
        capability: config.permissions.view
      });
    }
  }
});

export const routePermissions = [...legacyRoutePermissions, ...dynamicRoutePermissions];
