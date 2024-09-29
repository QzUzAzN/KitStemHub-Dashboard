import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import ManagerPage from "./pages/ManagerPage";
import ManagerContentKits from "./components/manager/ManagerContentKits";
import LoginRegister from "./pages/LoginRegister";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",

      element: <LoginRegister />,
    },
    {
      path: "/admin",

      element: <AdminPage />,
    },
    {
      path: "/manager",
      element: <ManagerPage />,
      children: [
        {
          path: "kits",
          element: <ManagerContentKits />,
        },
      ],
    },
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
