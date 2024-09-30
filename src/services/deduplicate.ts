export function deduplicate<T extends Record<string, any>>(array: T[], key: string): T[] {
  const getValueByPath = (obj: T, path: string): any => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  return array.filter((value, index, self) => 
    self.findIndex((t) => getValueByPath(t, key) === getValueByPath(value, key)) === index
  );
}
