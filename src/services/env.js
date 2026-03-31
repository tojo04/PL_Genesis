export function readEnv(key, fallback = '') {
  if (typeof import.meta !== 'undefined' && import.meta.env && key in import.meta.env) {
    return import.meta.env[key] || fallback;
  }

  if (typeof process !== 'undefined' && process.env && key in process.env) {
    return process.env[key] || fallback;
  }

  return fallback;
}
