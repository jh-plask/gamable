export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};

/**
 * Deeply merges two objects, with the source taking precedence over the target.
 * @param target - The target object to merge into.
 * @param source - The source object to merge from.
 * @returns A new object with the merged properties.
 */
export function deepMerge<T>(
  target: T,
  source: DeepPartial<T>
): T {
  if (
    typeof target !== "object" ||
    target === null
  ) {
    return source as T;
  }
  if (
    typeof source !== "object" ||
    source === null
  ) {
    return target;
  }

  const result: any = Array.isArray(target)
    ? [...target]
    : { ...target };

  for (const key in source) {
    if (
      !Object.prototype.hasOwnProperty.call(
        source,
        key
      )
    )
      continue;
    const sourceValue = (source as any)[key];
    const targetValue = (target as any)[key];

    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue,
        sourceValue
      );
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue;
    }
  }

  return result;
}
