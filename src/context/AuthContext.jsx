import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user & token from localStorage on page refresh
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Login handler
  const login = (authData) => {
    // authData from backend: { token, userId, name, email, role }
    localStorage.setItem("token", authData.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        userId: authData.userId,
        name: authData.name,
        email: authData.email,
        role: authData.role,
      }),
    );

    setToken(authData.token);
    setUser({
      userId: authData.userId,
      name: authData.name,
      email: authData.email,
      role: authData.role,
    });
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
