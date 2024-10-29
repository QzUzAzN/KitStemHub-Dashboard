import { Outlet } from "react-router-dom";
import ManagerHeader from "../components/manager/ManagerHeader";
import ManagerSidebar from "../components/manager/ManagerSidebar";
import { Layout } from "antd";
const { Content } = Layout;
function ManagerPage() {
  return (
    <>
      <ManagerHeader />
      <div className="flex">
        <ManagerSidebar />
        <div className="ml-[4px] mt-2 w-full">
          {" "}
          {/* margin-left tương ứng với width của Sidebar */}
          {/* Nội dung trang */}
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default ManagerPage;
