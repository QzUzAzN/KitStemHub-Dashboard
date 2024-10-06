import {
  DropboxOutlined,
  FilePdfOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ManagerSidebar() {
  const navigate = useNavigate();

  const handleNavigate = (path) => () => {
    navigate(path);
  };
  const items = [
    {
      key: "sub1",
      icon: <RobotOutlined />,
      label: <p className="font-medium">Quản lí Kits</p>,
      onClick: handleNavigate("/manager/kits"),
    },
    {
      key: "sub2",
      icon: <FilePdfOutlined />,
      label: <p className="font-medium">Quản lí Labs</p>,
      onClick: handleNavigate("/manager/labs"),
    },
    {
      key: "sub3",
      icon: <DropboxOutlined />,
      label: <p className="font-medium">Quản lí Package</p>,
      onClick: handleNavigate("/manager/package"),
    },
  ];

  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="h-screen overflow-hidden">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        className="h-full fixed left-0 top-0 z-10"
        width={200}
      >
        <div className="h-16 flex text-xl items-center justify-center bg-gray-900 text-white">
          {collapsed ? "M" : "Manager"}
        </div>
        <Menu theme="dark" mode="inline" items={items} className="mt-5" />
      </Sider>

      {/* Main content layout */}
      <Layout
        className={`ml-${
          collapsed ? "20" : "64"
        } transition-all duration-300 bg-gray-100`}
        style={{ marginLeft: collapsed ? 80 : 200 }} // Adjust according to sidebar width
      >
        <div className="p-6">
          {/* Content Area */}
          <h1 className="text-2xl font-bold">Dashboard Content</h1>
          <p>Here goes the main content of the page.</p>
        </div>
      </Layout>
    </Layout>
  );
}

export default ManagerSidebar;
