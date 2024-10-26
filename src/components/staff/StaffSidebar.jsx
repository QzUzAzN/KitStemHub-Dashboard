import { useState } from "react";
import { Button, Layout, Menu } from "antd";
import {
  AppstoreOutlined,
  BarsOutlined,
  FolderOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

const { Sider } = Layout;

function StaffSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={toggleCollapsed}
      className="bg-blue-50 shadow-lg"
      width={240}
      theme="light"
      trigger={null}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        className=" bg-blue-200"
        style={{
          fontSize: "16px",
          width: "60px",
          height: "50px",
          position: "fixed",
          bottom: "10px",
          left: "10px",
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-gray-800 text-2xl p-4 text-center font-bold"
      >
        {collapsed ? "Staff" : "Staff Panel"}
      </motion.div>
      <Menu
        mode="inline"
        defaultSelectedKeys={["1"]}
        className="bg-transparent border-r-0"
      >
        <Menu.Item
          key="1"
          icon={<AppstoreOutlined className="text-blue-600" />}
        >
          <NavLink
            to="/staff/order-confirmation"
            className={({ isActive }) =>
              isActive
                ? "font-bold text-blue-600"
                : "text-gray-700 hover:text-blue-600"
            }
          >
            Order Management
          </NavLink>
        </Menu.Item>
        <Menu.Item key="2" icon={<BarsOutlined className="text-blue-600" />}>
          <NavLink
            to="/staff/labs-support"
            className={({ isActive }) =>
              isActive
                ? "font-bold text-blue-600"
                : "text-gray-700 hover:text-blue-600"
            }
          >
            Support Request
          </NavLink>
        </Menu.Item>
        <Menu.Item key="3" icon={<FolderOutlined className="text-blue-600" />}>
          <NavLink
            to="/staff/support-history"
            className={({ isActive }) =>
              isActive
                ? "font-bold text-blue-600"
                : "text-gray-700 hover:text-blue-600"
            }
          >
            Support History
          </NavLink>
        </Menu.Item>
      </Menu>
    </Sider>
  );
}

export default StaffSidebar;
