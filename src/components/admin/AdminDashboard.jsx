import { useState, useEffect } from "react";
import {
  Button,
  Layout,
  Menu,
  Table,
  Modal,
  Form,
  Input,
  message,
  Spin,
  Space,
} from "antd";
import {
  DashboardOutlined,
  AppstoreOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";

const { Sider, Content } = Layout;
const { Search } = Input;

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchResult, setSearchResult] = useState(null); //by id

  useEffect(() => {
    fetchCategories();
    console.log(searchResult);
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get("/Categories");
      // console.log("Fetched categories:", response.data);
      if (response.data.status === "success") {
        const categoriesWithId = response.data.details.data.categories
          .map((category) => ({
            ...category,

            // ...category,
            // id: category.id || category._id,
          }))
          .filter((category) => category.status === true); // Chỉ hiển thị danh mục có status true
        setCategories(categoriesWithId);
        // console.log(categoriesWithId);
      } else {
        // console.error("Received data structure is unexpected:", response.data);
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Failed to fetch categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "ID",
      //Trỏ đến thuộc tính id trong đối tượng dữ liệu danh mục, giúp bảng lấy và hiển thị giá trị của thuộc tính này
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        // _: Được sử dụng khi không cần thiết sử dụng giá trị của cột hiện tại.
        //record: Là đối tượng chứa dữ liệu của dòng hiện tại (mỗi record đại diện cho một danh mục).
        <>
          <Button onClick={() => handleEdit(record)} type="link">
            Edit
          </Button>
          <Button onClick={() => handleDelete(record.id)} type="link" danger>
            {/* {console.log(record.id)} */}
            Delete
          </Button>
        </>
      ),
    },
  ];

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const showModal = () => {
    setIsModalVisible(true);
    setEditingCategory(null);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    form.setFieldsValue(category);
    setIsModalVisible(true);
  };

  //dùng trong column
  const handleDelete = async (id) => {
    try {
      Modal.confirm({
        title: "Are you sure you want to delete this category?",
        content: "This action cannot be undone.",
        okText: "Yes, Delete",
        okType: "danger",
        cancelText: "No",
        onOk: async () => {
          try {
            const response = await api.delete(`Categories/${id}`, {
              status: false,
            });
            // console.log("Delete response:", response.data);
            if (response.data && response.data.status === "success") {
              message.success("Category deleted successfully");
              fetchCategories();
            } else {
              throw new Error("Unexpected response structure");
            }
          } catch (error) {
            // console.error("Error in delete operation:", error);
            if (error.response) {
              console.log("Error response:", error.response.data);
              message.error(
                `Failed to delete category: ${
                  error.response.data.message || "Unknown error"
                }`
              );
            } else if (error.request) {
              console.log("Error request:", error.request);
              message.error("No response received from server");
            } else {
              // console.log("Error message:", error.message);
              message.error(`Error: ${error.message}`);
            }
          }
        },
      });
    } catch (error) {
      console.error("Error in delete confirmation:", error);
      message.error("An error occurred while trying to delete the category");
    }
  };

  //Khi người dùng nhấn nút Submit, tất cả dữ liệu từ các trường trong form (các Form.Item) sẽ được thu thập và truyền vào hàm handleSubmit dưới dạng một đối tượng values.
  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        const response = await api.put(`Categories`, values);
        // console.log(values);
        console.log("Update response:", response.data);
        message.success("Category updated successfully");
      } else {
        const response = await api.post("Categories", values);
        // console.log("Add response:", response.data);
        if (response.data && response.data.status === "success") {
          message.success("Category added successfully");
        } else {
          throw new Error("Unexpected response structure");
        }
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchCategories();
    } catch (error) {
      console.error("Error submitting category:", error);
      message.error("Failed to submit category");
    }
  };

  const handleSearch = async (id) => {
    if (!id) {
      message.error("Please enter a category ID");
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/Categories/${id}`);
      // console.log("Search response:", response.data);
      if (
        response.data.status === "success" &&
        response.data.details.data.category
      ) {
        const category = response.data.details.data.category;
        setSearchResult({
          ...category,
          // id: category.id,
        });

        message.success("Category found");
      } else {
        throw new Error("Category not found");
      }
    } catch (error) {
      // console.error("Error searching category:", error);
      message.error(error.message || "Category not found");
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={toggleCollapsed}
        className="bg-gray-800"
      >
        <div className="text-white text-2xl p-4 text-center">
          {collapsed ? "Admin" : "Admin Panel"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          className="bg-gray-800"
        >
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="2" icon={<AppstoreOutlined />}>
            Categories
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content className="m-6 p-6 bg-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Categories Management</h1>
            <Space>
              <Search
                placeholder="Enter category ID"
                onSearch={handleSearch}
                style={{ width: 200 }}
                enterButton={<SearchOutlined />}
              />
              <Button
                type="primary"
                onClick={showModal}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Add New Category
              </Button>
            </Space>
          </div>
          {loading ? (
            <div className="text-center">
              <Spin size="large" />
            </div>
          ) : searchResult ? (
            <div className="mb-4 p-4 border rounded">
              <h2 className="text-lg font-semibold mb-2">Search Result:</h2>
              <Table
                columns={columns.filter((col) => col.key !== "action")}
                dataSource={[searchResult]}
                rowKey="id"
                pagination={false}
                className="shadow-sm"
              />
              <Button onClick={() => setSearchResult(null)} className="mt-4">
                Clear Search
              </Button>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={categories}
              rowKey="id"
              className="shadow-sm"
            />
          )}
          <Modal
            title={editingCategory ? "Edit Category" : "Add New Category"}
            visible={isModalVisible}
            onCancel={handleCancel}
            footer={null}
          >
            <Form form={form} onFinish={handleSubmit} layout="vertical">
              <Form.Item name="id" label="Id">
                <Input disabled={true} />
              </Form.Item>
              <Form.Item
                name="name"
                label="Name"
                rules={[
                  {
                    required: true,
                    message: "Please input the category name!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input.TextArea />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {editingCategory ? "Update" : "Add"}
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
