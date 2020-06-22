export function traverse(obj, fn, convertValue) {
  if (typeof obj === "string") {
    if (convertValue) {
      return fn(obj);
    }
    return obj;
  }
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    const arr = [];
    for (let i = 0; i < obj.length; i++) {
      arr.push(traverse(obj[i], fn, convertValue));
    }
    return arr;
  }
  const result = {};
  Object.keys(obj).forEach((k) => {
    result[fn(k)] = traverse(obj[k], fn, convertValue);
  });
  return result;
}

export function snakeCase(key) {
  return key.replace("-", "_").replace(/[A-Z]/g, (e) => `_${e.toLowerCase()}`);
}

export function snakeCaseKeyValue(obj) {
  return traverse(obj, snakeCase, true);
}

export function camelCase(key) {
  return key.replace("-", "_").replace(/_[a-zA-Z]/g, (e) => `${e.replace("_", "").toUpperCase()}`);
}

export function camelCaseKey(obj) {
  return traverse(obj, camelCase, false);
}
