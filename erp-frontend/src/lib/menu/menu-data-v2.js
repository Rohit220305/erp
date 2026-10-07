import { MODULE_REGISTRY } from '@/config/modules';
import { menuCategories as legacyMenuCategories } from './menu-data';

const mergedMenu = JSON.parse(JSON.stringify(legacyMenuCategories));

Object.values(MODULE_REGISTRY).forEach((config) => {
  if (!config.menu) return; 
  
  const { category, group, icon = "Settings" } = config.menu;
  const slug = config.identity?.slug || config.moduleName?.toLowerCase().replace(/\s+/g, '-');
  const routePath = `/${slug}`;
  
  let categoryNode = mergedMenu.find(c => c.category === category);
  if (!categoryNode) {
    categoryNode = { category, icon: icon, groups: [] };
    mergedMenu.push(categoryNode);
  }
  
  let groupNode = categoryNode.groups.find(g => g.title === group);
  if (!groupNode) {
    groupNode = { title: group, icon: icon, iconBg: "#1565c0", items: [] };
    categoryNode.groups.push(groupNode);
  }

  const existingItem = groupNode.items.find(i => i.path === routePath);
  if (!existingItem) {
    groupNode.items.push({
      label: config.moduleName,
      path: routePath,
      permission: config.permissions?.list
    });
  }
});

export const menuCategories = mergedMenu;
