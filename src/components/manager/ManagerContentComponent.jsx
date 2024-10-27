import {
  DeleteOutlined,
  UndoOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import {
  Table,
  notification,
  Popconfirm,
  Form,
  Spin,
  Modal,
  Input,
  InputNumber,
} from "antd";
import { useEffect, useState } from "react";
import api from "../../config/axios";

function ManagerContentComponent() {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái loading cho create và update
  const [isOpen, setOpen] = useState(false); // Để mở/đóng modal
  const [editingRecord, setEditingRecord] = useState(null); // Để lưu record hiện tại nếu chỉnh sửa
  const [form] = Form.useForm(); // Khởi tạo form của Ant Design
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  }); // Thêm trạng thái phân trang

  // Fetch components from the API
  const fetchComponents = async (
    page = 1,
    pageSize = 20,
    showNotification = true
  ) => {
    try {
      setLoading(true);
      const params = { page: page - 1, pageSize };
      const response = await api.get("/components", {
        params,
      }); // API để lấy danh sách components
      if (
        response.data &&
        response.data.details &&
        response.data.details.data.components
      ) {
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
      if (showNotification) {
        notification.destroy();
        notification.success({
          message: "Thành công",
          description: "Lấy danh sách linh kiện thành công!",
          duration: 3,
        });
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching components:", error);
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi lấy danh sách linh kiện!",
        duration: 3,
      });
    }
  };

  // Function to hide (delete) a component
  const hideComponent = async (id, showNotification = true) => {
    try {
      if (!id) {
        console.error("ID không hợp lệ khi ẩn component:", id);
        return;
      }

      console.log(`Attempting to hide component with id: ${id}`);

      // Gọi API DELETE để ẩn component
      const response = await api.delete(`components/${id}`);
      console.log("Component hidden:", response.data);

      if (showNotification) {
        notification.destroy();
        notification.success({
          message: "Thành công",
          description: "Linh kiện đã được ẩn thành công!",
          duration: 3,
        });
      }
      await fetchComponents(pagination.current, pagination.pageSize, false); // Làm mới danh sách components sau khi ẩn
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

      console.log(`Attempting to restore component with id: ${id}`);

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
      await fetchComponents(pagination.current, pagination.pageSize, false); // Làm mới danh sách components sau khi phục hồi
    } catch (error) {
      if (error.response) {
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
      } else {
        console.error(
          `Error restoring component with id ${id}:`,
          error.message
        );
        notification.error({
          message: "Lỗi",
          description: `Có lỗi xảy ra khi phục hồi linh kiện với id ${id}: ${error.message}`,
        });
      }
    }
  };

  // Function to create a new component
  const createComponent = async (newComponent, showNotification = true) => {
    try {
      setIsSubmitting(true); // Bắt đầu loading
      const payload = {
        "type-id": newComponent.typeId,
        name: newComponent.name,
      };
      const response = await api.post("components", payload);
      if (showNotification) {
        notification.destroy();
        notification.success({
          message: "Thành công",
          description: "Linh kiện đã được tạo thành công!",
          duration: 3,
        });
      }
      await fetchComponents(false); // Làm mới danh sách sau khi tạo
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
      await fetchComponents(pagination.current, pagination.pageSize, false); // Làm mới danh sách sau khi cập nhật
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
  useEffect(() => {
    fetchComponents(pagination.current, pagination.pageSize); // Fetch danh sách components khi component được mount
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
    },
    {
      title: "Type ID", // Cột mới để hiển thị Type ID
      dataIndex: "type-id",
      key: "type-id",
      width: 200,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span style={{ color: status ? "green" : "red" }}>
          {status ? "Available" : "Unavailable"}
        </span>
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
        <div className="text-3xl font-semibold text-gray-700">Quản lý Kit</div>
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
              label="Type ID"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập Type ID!",
                  type: "number",
                  min: 1,
                },
              ]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
}

export default ManagerContentComponent;
