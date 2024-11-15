export function merge(
  obj1: Record<string, any>,
  obj2: Record<string, any>,
): Record<string, any> {
  return Object.keys(obj1)
    .map((key) => ({ [key]: { ...obj1[key], ...obj2[key] } }))
    .reduce((acc, val) => ({ ...acc, ...val }), {});
}
