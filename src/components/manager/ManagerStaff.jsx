import { useEffect, useState } from "react";
import api from "../../config/axios";
import {
  Form,
  Input,
  InputNumber,
  Modal,
  notification,
  Popconfirm,
  Spin,
  Table,
} from "antd";
import { DeleteOutlined, EditOutlined, UndoOutlined } from "@ant-design/icons";

function ManagerStaff() {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [isOpen, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Fetch staff data from API
  const fetchStaff = async (page = 1, pageSize = 20) => {
    try {
      const response = await api.get("/users", {
        params: {
          role: "staff", // Role "staff"
          page: page - 1,
          pageSize: pageSize,
        },
      });

      if (
        response.data &&
        response.data.details &&
        response.data.details.data &&
        response.data.details.data.users
      ) {
        const staffData = response.data.details.data.users;
        const totalPages = response.data.details.data["total-pages"] || 0;
        const currentPage = response.data.details.data["current-page"] || 1;

        setDataSource(staffData);
        setPagination({
          total: totalPages * pageSize,
          current: currentPage,
          pageSize: pageSize,
        });
      } else {
        setDataSource([]);
        setPagination({
          total: 0,
          current: 1,
          pageSize: pageSize,
        });
        console.error("No staff data found in response:", response.data);
      }

      setLoading(false);
      notification.destroy();
      notification.success({
        message: "Thành công",
        description: "Lấy danh sách nhân viên thành công!",
        duration: 3,
      });
    } catch (error) {
      console.error("Error fetching staff:", error);
      setLoading(false);
      notification.destroy();
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi lấy danh sách nhân viên!",
        duration: 3,
      });
    }
  };

  const updateStaff = async (id, updatedStaff) => {
    try {
      setIsSubmitting(true);
      const response = await api.put(`/users/${id}`, updatedStaff);
      console.log("Updated Staff:", response.data);
      await fetchStaff();
      notification.destroy();
      notification.success({
        message: "Thành công",
        description: "Nhân viên đã được cập nhật thành công!",
      });
    } catch (error) {
      notification.destroy();
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật nhân viên!",
      });
      console.error(`Error updating staff with id ${id}:`, error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteStaff = async (userName) => {
    try {
      setIsSubmitting(true);
      const response = await api.delete(
        `users/${encodeURIComponent(userName)}`
      );
      console.log("Staff deleted:", response.data);
      await fetchStaff();
      notification.destroy();
      notification.success({
        message: "Thành công",
        description: "Nhân viên đã được xóa thành công!",
      });
    } catch (error) {
      notification.destroy();
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi xóa nhân viên!",
      });
      console.error(
        `Error deleting staff with username ${userName}:`,
        error.message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const restoreStaff = async (userName) => {
    try {
      setIsSubmitting(true);
      const response = await api.put(
        `/users/restore/${encodeURIComponent(userName)}`
      );
      console.log("Staff restored:", response.data);
      await fetchStaff();
      notification.destroy();
      notification.success({
        message: "Thành công",
        description: "Nhân viên đã được khôi phục thành công!",
      });
    } catch (error) {
      notification.destroy();
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi khôi phục nhân viên!",
      });
      console.error(
        `Error restoring staff with username ${userName}:`,
        error.message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      status: record.status ? true : false,
    });
    setOpen(true);
  };

  const handleSaveOrUpdate = async (values) => {
    try {
      const staffData = {
        id: editingRecord ? editingRecord.id : null,
        ...values,
      };
      if (editingRecord) {
        await updateStaff(editingRecord.id, staffData);
      }
      setOpen(false);
      form.resetFields();
      setEditingRecord(null);
    } catch (error) {
      console.error("Failed to save or update staff:", error);
    }
  };

  useEffect(() => {
    if (isFirstLoad) {
      fetchStaff(); // Tải dữ liệu lần đầu
      setIsFirstLoad(false);
    }
  }, [isFirstLoad]);

  const columns = [
    {
      title: "User Name",
      dataIndex: "user-name",
      key: "user-name",
      width: 200,
    },
    {
      title: "First Name",
      dataIndex: "first-name",
      key: "first-name",
      width: 150,
    },
    {
      title: "Last Name",
      dataIndex: "last-name",
      key: "last-name",
      width: 150,
    },
    {
      title: "Phone Number",
      dataIndex: "phone-number",
      key: "phone-number",
      width: 150,
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      width: 300,
    },
    {
      title: "Points",
      dataIndex: "points",
      key: "points",
      render: (points) => <span>{points || 0}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span style={{ color: status ? "green" : "red" }}>
          {status ? "Available" : "Unavailable"}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-5 text-xl">
          <EditOutlined
            onClick={() => handleEdit(record)}
            className="cursor-pointer"
          />
          {record.status ? (
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa?"
              onConfirm={() => {
                console.log("Attempting to delete staff:", record["user-name"]);
                deleteStaff(record["user-name"]);
              }}
            >
              <DeleteOutlined className="cursor-pointer text-red-500" />
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Bạn có muốn khôi phục nhân viên này?"
              onConfirm={() => {
                console.log(
                  "Attempting to restore staff:",
                  record["user-name"]
                );
                restoreStaff(record["user-name"]);
              }}
            >
              <UndoOutlined className="cursor-pointer text-green-400" />
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <Form form={form} component={false}>
      <div className="flex justify-between p-4 bg-white shadow-md items-center mb-7">
        <div className="text-2xl font-semibold text-gray-700">
          Quản Lý Nhân Viên
        </div>
      </div>

      <Table
        bordered
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        rowKey="user-name"
        pagination={{
          total: pagination.total,
          current: pagination.current,
          pageSize: pagination.pageSize,
          onChange: (page) => fetchStaff(page),
        }}
      />

      <Modal
        title={editingRecord ? "Edit Staff" : "Create New Staff"}
        open={isOpen}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Spin spinning={isSubmitting}>
          <Form
            form={form}
            labelCol={{ span: 24 }}
            onFinish={handleSaveOrUpdate}
          >
            <Form.Item
              label="First Name"
              name="first-name"
              rules={[
                { required: true, message: "Please input the first name!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Last Name"
              name="last-name"
              rules={[
                { required: true, message: "Please input the last name!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phone-number"
              rules={[
                { required: true, message: "Please input the phone number!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true, message: "Please input the address!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Points"
              name="points"
              rules={[{ required: true, message: "Please input the points!" }]}
            >
              <InputNumber min={0} />
            </Form.Item>

            <Form.Item label="Status" name="status" valuePropName="checked">
              <Input type="checkbox" />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </Form>
  );
}

export default ManagerStaff;
