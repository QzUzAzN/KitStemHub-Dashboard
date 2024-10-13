import { useState } from "react";
import { Layout, Menu, Dropdown, Typography, Spin } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const { Header } = Layout;
const { Text } = Typography;

const HeaderNavbar = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      // console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = (
    <Menu>
      <Menu.Item key="1" icon={<UserOutlined />}>
        <Link to="#">Profile</Link>
      </Menu.Item>
      <Menu.Item key="2" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Header className="bg-gray-900 p-4 flex justify-between items-center shadow-md transition duration-500 ease-in-out">
        {/* Left: Logo and Search Bar */}
        <div className="flex items-center space-x-6">
          <div className="text-white text-xl font-bold">Staff Dashboard</div>
        </div>

        {/* Right: Notification, Mail, and Profile Dropdown */}
        <div className="flex items-center space-x-8">
          <Dropdown
            overlay={<Menu></Menu>}
            placement="bottomRight"
            trigger={["click"]}
          >
            <BellOutlined className="text-2xl text-white cursor-pointer hover:text-blue-400 transition duration-300" />
          </Dropdown>
          <Dropdown
            overlay={<Menu></Menu>}
            placement="bottomRight"
            trigger={["click"]}
          >
            <MailOutlined className="text-2xl text-white cursor-pointer hover:text-blue-400 transition duration-300" />
          </Dropdown>
          <Dropdown
            overlay={menuItems}
            placement="bottomRight"
            trigger={["click"]}
          >
            <div className="flex items-center space-x-2 cursor-pointer text-white hover:text-blue-400 transition duration-300">
              <UserOutlined className="text-2xl" />
              <Text className="text-white font-semibold hidden md:block">
                {user?.name || "Staff"}
              </Text>
            </div>
          </Dropdown>
        </div>
      </Header>
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Spin size="large" tip="Logging out..." />
        </div>
      )}
    </>
  );
};

export default HeaderNavbar;
