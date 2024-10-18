import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginRegisterPage from "./pages/LoginRegister";
import AdminPage from "./pages/AdminPage";
import AdminCategories from "./pages/adminpage/AdminCategories";
import AdminTypes from "./pages/adminpage/AdminTypes";
import ManagerPage from "./pages/ManagerPage";
import ManagerContentKits from "./components/manager/ManagerContentKits";
import ManagerContentLabs from "./components/manager/ManagerContentLabs";
import ManagerContentPackage from "./components/manager/ManagerContentPackage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminLevels from "./components/admin/AdminLevels";
import StaffPage from "./pages/StaffPage";
import OrderConfirmation from "./components/staff/OrderConfirmation";
import SupportHistory from "./components/staff/SupportHistory";
import RequestSupportManagement from "./components/staff/RequestSupportManagement";
import ManagerUser from "./components/manager/ManagerUser";
import ManagerStaff from "./components/manager/ManagerStaff";

function App() {
  return (
    // {/* <RouterProvider router={router} /> */}
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginRegisterPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminCategories />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="types" element={<AdminTypes />} />
            <Route path="levels" element={<AdminLevels />} />
          </Route>

          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={["manager"]}>
                <ManagerPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<ManagerContentKits />} />
            <Route path="kits" element={<ManagerContentKits />} />
            <Route path="labs" element={<ManagerContentLabs />} />
            <Route path="packages" element={<ManagerContentPackage />} />
            <Route path="user" element={<ManagerUser />} />
            <Route path="staff" element={<ManagerStaff />} />
          </Route>
          <Route path="/" element={<LoginRegisterPage />} />

          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <StaffPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<OrderConfirmation />} />
            <Route path="order-confirmation" element={<OrderConfirmation />} />
            <Route path="labs-support" element={<RequestSupportManagement />} />
            <Route path="support-history" element={<SupportHistory />} />
          </Route>
          <Route path="/" element={<LoginRegisterPage />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={1500}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
