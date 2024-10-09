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
  DeleteOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../config/axios";

const { Content } = Layout;
const { Search } = Input;
const { Title } = Typography;

const AdminTypes = () => {
  const [types, setTypes] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingType, setEditingType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchResult, setSearchResult] = useState(null);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const response = await api.get("types");
      if (response.data.status === "success") {
        setTypes(response.data.details.data["component-types"]);
      } else {
        setTypes([]);
      }
    } catch (error) {
      // console.error("Error fetching types:", error);
      message.error("Failed to fetch types");
      setTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
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
        <Space>
          <Button onClick={() => handleEdit(record)} type="link">
            <EditOutlined />
          </Button>
          {record.status ? (
            <Button
              onClick={() => handleToggleStatus(record)}
              type="link"
              className="!text-red-600"
            >
              <DeleteOutlined />
            </Button>
          ) : (
            <Button
              onClick={() => handleRestore(record)}
              type="link"
              className="text-green-600"
            >
              <UndoOutlined />
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const showModal = () => {
    setIsModalVisible(true);
    setEditingType(null);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleEdit = (type) => {
    setEditingType(type);
    form.setFieldsValue(type);
    setIsModalVisible(true);
  };

  const handleToggleStatus = async (type) => {
    try {
      await api.delete(`types/${type.id}`);
      message.success(`Type deactivated successfully`);
      await fetchTypes();
      if (searchResult && searchResult.id === type.id) {
        const updatedType = await api.get(`types/${type.id}`);
        setSearchResult(updatedType.data.details.data.type);
      }
    } catch (error) {
      console.error("Error deactivating type:", error);
      message.error("Failed to deactivate type");
    }
  };

  const handleRestore = async (type) => {
    try {
      await api.put(`types/restore/${type.id}`);
      message.success(`Type activated successfully`);
      await fetchTypes();
      if (searchResult && searchResult.id === type.id) {
        const updatedType = await api.get(`types/${type.id}`);
        setSearchResult(updatedType.data.details.data.type);
      }
    } catch (error) {
      message.error("Failed to activate type");
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingType) {
        await api.put(`types`, values);
        message.success("Type updated successfully");
      } else {
        await api.post("types", values);
        message.success("Type added successfully");
      }
      setIsModalVisible(false);
      form.resetFields();
      await fetchTypes();
      if (searchResult && searchResult.id === values.id) {
        const updatedType = await api.get(`types/${values.id}`);
        setSearchResult(updatedType.data.details.data.type);
      }
    } catch (error) {
      // console.error("Error submitting type:", error);
      message.error("Failed to submit type");
    }
  };

  const handleSearch = async (id) => {
    if (!id) {
      message.error("Please enter a type ID");
      return;
    } else if (isNaN(id)) {
      message.error("ID is a number!");
      setSearchResult(null);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`types/${id}`);
      if (
        response.data.status === "success" &&
        response.data.details.data.type
      ) {
        setSearchResult(response.data.details.data.type);
        message.success("Type found");
      } else {
        throw new Error("Type not found");
      }
    } catch (error) {
      // console.log(error);
      message.error(error.response.data.details?.errors.notFound);
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
          Types Management
        </Title>
        <Space size="middle">
          <Search
            placeholder="Enter type ID"
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
            Add New Type
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
                className="hover:bg-white"
              >
                Clear Search
              </Button>
            </Space>
          </motion.div>
        ) : (
          <motion.div
            key="typeTable"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Table
              columns={columns}
              dataSource={types}
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
          <Title level={3}>{editingType ? "Edit Type" : "Add New Type"}</Title>
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        className="rounded-lg overflow-hidden"
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          {editingType && (
            <Form.Item name="id" label="Id">
              <Input disabled={true} />
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label="Name"
            rules={[
              {
                required: true,
                message: "Please input the type name!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-blue-500 hover:bg-blue-600 w-full"
            >
              {editingType ? "Update" : "Add"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
};

export default AdminTypes;
