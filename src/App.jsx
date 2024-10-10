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

function App() {
  // const router = createBrowserRouter([
  //   {
  //     path: "/",

  //     element: <LoginRegister />,
  //   },
  //   {
  //     path: "/admin",

  //     element: <AdminPage />,
  //   },
  //   {
  //     path: "/manager",
  //     element: <ManagerPage />,
  //     children: [
  //       {
  //         path: "kits",
  //         element: <ManagerContentKits />,
  //       },
  //       {
  //         path: "labs",
  //         element: <ManagerContentLabs />,
  //       },
  //       {
  //         path: "package",
  //         element: <ManagerContentPackage />,
  //       },
  //     ],
  //   },
  // ]);
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
            <Route index element={<div>Welcome to Manager Dashboard</div>} />
            <Route path="kits" element={<ManagerContentKits />} />
            <Route path="labs" element={<ManagerContentLabs />} />
            <Route path="package" element={<ManagerContentPackage />} />
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
