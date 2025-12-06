export function strip<T extends object, K extends keyof T>(
  item: T,
  allowed: readonly K[],
): Pick<T, K>;

export function strip<T extends object, K extends keyof T>(
  item: T[],
  allowed: readonly K[],
): Array<Pick<T, K>>;

export function strip<T extends object, K extends keyof T>(
  item: T | T[],
  allowed: readonly K[],
) {
  if (Array.isArray(item)) {
    // Returns Pick<T,K>[]
    return item.map((i) => strip(i, allowed));
  }

  // Returns Pick<T,K>
  const obj = {} as Pick<T, K>;

  for (const key of allowed) {
    obj[key] = item[key];
  }

  return obj;
}
