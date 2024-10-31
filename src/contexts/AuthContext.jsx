import React, { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Khi  refresh trang hoặc thay đổi URL trực tiếp, useEffect sẽ chạy lại, nhưng nó có thể không kịp set user trước khi ProtectedRoute kiểm tra.
  //==>dùng load
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokenDashboard = localStorage.getItem("tokenDashboard");
    if (tokenDashboard) {
      try {
        const decoded = jwtDecode(tokenDashboard);
        setUser({
          email: decoded.email,
          role: decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ],
        });
      } catch (error) {
        console.error("Invalid token", error);
        // localStorage.removeItem("tokenDashboard");
      }
    }
    setLoading(false);
  }, []);

  const login = (tokenDashboard) => {
    localStorage.setItem("tokenDashboard", tokenDashboard);
    const decoded = jwtDecode(tokenDashboard);
    setUser({
      email: decoded.email,
      role: decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ],
    });
  };

  const logout = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem("tokenDashboard");
        localStorage.removeItem("refreshTokenDashboard");
        setUser(null);
        resolve();
      }, 1000); // Simulating an async operation
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
