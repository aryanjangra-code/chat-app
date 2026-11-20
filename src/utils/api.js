
import axios from "axios";

const rawApiUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : "");

if (!rawApiUrl) {
  throw new Error(
    "VITE_API_URL is required in production."
  );
}

export const API_URL = rawApiUrl.replace(/\/+$/, "");
export const SOCKET_URL = API_URL;

const REFRESH_STORAGE_KEY = "gc_refresh_token";

let accessToken = null;
let refreshPromise = null;

export const getAccessToken = () => accessToken;

export const setAuthTokens = ({ accessToken: nextAccessToken, refreshToken }) => {
  accessToken = nextAccessToken;

  if (!refreshToken) {
    throw new Error("Refresh token was not provided.");
  }

  try {
    window.sessionStorage.setItem(
      REFRESH_STORAGE_KEY,
      refreshToken
    );
  } catch {
    accessToken = null;
    throw new Error("Unable to store the refresh session in this browser.");
  }
};

export const getRefreshToken = () => {
  try {
    return window.sessionStorage.getItem(REFRESH_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const clearAuthTokens = () => {
  accessToken = null;

  try {
    window.sessionStorage.removeItem(REFRESH_STORAGE_KEY);
  } catch {
    // Storage may be unavailable.
  }
};

// Plain Axios request: do not run this through the API interceptors.
export const refreshAccessToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh session available.");
  }

  refreshPromise = axios
    .post(
      `${API_URL}/api/auth/refresh`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: false,
      }
    )
    .then(({ data }) => {
      setAuthTokens(data);
      return data.accessToken;
    })
    .catch((error) => {
      clearAuthTokens();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the access token to every API request.
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Refresh automatically when an access token expires.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/signup") ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch {
      clearAuthTokens();
      return Promise.reject(error);
    }
  }
);
