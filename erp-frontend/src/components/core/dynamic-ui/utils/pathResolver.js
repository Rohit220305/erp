export const resolvePath = (obj, path) => {
  if (!obj || !path) return undefined;

  const keys = path.split(".");
  let result = obj;

  for (const key of keys) {
    if (result == null) return undefined;
    result = result[key];
  }

  return result;
};

export const resolveDynamicRoute = (path, data) => {
  if (!path) return "#";
  if (!data) return path;

  return path.replace(/\{([^}]+)\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
};
