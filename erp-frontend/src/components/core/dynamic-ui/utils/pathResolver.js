/**
 * Resolves a dot-notation path on a given object.
 * Returns the value if it exists, or undefined if not.
 * 
 * @param {Object} obj The object to query
 * @param {String} path The dot-notation path (e.g., 'owner.name')
 * @returns {*} The resolved value, or undefined
 */
export const resolvePath = (obj, path) => {
  if (!obj || !path) return undefined;
  
  // Directly access if path doesn't contain dots
  if (!path.includes('.')) return obj[path];
  
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : undefined, obj);
};
