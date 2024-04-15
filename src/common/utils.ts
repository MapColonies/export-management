export class TimeoutError extends Error { }

export const promiseTimeout = async <T>(ms: number, promise: Promise<T>): Promise<T> => {
  // Create a promise that rejects in <ms> milliseconds
  const timeout = new Promise<T>((_, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new TimeoutError(`Timed out in + ${ms} + ms.`));
    }, ms);
  });

  // Returns a race between our timeout and the passed in promise
  return Promise.race([promise, timeout]);
};

export const unionArrays = <T>(array1: T[], array2: T[]): T[] => {
  return [...new Set<T>([...array1, ...array2])];
}

export const omit = (obj: any, keys: string[]) => Object.keys(obj).filter(k => !keys.includes(k)).reduce((res, k) => Object.assign(res, { [k]: obj[k] }), {});
