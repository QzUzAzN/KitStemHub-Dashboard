import { useState } from "react";
import { Button, Layout, Menu, Table } from "antd";
import {
  DashboardOutlined,
  FormOutlined,
  TableOutlined,
  FileOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

const { Sider, Content } = Layout;

const AdminDashboard = () => {
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Action",
      dataIndex: "",
      key: "x",
      render: (text, record) => (
        <>
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <span> | </span>
          <Button onClick={() => handleDelete(record)}>Delete</Button>
        </>
      ),
    },
  ];
  const [data, setData] = useState([
    {
      key: 1,
      name: "John Brown",
      age: 32,
      address: "New York No. 1 Lake Park",
      description:
        "My name is John Brown, I am 32 years old, living in New York No. 1 Lake Park.",
    },
    {
      key: 2,
      name: "Jim Green",
      age: 42,
      address: "London No. 1 Lake Park",
      description:
        "My name is Jim Green, I am 42 years old, living in London No. 1 Lake Park.",
    },
    {
      key: 3,
      name: "Not Expandable",
      age: 29,
      address: "Jiangsu No. 1 Lake Park",
      description: "This not expandable",
    },
    {
      key: 4,
      name: "Joe Black",
      age: 32,
      address: "Sydney No. 1 Lake Park",
      description:
        "My name is Joe Black, I am 32 years old, living in Sydney No. 1 Lake Park.",
    },
  ]);
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  const handleAdd = () => {
    const newKey = data.length + 1;
    const newData = {
      key: newKey.toString(),
      name: `New Name ${newKey}`,
      age: 0,
      address: "Unknown",
    };
    setData([...data, newData]);
  };
  const handleEdit = (record) => {
    console.log("Edit", record);
  };

  const handleDelete = (record) => {
    setData(data.filter((item) => item.key !== record.key)); // Xóa hàng
  };
  return (
    <Layout className="h-screen">
      {/* Sidebar with collapsible functionality */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={toggleCollapsed}
        className="bg-gray-900"
      >
        <div className="text-white text-2xl p-4 text-left transition ease-in-out duration-1000">
          <button
            className="text-xl p-2 hover:text-blue-500 transition duration-500"
            onClick={toggleCollapsed}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          className="bg-gray-900"
          defaultSelectedKeys={["1"]}
        >
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="2" icon={<FormOutlined />}>
            Forms
          </Menu.Item>
          <Menu.Item key="3" icon={<TableOutlined />}>
            Tables
          </Menu.Item>
          <Menu.SubMenu key="sub1" title="Pages" icon={<FileOutlined />}>
            <Menu.Item key="4">Sign In</Menu.Item>
            <Menu.Item key="5">Sign Up</Menu.Item>
          </Menu.SubMenu>
        </Menu>
      </Sider>

      {/* Main content area */}
      <Layout className="bg-gray-100">
        <div className="flex justify-between p-4 bg-white shadow-md items-center">
          <div className="text-2xl font-semibold text-gray-700">
            Admin Panel
          </div>
        </div>
        <Content className="p-6">
          <div className="bg-white p-6 rounded-lg shadow-lg transition-all duration-300">
            <Table
              columns={columns}
              expandable={{
                expandedRowRender: (record) => (
                  <p
                    style={{
                      margin: 0,
                    }}
                  >
                    {record.description}
                  </p>
                ),
                rowExpandable: (record) => record.name !== "Not Expandable",
              }}
              dataSource={data}
            />
            <Button type="primary" onClick={handleAdd} className="mb-4">
              Add New Row
            </Button>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
