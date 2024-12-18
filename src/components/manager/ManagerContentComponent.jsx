import {
  DeleteOutlined,
  UndoOutlined,
  EditOutlined,
  PlusCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Table,
  notification,
  Popconfirm,
  Form,
  Spin,
  Modal,
  Input,
  Button,
  Tag,
  Typography,
  Select,
} from "antd";
import { useEffect, useState } from "react";
import api from "../../config/axios";
import { Option } from "antd/es/mentions";

const { Text } = Typography;

function ManagerContentComponent() {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái loading cho create và update
  const [isOpen, setOpen] = useState(false); // Để mở/đóng modal
  const [editingRecord, setEditingRecord] = useState(null); // Để lưu record hiện tại nếu chỉnh sửa
  const [form] = Form.useForm(); // Khởi tạo form của Ant Design
  const [searchName, setSearchName] = useState(""); // State để lưu tên linh kiện cần tìm kiếm
  const [types, setTypes] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  }); // Thêm trạng thái phân trang

  const fetchTypes = async () => {
    try {
      const response = await api.get("/types");
      setTypes(response.data.details.data["component-types"]);
    } catch (error) {
      console.error("Error fetching types:", error);
    }
  };

  // Fetch components from the API
  const fetchComponents = async (page = 1, pageSize = 20, name = "") => {
    try {
      setLoading(true);
      const params = { page: page - 1, pageSize, name };
      const response = await api.get("/components", {
        params,
      }); // API để lấy danh sách components
      if (response.data?.details?.data?.components) {
        const componentsData = response.data.details.data.components;
        const totalPages = response.data.details.data["total-pages"] || 0;
        setDataSource(componentsData);
        setPagination({
          total: totalPages * pageSize,
          current: page,
          pageSize,
        });
      } else {
        setDataSource([]);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching components:", error);
    }
  };

  // Function to hide (delete) a component
  const hideComponent = async (id, showNotification = true) => {
    try {
      if (!id) {
        console.error("ID không hợp lệ khi ẩn component:", id);
        return;
      }
      // Gọi API DELETE để ẩn component
      const response = await api.delete(`components/${id}`);
      console.log("Component hidden:", response.data);

      if (showNotification) {
        notification.destroy();
        notification.success({
          message: "Thành công",
          description: "Linh kiện đã được xóa thành công!",
          duration: 3,
        });
      }
      await fetchComponents(
        pagination.current,
        pagination.pageSize,
        searchName
      ); // Làm mới danh sách components sau khi ẩn
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi ẩn linh kiện!",
        duration: 3,
      });
      console.error(
        `Error hiding component with id ${id}:`,
        error.response?.data || error.message
      );
    }
  };

  // Function to restore a hidden component
  const restoreComponent = async (id, showNotification = true) => {
    try {
      if (!id) {
        console.error("ID không hợp lệ khi phục hồi component:", id);
        return;
      }
      // Gọi API PUT để phục hồi component
      const response = await api.put(`components/restore/${id}`);
      console.log("Component restored:", response.data);

      if (showNotification) {
        notification.destroy();
        notification.success({
          message: "Thành công",
          description: "Phục hồi linh kiện thành công!",
          duration: 3,
        });
      }
      await fetchComponents(
        pagination.current,
        pagination.pageSize,
        searchName
      ); // Làm mới danh sách components sau khi phục hồi
    } catch (error) {
      console.error(
        `Error restoring component with id ${id}:`,
        error.response.data
      );
      notification.error({
        message: "Lỗi",
        description: `Có lỗi xảy ra khi phục hồi linh kiện với id ${id}: ${
          error.response.data.details?.message || "Lỗi không xác định"
        }`,
      });
    }
  };

  // Function to create a new component
  const createComponent = async (newComponent) => {
    try {
      setIsSubmitting(true); // Bắt đầu loading
      const payload = {
        "type-id": newComponent.typeId,
        name: newComponent.name,
      };

      const response = await api.post("/components", payload);

      await fetchComponents(
        pagination.current,
        pagination.pageSize,
        searchName
      ); // Làm mới danh sách sau khi tạo
      setOpen(false); // Đóng modal
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi tạo linh kiện!",
        duration: 3,
      });
    } finally {
      setIsSubmitting(false); // Kết thúc loading
    }
  };

  // Function to update an existing component
  const updateComponent = async (
    id,
    updatedComponent,
    showNotification = true
  ) => {
    try {
      setIsSubmitting(true); // Bắt đầu loading
      const payload = {
        id: id,
        "type-id": updatedComponent.typeId,
        name: updatedComponent.name,
      };
      const response = await api.put("components", payload);
      if (showNotification) {
        notification.destroy();
        notification.success({
          message: "Thành công",
          description: "Linh kiện đã được cập nhật thành công!",
          duration: 3,
        });
      }
      await fetchComponents(
        pagination.current,
        pagination.pageSize,
        searchName
      ); // Làm mới danh sách sau khi cập nhật
      setOpen(false); // Đóng modal
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật linh kiện!",
        duration: 3,
      });
    } finally {
      setIsSubmitting(false); // Kết thúc loading
    }
  };

  // Mở modal để chỉnh sửa
  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      name: record.name,
      typeId: record["type-id"],
    });
    setOpen(true);
  };

  // Lưu hoặc cập nhật component
  const handleSaveOrUpdate = async (values) => {
    if (editingRecord) {
      await updateComponent(editingRecord.id, values);
    } else {
      await createComponent(values);
    }
    form.resetFields();
    setEditingRecord(null);
  };

  const handleTableChange = (page, pageSize) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize,
    }));
    fetchComponents(page, pageSize);
  };

  const handleSearch = () => {
    fetchComponents(1, pagination.pageSize, searchName);
  };
  useEffect(() => {
    fetchComponents(pagination.current, pagination.pageSize);
    fetchTypes();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 50,
    },
    {
      title: "Tên linh kiện",
      dataIndex: "name",
      key: "name",
      width: 500,
      render: (name) => (
        <Text className="font-semibold text-pink-500">{name}</Text>
      ),
    },
    {
      title: "Loại linh kiện",
      dataIndex: "type-id",
      key: "type-id",
      width: 200,
      render: (typeId) => (
        <Text className="font-semibold text-grey-700">
          {types.find((type) => type.id === typeId)?.name || "Unknown Type"}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status ? "green" : "red"} className="font-semibold">
          {status ? "Có sẵn" : "Không có sẵn"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-5 text-xl">
          <EditOutlined
            onClick={() => handleEdit(record)}
            className="cursor-pointer"
          />

          {record.status ? (
            <Popconfirm
              title="Bạn có chắc chắn muốn ẩn linh kiện này không?"
              onConfirm={() => hideComponent(record.id)}
            >
              <DeleteOutlined className="cursor-pointer text-red-500" />
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Bạn có muốn phục hồi linh kiện này không?"
              onConfirm={() => restoreComponent(record.id)}
            >
              <UndoOutlined className="restore-button cursor-pointer text-green-400" />
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between p-4 bg-white shadow-md items-center mb-3">
        <div className="text-3xl font-semibold text-gray-700">
          Quản lý linh kiện Kit
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm theo tên"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <Button
            icon={<SearchOutlined />}
            onClick={handleSearch}
            type="primary"
          >
            Tìm kiếm
          </Button>
        </div>
      </div>
      <div className="flex justify-end ml-5 mb-3">
        <button
          onClick={() => {
            form.resetFields();
            setEditingRecord(null);
            setOpen(true);
          }}
          className="flex mr-10 gap-3 text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-10 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
        >
          <div>
            <PlusCircleOutlined />
          </div>
          Thêm
        </button>
      </div>
      <Table
        bordered
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: false,
          onChange: handleTableChange, // Hàm để cập nhật bảng khi chuyển trang
        }}
      />
      {/* Modal để tạo/chỉnh sửa linh kiện */}
      <Modal
        title={editingRecord ? "Chỉnh sửa Linh Kiện" : "Tạo mới Linh Kiện"}
        visible={isOpen}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Spin spinning={isSubmitting}>
          <Form form={form} onFinish={handleSaveOrUpdate} layout="vertical">
            <Form.Item
              name="name"
              label="Tên linh kiện"
              rules={[
                { required: true, message: "Vui lòng nhập tên linh kiện!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="typeId"
              label="Loại linh kiện"
              rules={[
                { required: true, message: "Vui lòng chọn loại linh kiện!" },
              ]}
            >
              <Select placeholder="Chọn loại linh kiện">
                {types.map((type) => (
                  <Option key={type.id} value={type.id}>
                    {type.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
}

export default ManagerContentComponent;
