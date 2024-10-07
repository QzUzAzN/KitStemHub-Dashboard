import { useState } from "react";
import { Layout, Menu } from "antd";
import { AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

const { Sider } = Layout;

const AdminSidebar = () => {
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
        {collapsed ? "Admin" : "Admin Panel"}
      </motion.div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["1"]}
        className="bg-transparent"
      >
        <Menu.Item key="1" icon={<AppstoreOutlined />}>
          <NavLink
            to="/admin/categories"
            className={({ isActive }) => (isActive ? "font-bold" : "")}
          >
            Categories
          </NavLink>
        </Menu.Item>
        <Menu.Item key="2" icon={<BarsOutlined />}>
          <NavLink
            to="/admin/types"
            className={({ isActive }) => (isActive ? "font-bold" : "")}
          >
            Types
          </NavLink>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default AdminSidebar;
