export const getChangedValues = (updated: any, original: any) => {
  const changed: any = {};

  for (const key in updated) {
    if (updated.hasOwnProperty(key) && original[key] !== updated[key]) {
      changed[key] = updated[key];
    }
  }

  return changed;
};
