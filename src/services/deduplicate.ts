export function deduplicate<T extends Record<string, any>>(array: T[], key: string): T[] {
  return array.filter((value, index, self) => self.findIndex((t) => t[key] === value[key]) === index);
}