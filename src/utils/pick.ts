export default function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
) {
  const newObj: Pick<T, K> = {} as Pick<T, K>;
  for (const key of keys) {
    newObj[key] = obj[key];
  }
  return newObj;
}
