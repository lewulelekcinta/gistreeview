export const BACKEND_ENDPOINTS = {
  LOCAL: "http://localhost:4000",
  PRODUCTION: "https://gistreeview-lyart.vercel.app",
} as const;

export type BackendEndpoint = keyof typeof BACKEND_ENDPOINTS;

// Get active backend URL from localStorage or default to LOCAL
export const getActiveBackend = (): string => {
  const saved = localStorage.getItem("active_backend");
  if (saved && saved in BACKEND_ENDPOINTS) {
    return BACKEND_ENDPOINTS[saved as BackendEndpoint];
  }
  return BACKEND_ENDPOINTS.LOCAL;
};

// Save active backend selection to localStorage
export const setActiveBackend = (endpoint: BackendEndpoint): void => {
  localStorage.setItem("active_backend", endpoint);
};