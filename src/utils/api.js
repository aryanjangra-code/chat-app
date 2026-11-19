import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");

if (!rawApiUrl) {
  throw new Error("VITE_API_URL is required in production. Set it to your Render backend URL.");
}

export const API_URL = rawApiUrl.replace(/\/+$/, "");

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

function getCookie(name) {
  const prefix = `${name}=`;
  const item = document.cookie.split("; ").find((cookie) => cookie.startsWith(prefix));
  return item ? decodeURIComponent(item.slice(prefix.length)) : null;
}

api.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();
  if (!["get", "head", "options"].includes(method)) {
    const csrfToken = getCookie("gc_csrf");
    if (csrfToken) config.headers["X-CSRF-Token"] = csrfToken;
  }
  return config;
});

export const SOCKET_URL = API_URL;
