import { createContext, startTransition, useContext, useEffect, useState } from "react";

import axiosInstance from "../api/axiosInstance.js";

const AuthContext = createContext(null);

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || fallback;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshSession() {
    try {
      const response = await axiosInstance.get("/api/auth/me");
      const nextUser = response.data.user;
      startTransition(() => {
        setUser(nextUser);
      });
      return nextUser;
    } catch (error) {
      startTransition(() => {
        setUser(null);
      });
      return null;
    } finally {
      setLoading(false);
    }
  }

  function syncUser(nextUser) {
    startTransition(() => {
      setUser(nextUser);
    });
  }

  useEffect(() => {
    let isMounted = true;

    async function hydrateSession() {
      try {
        const response = await axiosInstance.get("/api/auth/me");

        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setUser(response.data.user);
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setUser(null);
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    function handleUnauthorized() {
      startTransition(() => {
        setUser(null);
      });
    }

    hydrateSession();
    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  async function login(payload) {
    try {
      const response = await axiosInstance.post("/api/auth/login", payload);
      startTransition(() => {
        setUser(response.data.user);
      });
      return response.data.user;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Login failed"));
    }
  }

  async function register(payload) {
    try {
      const response = await axiosInstance.post("/api/auth/register", payload);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error, "Registration failed"));
    }
  }

  async function logout() {
    try {
      await axiosInstance.post("/api/auth/logout");
    } finally {
      startTransition(() => {
        setUser(null);
      });
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshSession,
        register,
        syncUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
