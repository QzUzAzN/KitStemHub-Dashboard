import { useState, useEffect } from "react";
import {
  Button,
  Layout,
  Table,
  Modal,
  Form,
  Input,
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
import { toast } from "react-toastify";

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
    } catch (err) {
      toast.error("Không thể tải danh sách loại thiết bị");
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
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span className={status ? "text-green-600" : "text-red-600"}>
          {status ? "Khả dụng" : "Không khả dụng"}
        </span>
      ),
    },
    {
      title: "Thao tác",
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
              // className="text-green-600"
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
      toast.success(`Đã vô hiệu hóa loại thiết bị thành công`);
      await fetchTypes();
      if (searchResult && searchResult.id === type.id) {
        const updatedType = await api.get(`types/${type.id}`);
        setSearchResult(updatedType.data.details.data.type);
      }
    } catch (err) {
      toast.error("Không thể vô hiệu hóa loại thiết bị");
    }
  };

  const handleRestore = async (type) => {
    try {
      await api.put(`types/restore/${type.id}`);
      toast.success(`Đã kích hoạt loại thiết bị thành công`);
      await fetchTypes();
      if (searchResult && searchResult.id === type.id) {
        const updatedType = await api.get(`types/${type.id}`);
        setSearchResult(updatedType.data.details.data.type);
      }
    } catch (err) {
      toast.error("Không thể kích hoạt loại thiết bị");
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingType) {
        await api.put(`types`, values);
        toast.success("Cập nhật loại thiết bị thành công");
      } else {
        await api.post("types", values);
        toast.success("Thêm loại thiết bị mới thành công");
      }
      setIsModalVisible(false);
      form.resetFields();
      await fetchTypes();
      if (searchResult && searchResult.id === values.id) {
        const updatedType = await api.get(`types/${values.id}`);
        setSearchResult(updatedType.data.details.data.type);
      }
    } catch (err) {
      toast.error("Không thể lưu loại thiết bị");
    }
  };

  const handleSearch = async (id) => {
    if (!id) {
      toast.error("Please enter a type ID");
      return;
    } else if (isNaN(id)) {
      toast.error("ID is a number!");
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
        toast.success("Type found");
      } else {
        throw new Error("Type not found");
      }
    } catch (error) {
      // console.log(error);
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
          Quản lý Loại Thiết bị
        </Title>
        <Space size="middle">
          <Search
            placeholder="Nhập ID loại thiết bị"
            onSearch={handleSearch}
            style={{ width: 250 }}
            className="shadow-sm"
            enterButton={
              <Button
                icon={<SearchOutlined />}
                className="bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600"
              >
                Tìm kiếm
              </Button>
            }
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showModal}
            className="bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600 shadow-sm"
          >
            Thêm Loại Mới
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
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <Modal
        title={
          <Title level={3}>
            {editingType ? "Chỉnh sửa Loại Thiết bị" : "Thêm Loại Thiết bị Mới"}
          </Title>
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
            label="Tên"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên loại thiết bị!",
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
              {editingType ? "Cập nhật" : "Thêm"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
};

export default AdminTypes;
