import { useState } from "react";
import { Layout, Menu } from "antd";
import {
  AppstoreOutlined,
  BarsOutlined,
  FolderOutlined,
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
      className="bg-gradient-to-b from-gray-800 to-gray-500 shadow-lg"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-white text-2xl p-4 text-center font-bold"
      >
        {collapsed ? "Staff" : "Staff Panel"}
      </motion.div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["1"]}
        className="bg-transparent"
      >
        <Menu.Item key="1" icon={<AppstoreOutlined />}>
          <NavLink
            to="/staff/order-confirmation"
            className={({ isActive }) => (isActive ? "font-bold" : "")}
          >
            Order Management
          </NavLink>
        </Menu.Item>
        <Menu.Item key="2" icon={<BarsOutlined />}>
          <NavLink
            to="/staff/labs-support"
            className={({ isActive }) => (isActive ? "font-bold" : "")}
          >
            Support Request
          </NavLink>
        </Menu.Item>
        <Menu.Item key="3" icon={<FolderOutlined />}>
          <NavLink
            to="/staff/support-history"
            className={({ isActive }) => (isActive ? "font-bold" : "")}
          >
            Support History
          </NavLink>
        </Menu.Item>
      </Menu>
    </Sider>
  );
}

export default StaffSidebar;
