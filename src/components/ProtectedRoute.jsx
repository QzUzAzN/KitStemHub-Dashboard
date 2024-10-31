import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import { Spin } from "antd";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const toastShown = useRef(false);

  useEffect(() => {
    return () => {
      toastShown.current = false;
    };
  }, [location]);

  if (loading) {
    // Return a centered spinner
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Hiển thị thông báo
    if (!toastShown.current) {
      toast.error(
        `You don't have permission to access this page. Redirecting to your dashboard.`,
        {
          position: "top-center",
          autoClose: 5500,
        }
      );
      toastShown.current = true;
    }

    // Chuyển hướng dựa trên vai trò của người dùng
    let redirectPath = "/";
    switch (user.role) {
      case "admin":
        redirectPath = "/admin";
        break;
      case "manager":
        redirectPath = "/manager";
        break;
      case "staff":
        redirectPath = "/staff";
    }

    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
