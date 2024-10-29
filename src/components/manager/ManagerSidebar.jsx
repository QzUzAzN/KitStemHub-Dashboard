import { useState } from "react";
import { Button, Layout, Menu } from "antd";
import {
  DropboxOutlined,
  FilePdfOutlined,
  RobotOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SnippetsOutlined,
  LineChartOutlined,
   ControlOutlined,
  UsergroupAddOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

const { Sider } = Layout;

function ManagerSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={toggleCollapsed}
      className="bg-blue-50 shadow-lg min-h-screen sicky left-0"
      width={240}
      theme="light"
      trigger={null}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        className="bg-blue-200"
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
        {collapsed ? "M" : "Manager Panel"}
      </motion.div>
      <Menu
        mode="inline"
        defaultSelectedKeys={["1"]}
        className="bg-transparent border-r-0"
      >
        <Menu.Item
          key="0"
          icon={<LineChartOutlined />}
          className="text-blue-600"
        >
          <NavLink
            to="/manager/dashboard"
            className={({ isActive }) =>
              isActive
                ? "font-bold text-blue-600"
                : "text-gray-700 hover:text-blue-600"
            }
          >
            Bảng Điều Khiển
          </NavLink>
        </Menu.Item>
        <Menu.Item key="1" icon={<RobotOutlined />} className="text-blue-600">
          <NavLink
            to="/manager/kits"
            className={({ isActive }) =>
              isActive
                ? "font-bold text-blue-600"
                : "text-gray-700 hover:text-blue-600"
            }
          >
            Quản lí Kits
          </NavLink>
        </Menu.Item>
        <Menu.Item key="2" icon={<ControlOutlined />}>
          <NavLink
            to="/manager/components"
            className={({ isActive }) =>
              isActive
                ? "font-bold text-blue-600"
                : "text-gray-700 hover:text-blue-600"
            }
          >
            Quản lí Components
          </NavLink>
        </Menu.Item>
        <Menu.Item key="3" icon={<FilePdfOutlined />}>
          <NavLink
            to="/manager/labs"
            className={({ isActive }) =>
              isActive
                ? "font-bold text-blue-600"
                : "text-gray-700 hover:text-blue-600"
            }
          >
            Quản lí Labs
          </NavLink>
        </Menu.Item>
        <Menu.Item key="4" icon={<DropboxOutlined />}>
          <NavLink
            to="/manager/packages"
            className={({ isActive }) =>
              isActive
                ? "font-bold text-blue-600"
                : "text-gray-700 hover:text-blue-600"
            }
          >
            Quản lí Package
          </NavLink>
        </Menu.Item>
        <Menu.Item key="5" icon={<TeamOutlined />}>
          <NavLink
            to="/manager/user"
            className={({ isActive }) =>
              isActive
                ? "font-bold text-blue-600"
                : "text-gray-700 hover:text-blue-600"
            }
          >
            Quản lí người dùng
          </NavLink>
        </Menu.Item>
        <Menu.Item key="6" icon={<UsergroupAddOutlined />}>
          <NavLink
            to="/manager/staff"
            className={({ isActive }) =>
              isActive
                ? "font-bold text-blue-600"
                : "text-gray-700 hover:text-blue-600"
            }
          >
            Quản lí nhân viên
          </NavLink>
        </Menu.Item>
      </Menu>
    </Sider>
  );
}

export default ManagerSidebar;
