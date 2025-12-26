const trimTrailingSlashes = (value = "") => value.replace(/\/+$/, "");
const trimLeadingSlashes = (value = "") => value.replace(/^\/+/, "");

const rawApiBase = trimTrailingSlashes(import.meta.env.VITE_API_BASE_URL || "https://gym-5we7.onrender.com");
console.log('API Base URL:', rawApiBase);
const API_BASE = rawApiBase || "/api";

const defaultOrigin =
  typeof window !== "undefined" && window.location
    ? window.location.origin
    : "";

const backendOrigin = API_BASE.startsWith("http")
  ? new URL(API_BASE).origin
  : defaultOrigin;

const socketBase =
  trimTrailingSlashes(import.meta.env.VITE_SOCKET_URL || "") || backendOrigin;

export const buildApiUrl = (path = "") =>
  `${API_BASE}/${trimLeadingSlashes(path)}`;

export const socketBaseUrl = socketBase;
export const assetsBaseUrl =
  trimTrailingSlashes(import.meta.env.VITE_ASSETS_BASE_URL || "") ||
  backendOrigin;
export { backendOrigin };
