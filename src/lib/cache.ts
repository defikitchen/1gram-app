import { maxCacheTime } from "./constants";

const namespace = "tb.";

export function getCache<T = any>(key: string, defaultValue: T) {
  return JSON.parse(
    localStorage.getItem(namespace + key) || JSON.stringify(defaultValue)
  ) as T;
}

export function setCache(key: string, value: any = null) {
  localStorage.setItem(namespace + key, JSON.stringify(value));
}

export function getSession<T = any>(key: string, defaultValue: T) {
  return JSON.parse(
    sessionStorage.getItem(namespace + key) || JSON.stringify(defaultValue)
  ) as T;
}

export function setSession(key: string, value: any = null) {
  sessionStorage.setItem(namespace + key, JSON.stringify(value));
}

export const fromCache = (
  time?: string | number | null | Date,
  _maxCacheTime = maxCacheTime
) => new Date(time || 0).getTime() + _maxCacheTime > new Date().getTime();
