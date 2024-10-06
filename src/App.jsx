import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginRegisterPage from "./pages/LoginRegister";
import AdminPage from "./pages/AdminPage";
import ManagerPage from "./pages/ManagerPage";
import ManagerContentKits from "./components/manager/ManagerContentKits";
import ManagerContentLabs from "./components/manager/ManagerContentLabs";
import ManagerContentPackage from "./components/manager/ManagerContentPackage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
          />
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
        <ToastContainer />
      </Router>
    </AuthProvider>
  );
}

export default App;
