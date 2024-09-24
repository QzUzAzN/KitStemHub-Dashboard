import {
  HeartOutlined,
  ShoppingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import { useState } from "react";

function ManagerSidebar() {
  const items = [
    {
      key: "sub1",
      icon: <UserOutlined />,
      label: <p className="font-medium">Quản lí Kits</p>,
    },
    {
      key: "sub2",
      icon: <ShoppingOutlined />,
      label: <p className="font-medium">Quản lí Labs</p>,
    },
    {
      key: "sub3",
      icon: <HeartOutlined />,
      label: <p className="font-medium">Quản lí Package</p>,
    },
  ];
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div>
      <Layout className="h-screen">
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <div className="demo-logo-vertical" />
          <Menu
            theme="dark"
            mode="inline"
            items={items}
            className="space-y-4 mt-5"
          />
        </Sider>
      </Layout>
    </div>
  );
}

export default ManagerSidebar;
