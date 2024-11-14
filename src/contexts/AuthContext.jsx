import { createContext, useState, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../config/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Khi  refresh trang hoặc thay đổi URL trực tiếp, useEffect sẽ chạy lại, nhưng nó có thể không kịp set user trước khi ProtectedRoute kiểm tra.
  //==>dùng load
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const tokenDashboard = localStorage.getItem("tokenDashboard");
      const refreshToken = localStorage.getItem("refreshTokenDashboard");

      if (tokenDashboard && refreshToken) {
        try {
          const decoded = jwtDecode(tokenDashboard);
          if (decoded.exp * 1000 < Date.now()) {
            try {
              const response = await api.post("users/refresh-token", {
                refreshToken: refreshToken,
              });

              if (response.data && response.data.details) {
                const newAccessToken = response.data.details["access-token"];
                const newRefreshToken = response.data.details["refresh-token"];

                localStorage.setItem("tokenDashboard", newAccessToken);
                localStorage.setItem("refreshTokenDashboard", newRefreshToken);

                const newDecoded = jwtDecode(newAccessToken);
                setUser({
                  email: newDecoded.email,
                  role: newDecoded[
                    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
                  ],
                });
              }
            } catch (refreshError) {
              console.error("Invalid refresh token", refreshError);
              localStorage.removeItem("tokenDashboard");
              localStorage.removeItem("refreshTokenDashboard");
              setUser(null);
            }
          } else {
            setUser({
              email: decoded.email,
              role: decoded[
                "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
              ],
            });
          }
        } catch (error) {
          console.error("Invalid token", error);
          localStorage.removeItem("tokenDashboard");
          localStorage.removeItem("refreshTokenDashboard");
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);
  //login truyền qua accesstoken
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
