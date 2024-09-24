import { Outlet } from "react-router-dom";
import ManagerHeader from "../components/manager/ManagerHeader";
import ManagerSidebar from "../components/manager/ManagerSidebar";

function ManagerPage() {
  return (
    <div>
      <ManagerHeader />
      <div className="flex">
        <div>
          <ManagerSidebar />
        </div>
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default ManagerPage;
