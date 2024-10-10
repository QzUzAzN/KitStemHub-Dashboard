import { useEffect, useState } from "react";
import api from "../../config/axios";
import { toast } from "react-toastify";
import {
  Button,
  Form,
  Input,
  Layout,
  Modal,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";

import { motion, AnimatePresence } from "framer-motion";
const { Content } = Layout;
const { Search } = Input;
const { Title } = Typography;

function AdminLevels() {
  const [levels, setLevels] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingLevel, setEditingLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchResult, setSearchResult] = useState(null);
  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    // setLoading(true);
    try {
      const response = await api.get("levels");
      if (response.data.status === "success") {
        setLevels(response.data.details.data.levels);
        // console.log(response.data);
      } else {
        setLevels([]);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch levels");
      setLevels([]);
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
      // tùy chỉnh cách hiển thị giá trị của cột "status"
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
            <Button onClick={() => handleRestore(record)} type="link">
              <UndoOutlined />
            </Button>
          )}
        </Space>
      ),
    },
  ];
  const showModal = () => {
    setIsModalVisible(true);
    setEditingLevel(null);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleEdit = (level) => {
    setEditingLevel(level);
    form.setFieldsValue(level);
    setIsModalVisible(true);
  };
  //level lấy data từ record
  const handleToggleStatus = async (level) => {
    try {
      await api.delete(`levels/${level.id}`);
      toast.success(`Level deactivated successfully!`);
      await fetchLevels();
      if (searchResult && searchResult.id === level.id) {
        const updateLevel = await api.get(`levels/${level.id}`);
        setSearchResult(updateLevel.data.details.data.level);
      }
    } catch (error) {
      console.error("Failed to deactivate level:", error);
      toast.error("Failed to deactivate level");
    }
  };
  const handleRestore = async (level) => {
    try {
      await api.put(`levels/restore/${level.id}`);
      toast.success(`Level activated successfully!`);
      await fetchLevels();
      if (searchResult && searchResult.id === level.id) {
        const updateLevel = await api.get(`levels/${level.id}`);
        setSearchResult(updateLevel.data.details.data.level);
      }
    } catch (error) {
      console.error("Failed to activate level:", error);
      toast.error("Failed to activate level");
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingLevel) {
        await api.put(`levels`, values);
        toast.success("Level updated successfully");
      } else {
        await api.post("levels", values);
        toast.success("Level added successfully");
      }
      setIsModalVisible(false);
      form.resetFields();
      await fetchLevels();
      if (searchResult && searchResult.id === values.id) {
        const updateLevel = await api.get(`levels/${values.id}`);
        setSearchResult(updateLevel.data.details.data.level);
      }
    } catch (error) {
      console.error("Failed to submit level:", error);
      toast.error("Failed to submit level!");
    }
  };

  const handleSearch = async (id) => {
    if (!id) {
      toast.error("Please enter a level ID");
      return;
    } else if (isNaN(id)) {
      toast.error("ID is not a number!");
      setSearchResult(null);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`levels/${id}`);
      if (
        response.data.status === "success" &&
        response.data.details.data.level
      ) {
        setSearchResult(response.data.details.data.level);
        toast.success("Level found");
      } else {
        throw new Error("Level not found");
      }
    } catch (error) {
      toast.error(error.response.data.details?.errors.notFound);
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
          Levels Management
        </Title>
        <Space size="middle">
          <Search
            placeholder="Enter level ID"
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
            Add New Level
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
            key="levelTable"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Table
              columns={columns}
              dataSource={levels}
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
            {editingLevel ? "Edit Level" : "Add New Level"}
          </Title>
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        className="rounded-lg overflow-hidden"
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          {editingLevel && (
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
              {editingLevel ? "Update" : "Add"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
}

export default AdminLevels;
