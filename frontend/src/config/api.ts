import { getActiveBackend } from './endpoints';

// Central API helpers
export const API_BASE = getActiveBackend();

export function apiUrl(path: string) {
  if (!path.startsWith("/")) path = "/" + path;
  return `${API_BASE}${path}`;
}

export function uploadUrl(filename: string, folder: string) {
  if (!filename) return "";
  if (/^https?:\/\//i.test(filename)) return filename;
  return `${API_BASE}/uploads/${folder}/${filename}`;
}

export default {
  API_BASE,
  apiUrl,
  uploadUrl,
};
