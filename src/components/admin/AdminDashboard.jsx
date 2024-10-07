import { useState, useEffect } from "react";
import {
  Button,
  Layout,
  Table,
  Modal,
  Form,
  Input,
  message,
  Spin,
  Space,
  Typography,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  UndoOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../config/axios";

const { Content } = Layout;
const { Search } = Input;
const { Title } = Typography;

const AdminDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchResult, setSearchResult] = useState(null); //by id

  useEffect(() => {
    fetchCategories();
    // console.log(searchResult);
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get("categories");
      // console.log("Fetched categories:", response.data);
      if (response.data.status === "success") {
        const categoriesWithId = response.data.details.data.categories.map(
          (category) => ({
            ...category,
          })
        );
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
      render: (text, record) => (
        <span className={!record.status ? "opacity-50" : ""}>{text}</span>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <span className={!record.status ? "opacity-50" : ""}>{text}</span>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text, record) => (
        <span className={!record.status ? "opacity-50" : ""}>{text}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span className={status ? "text-green-600" : "text-red-600"}>
          {status ? "Available" : "Unavailable"}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        // _: Được sử dụng khi không cần thiết sử dụng giá trị của cột hiện tại.
        //record: Là đối tượng chứa dữ liệu của dòng hiện tại (mỗi record đại diện cho một danh mục).
        <>
          <Button
            onClick={() => handleEdit(record)}
            type="link"
            disabled={!record.status}
          >
            <EditOutlined />
          </Button>
          {record.status ? (
            <Button onClick={() => handleHide(record.id)} type="link" danger>
              <DeleteOutlined />
            </Button>
          ) : (
            <Button
              onClick={() => handleActivate(record.id)}
              type="link"
              className="text-green-600"
            >
              <UndoOutlined />
            </Button>
          )}
        </>
      ),
    },
  ];

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

  const handleHide = async (id) => {
    try {
      Modal.confirm({
        title: "Are you sure you want to hide this category?",
        content: "This action will make the category unavailable.",
        okText: "Yes, Hide",
        okType: "danger",
        cancelText: "No",
        onOk: async () => {
          try {
            await api.delete(`categories/${id}`);
            message.success("Category hidden successfully");
            await fetchCategories();
            if (searchResult && searchResult.id === id) {
              const updatedCategory = await api.get(`categories/${id}`);
              setSearchResult(updatedCategory.data.details.data.category);
            }
          } catch (error) {
            console.error("Error in hide operation:", error);
            message.error(
              `Failed to hide category: ${error.message || "Unknown error"}`
            );
          }
        },
      });
    } catch (error) {
      console.error("Error in hide confirmation:", error);
      message.error("An error occurred while trying to hide the category");
    }
  };

  const handleActivate = async (id) => {
    try {
      const response = await api.put(`categories/restore/${id}`);
      if (response.data && response.data.status === "success") {
        message.success(response.data.details.message);
        await fetchCategories();
        if (searchResult && searchResult.id === id) {
          const updatedCategory = await api.get(`categories/${id}`);
          setSearchResult(updatedCategory.data.details.data.category);
        }
      } else {
        throw new Error("Unexpected response structure");
      }
    } catch (error) {
      console.error("Error in activate operation:", error);
      message.error(
        `Failed to activate category: ${error.message || "Unknown error"}`
      );
    }
  };

  //Khi người dùng nhấn nút Submit, tất cả dữ liệu từ các trường trong form (các Form.Item) sẽ được thu thập và truyền vào hàm handleSubmit dưới dạng một đối tượng values.
  const handleSubmit = async (values) => {
    try {
      let response;
      if (editingCategory) {
        response = await api.put(`categories`, values);
        console.log("Update response:", response.data);
        message.success("Category updated successfully");
      } else {
        response = await api.post("categories", values);
        if (response.data && response.data.status === "success") {
          message.success("Category added successfully");
        } else {
          throw new Error("Unexpected response structure");
        }
      }
      setIsModalVisible(false);
      form.resetFields();
      await fetchCategories();
      if (searchResult && searchResult.id === values.id) {
        const updatedCategory = await api.get(`categories/${values.id}`);
        setSearchResult(updatedCategory.data.details.data.category);
      }
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
      const response = await api.get(`categories/${id}`);
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
    <Content className="m-6 p-6 bg-white rounded-lg shadow-xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-6"
      >
        <Title level={2} className="m-0">
          Categories Management
        </Title>
        <Space size="middle">
          <Search
            placeholder="Enter category ID"
            onSearch={handleSearch}
            style={{ width: 250 }}
            className="shadow-sm"
            enterButton={
              <Button
                icon={<SearchOutlined />}
                className="bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600"
              >
                Search
              </Button>
            }
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showModal}
            className="bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600 shadow-sm"
          >
            Add New Category
          </Button>
        </Space>
      </motion.div>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-10"
          >
            <Spin size="large" />
          </motion.div>
        ) : searchResult ? (
          <motion.div
            key="searchResult"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-6 border rounded-lg shadow-md bg-gray-50"
          >
            <Title level={4} className="mb-4">
              Search Result:
            </Title>
            <Table
              columns={columns}
              dataSource={[searchResult]}
              rowKey="id"
              pagination={false}
              className="shadow-sm"
            />
            <Space className="mt-4">
              <Button
                onClick={() => setSearchResult(null)}
                className=" hover:bg-white "
              >
                Clear Search
              </Button>
            </Space>
          </motion.div>
        ) : (
          <motion.div
            key="categoryTable"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Table
              columns={columns}
              dataSource={categories}
              rowKey="id"
              className="shadow-sm"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <Modal
        title={
          <Title level={3}>
            {editingCategory ? "Edit Category" : "Add New Category"}
          </Title>
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        className="rounded-lg overflow-hidden"
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          {editingCategory && (
            <>
              <Form.Item name="id" label="Id">
                <Input disabled={true} />
              </Form.Item>
            </>
          )}
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
              className="bg-blue-500 hover:bg-blue-600 w-full"
            >
              {editingCategory ? "Update" : "Add"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
};

export default AdminDashboard;
