import { Layout, Input, Dropdown, Space, Typography, Menu } from "antd";
import {
  BellOutlined,
  MailOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Header } = Layout;
const { Text } = Typography;

const ManagerHeader = () => {
  const menuItems = (
    <Space direction="vertical" className="p-4 bg-white rounded-lg shadow-lg">
      <div className="cursor-pointer p-2 hover:bg-gray-100 rounded transition duration-300">
        Profile
      </div>
      <div className="cursor-pointer p-2 hover:bg-gray-100 rounded transition duration-300">
        Settings
      </div>
      <div className="cursor-pointer p-2 hover:bg-gray-100 rounded transition duration-300">
        Logout
      </div>
    </Space>
  );

  const items1 = [
    {
      key: "nav1",
      icon: <PlusCircleOutlined />,
      label: <p className="font-medium">Add Kits</p>,
    },
  ];

  return (
    <Header className="bg-gray-900 p-4 flex justify-between items-center shadow-md transition duration-500 ease-in-out">
      {/* Left: Search Bar and User Icon */}
      <div className="flex items-center space-x-6">
        <UserOutlined className="text-3xl text-white cursor-pointer hover:text-blue-400 transition duration-300" />
        <Input
          className="bg-gray-700 border-none text-white rounded-full placeholder-gray-300 focus:ring-2 focus:ring-blue-400 transition duration-300"
          placeholder="Search here..."
          prefix={<SearchOutlined className="text-white" />}
          style={{ width: 250 }}
        />
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        items={items1}
        style={{
          flex: 1,
          minWidth: 0,
        }}
        className="ml-10"
      />

      {/* Right: Notification, Mail, and Profile Dropdown */}
      <div className="flex items-center space-x-8">
        <Dropdown
          overlay={menuItems}
          placement="bottomRight"
          trigger={["click"]}
        >
          <BellOutlined className="text-2xl text-white cursor-pointer hover:text-blue-400 transition duration-300 relative" />
        </Dropdown>
        <Dropdown
          overlay={menuItems}
          placement="bottomRight"
          trigger={["click"]}
        >
          <MailOutlined className="text-2xl text-white cursor-pointer hover:text-blue-400 transition duration-300 relative" />
        </Dropdown>
        <Dropdown
          overlay={menuItems}
          placement="bottomRight"
          trigger={["click"]}
        >
          <div className="flex items-center space-x-2 cursor-pointer text-white hover:text-blue-400 transition duration-300">
            <UserOutlined className="text-2xl" />
            <Text className="text-white font-semibold hidden md:block">
              John Doe
            </Text>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default ManagerHeader;
