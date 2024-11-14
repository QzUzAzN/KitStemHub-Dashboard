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
  UndoOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../config/axios";
import { toast } from "react-toastify";

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
        setCategories(response.data.details.data.categories);
        // console.log(response.data.details.data.categories);
      } else {
        // console.error("Received data structure is unexpected:", response.data);
        setCategories([]);
      }
    } catch (error) {
      // console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
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
      //order: text, record, index
      render: (text, record) => (
        <span className={!record.status ? "opacity-50" : ""}>{text}</span>
      ),
    },
    {
      title: "Tên Danh Mục",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <span className={!record.status ? "opacity-50" : ""}>{text}</span>
      ),
    },
    {
      title: "Mô Tả",
      dataIndex: "description",
      key: "description",
      render: (text, record) => (
        <span className={!record.status ? "opacity-50" : ""}>{text}</span>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span className={status ? "text-green-600" : "text-red-600"}>
          {status ? "Khả Dụng" : "Không Khả Dụng"}
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
        title: "Bạn có chắc chắn muốn ẩn danh mục này?",
        content: "Hành động này sẽ làm cho danh mục không khả dụng.",
        okText: "Đồng Ý",
        okType: "danger",
        cancelText: "Hủy",
        onOk: async () => {
          try {
            await api.delete(`categories/${id}`);
            toast.success("Category hidden successfully");
            await fetchCategories();
            if (searchResult && searchResult.id === id) {
              const updatedCategory = await api.get(`categories/${id}`);
              setSearchResult(updatedCategory.data.details.data.category);
            }
          } catch (error) {
            console.error("Error in hide operation:", error);
            toast.error(
              `Failed to hide category: ${error.message || "Unknown error"}`
            );
          }
        },
      });
    } catch (error) {
      console.error("Error in hide confirmation:", error);
      toast.error("Đã xảy ra lỗi khi cố gắng ẩn danh mục");
    }
  };

  const handleActivate = async (id) => {
    try {
      const response = await api.put(`categories/restore/${id}`);
      if (response.data && response.data.status === "success") {
        toast.success(response.data.details.message);
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
      toast.error(
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
        // console.log("Update response:", response.data);
        toast.success("Category updated successfully");
      } else {
        response = await api.post("categories", values);
        if (response.data && response.data.status === "success") {
          toast.success("Category added successfully");
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
      toast.error("Failed to submit category");
    }
  };

  const handleSearch = async (id) => {
    if (!id) {
      toast.error("Please enter a category ID");
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

        toast.success("Category found");
      } else {
        throw new Error("Category not found");
      }
    } catch (error) {
      // console.error("Error searching category:", error);
      toast.error("Category not found");
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
          Quản Lý Danh Mục
        </Title>
        <Space size="middle">
          <Search
            placeholder="Nhập ID danh mục"
            onSearch={handleSearch}
            style={{ width: 250 }}
            className="shadow-sm"
            enterButton={
              <Button
                icon={<SearchOutlined />}
                className="bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600"
              >
                Tìm Kiếm
              </Button>
            }
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showModal}
            className="bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600 shadow-sm"
          >
            Thêm Danh Mục Mới
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
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <Modal
        title={
          <Title level={3}>
            {editingCategory ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}
          </Title>
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        className="rounded-lg overflow-hidden"
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          {editingCategory && (
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
                message: "Vui lòng nhập tên danh mục!",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô Tả">
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-blue-500 hover:bg-blue-600 w-full"
            >
              {editingCategory ? "Cập Nhật" : "Thêm"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Content>
  );
};

export default AdminDashboard;
