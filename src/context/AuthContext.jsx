
import { useState, useEffect, useCallback } from "react";

import { api } from "../utils/api";

import {
  setAuthTokens,
  clearAuthTokens,
  refreshAccessToken,
} from "../utils/api";

import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const { data } = await api.get("/auth/me");

    setUser(data.user);

    return data.user;
  }, []);

  // Restore the session after a page reload.
  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        await refreshAccessToken();

        const { data } = await api.get("/auth/me");

        if (active) {
          setUser(data.user);
        }
      } catch {
        clearAuthTokens();

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (username, password) => {
    const { data } = await api.post("/auth/login", {
      username,
      password,
    });

    setAuthTokens(data);
    setUser(data.user);

    return data.user;
  }, []);

  const signup = useCallback(async (username, password) => {
    const { data } = await api.post("/auth/signup", {
      username,
      password,
    });

    setAuthTokens(data);
    setUser(data.user);

    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearAuthTokens();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
