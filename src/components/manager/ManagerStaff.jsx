import { useEffect, useState } from "react";
import api from "../../config/axios";
import {
  Button,
  Form,
  Input,
  notification,
  Popconfirm,
  Select,
  Table,
} from "antd";
import { DeleteOutlined, UndoOutlined } from "@ant-design/icons";

const { Option } = Select;

function ManagerStaff() {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [editingRecord, setEditingRecord] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    email: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
    status: undefined,
  });

  // Fetch staff data from API
  const fetchStaff = async (
    page = 1,
    pageSize = 20,
    searchFilters = filters,
    showNotification = true
  ) => {
    try {
      setLoading(true);
      const params = {
        role: "staff",
        email: searchFilters.email || undefined,
        "phone-number": searchFilters.phoneNumber || undefined,
        "first-name": searchFilters.firstName || undefined,
        "last-name": searchFilters.lastName || undefined,
        status:
          searchFilters.status === undefined ? undefined : searchFilters.status,
        page: page - 1,
        pageSize: pageSize,
      };
      console.log("params: ", params);
      const response = await api.get("users", {
        params,
      });

      if (
        response.data &&
        response.data.details &&
        response.data.details.data &&
        response.data.details.data.users
      ) {
        const staffData = response.data.details.data.users;
        const totalPages = response.data.details.data["total-pages"] || 0;
        const currentPage = response.data.details.data["current-page"] || 0;

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
      if (showNotification) {
        notification.destroy();
        notification.success({
          message: "Thành công",
          description: "Lấy danh sách nhân viên thành công!",
          duration: 3,
        });
      }
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

  const handleFilterSubmit = (values) => {
    console.log("fileter: ", values);
    setFilters(values);
    fetchStaff(1, pagination.pageSize, values);
  };

  const resetFilters = () => {
    form.resetFields();
    setFilters({
      email: "",
      phoneNumber: "",
      firstName: "",
      lastName: "",
      status: undefined,
    });
    fetchStaff(1, pagination.pageSize);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const columns = [
    {
      title: "Email",
      dataIndex: "user-name",
      key: "user-name",
      width: 200,
    },
    {
      title: "Tên",
      dataIndex: "first-name",
      key: "first-name",
      width: 150,
    },
    {
      title: "Họ",
      dataIndex: "last-name",
      key: "last-name",
      width: 150,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone-number",
      key: "phone-number",
      width: 150,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      width: 300,
    },
    {
      title: "Điểm",
      dataIndex: "points",
      key: "points",
      render: (points) => <span>{points || 0}</span>,
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
          {record.status ? (
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa?"
              onConfirm={() => {
                deleteStaff(record["user-name"]);
              }}
            >
              <DeleteOutlined className="cursor-pointer text-red-500" />
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Bạn có muốn khôi phục nhân viên này?"
              onConfirm={() => {
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
    <Form form={form} component={false} onFinish={handleFilterSubmit}>
      <div className="flex justify-between p-4 bg-white shadow-md items-center mb-7">
        <div className="text-2xl font-semibold text-gray-700">
          Quản Lý Nhân Viên
        </div>
        {/* Filter Form */}
        <Form layout="inline" onFinish={handleFilterSubmit}>
          <Form.Item name="email">
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item name="phoneNumber">
            <Input placeholder="Số điện thoại" />
          </Form.Item>
          <Form.Item name="firstName">
            <Input placeholder="Tên" />
          </Form.Item>
          <Form.Item name="lastName">
            <Input placeholder="Họ" />
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="Trạng thái" style={{ width: 120 }}>
              <Option value={undefined}>Tất cả</Option>
              <Option value={true}>Có</Option>
              <Option value={false}>Không</Option>
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Tìm kiếm
          </Button>
          <Button onClick={resetFilters}>Đặt lại</Button>
        </Form>
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
    </Form>
  );
}

export default ManagerStaff;
