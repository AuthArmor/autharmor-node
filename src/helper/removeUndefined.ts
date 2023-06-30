export const removeUndefined = (obj: any): any => {
  if (Object.keys(obj).length > 0) {
    Object.keys(obj).map(key =>
      obj[key] === undefined ? delete obj[key] : obj[key]
    );
    return obj;
  }
  return {};
};
