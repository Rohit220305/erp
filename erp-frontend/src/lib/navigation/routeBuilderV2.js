import { MODULE_REGISTRY } from '@/config/modules';
import { buildRoute as legacyBuildRoute } from './routeBuilder';

export function buildRoute(moduleName, action = "list", params = {}) {
  
  const registryEntries = Object.values(MODULE_REGISTRY);
  const config = registryEntries.find(
    c => c.moduleName === moduleName || 
         c.identity?.slug === moduleName || 
         c.moduleName?.toLowerCase().replace(/\s+/g, '-') === moduleName
  );
  
  if (config) {
    const slug = config.identity?.slug || config.moduleName?.toLowerCase().replace(/\s+/g, '-');
    let path = '';
    
    switch (action) {
      case 'list':
        path = `/${slug}`;
        break;
      case 'add':
        path = `/${slug}/add`;
        break;
      case 'edit':
        path = `/${slug}/edit/{id}`;
        break;
      case 'detail':
        path = `/${slug}/{id}`;
        break;
      default:
        
        return legacyBuildRoute(moduleName, action, params);
    }

    const usedParams = new Set();
    const finalPath = path.replace(/\{(\w+)\}/g, (_, paramKey) => {
      if (params[paramKey] !== undefined && params[paramKey] !== null) {
        usedParams.add(paramKey);
        return encodeURIComponent(params[paramKey]);
      }
      return `{${paramKey}}`; 
    });

    const queryParts = [];
    for (const [k, v] of Object.entries(params)) {
      if (!usedParams.has(k) && v !== undefined && v !== null && v !== "") {
        queryParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
      }
    }

    return queryParts.length > 0 ? `${finalPath}?${queryParts.join("&")}` : finalPath;
  }

  return legacyBuildRoute(moduleName, action, params);
}
