import { useState } from "react";
import { Layout, Menu, Dropdown, Typography, Spin, Avatar } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
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
    } catch {
      // Handle error silently
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = (
    <Menu className="bg-white rounded-md shadow-lg">
      <Menu.Item key="1" icon={<UserOutlined />}>
        <Link to="profile" className="text-gray-700 hover:text-blue-600">
          Profile
        </Link>
      </Menu.Item>
      <Menu.Item key="2" icon={<LogoutOutlined />} onClick={handleLogout}>
        <span className="text-gray-700 hover:text-blue-600">Logout</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      <Header className="bg-blue-50 p-4 flex justify-between items-center shadow-md transition duration-500 ease-in-out">
        <div className="flex items-center space-x-6">
          <div className="text-gray-800 text-xl font-bold flex items-center">
            <DashboardOutlined className="mr-2 text-blue-600" />
            Staff Dashboard
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <Dropdown
            overlay={menuItems}
            placement="bottomRight"
            trigger={["click"]}
          >
            <div className="flex items-center cursor-pointer text-gray-700 hover:text-blue-600 transition duration-300">
              <Avatar
                size={40}
                // src="/avatar.jpg"
                icon={<UserOutlined />}
                className="mr-3 border-2 border-white shadow-sm"
              />
              <div className="flex flex-col">
                <Text className="text-gray-800 font-semibold">
                  {user?.name || "Alexa Rawles"}
                </Text>
                <Text className="text-blue-600 text-xs">Staff</Text>
              </div>
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
