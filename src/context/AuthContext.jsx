import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem("vyas_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    
    try {
      const VYAS_API = import.meta.env.VITE_VYAS_API_URL || "http://localhost:8000/api/v1";
      // Ensure we hit the correct /me endpoint (it might be /api/me or /api/v1/me depending on the backend routes, in new backend it's /api/me)
      const baseUrl = VYAS_API.replace('/api/v1', '/api'); 
      const res = await fetch(`${baseUrl}/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        localStorage.removeItem("vyas_token");
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to fetch user profile", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("vyas_token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("vyas_token");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUser: fetchUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
