export const generateUniqueId = (): number => {
  const date = new Date();
  const utcDateTime = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getMilliseconds()
  );
  return utcDateTime;
};
