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
  Tag,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  MailOutlined,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { Option } from "antd/es/mentions";

const { Text } = Typography;

function ManagerUser() {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch user data from API
  const fetchUsers = async (
    page = 1,
    pageSize = 20,
    searchFilters = filters,
    showNotification = true
  ) => {
    try {
      setLoading(true);
      const params = {
        role: "customer", // Role "customer"
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
        const userData = response.data.details.data.users;
        const totalPages = response.data.details.data["total-pages"] || 0;
        const currentPage = response.data.details.data["current-page"] || 0;

        setDataSource(userData);
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
        console.error("No user data found in response:", response.data);
      }

      setLoading(false);
      if (showNotification) {
        notification.destroy();
        notification.success({
          message: "Thành công",
          description: "Lấy danh sách người dùng thành công!",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
      notification.destroy();
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi lấy danh sách người dùng!",
        duration: 3,
      });
    }
  };

  const deleteUser = async (userName) => {
    try {
      setIsSubmitting(true);
      const response = await api.delete(
        `users/${encodeURIComponent(userName)}`
      );
      console.log("User deleted:", response.data);
      await fetchUsers();
      notification.destroy();
      notification.success({
        message: "Thành công",
        description: "Người dùng đã được xóa thành công!",
      });
    } catch (error) {
      notification.destroy();
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi xóa người dùng!",
      });
      console.error(`Error deleting user with id ${userName}:`, error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const restoreUser = async (userName) => {
    try {
      setIsSubmitting(true);
      const response = await api.put(
        `/users/restore/${encodeURIComponent(userName)}`
      );
      console.log("User restored:", response.data);
      await fetchUsers();
      notification.destroy();
      notification.success({
        message: "Thành công",
        description: "Người dùng đã được khôi phục thành công!",
      });
    } catch (error) {
      notification.destroy();
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi khôi phục người dùng!",
      });
      console.error(`Error restoring user with id ${userName}:`, error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterSubmit = (values) => {
    console.log("filter: ", values);
    setFilters(values);
    fetchUsers(1, pagination.pageSize, values);
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
    fetchUsers(1, pagination.pageSize);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    {
      title: "Email",
      dataIndex: "user-name",
      key: "user-name",
      width: 300,
      render: (userName) => (
        <Text className="font-semibold text-blue-500">
          <MailOutlined className="text-gray-500 pr-2" /> {userName}
        </Text>
      ),
    },
    {
      title: "Tên",
      dataIndex: "first-name",
      key: "first-name",
      width: 150,
      render: (firstName) => <Text className="font-semibold">{firstName}</Text>,
    },
    {
      title: "Họ",
      dataIndex: "last-name",
      key: "last-name",
      width: 150,
      render: (lastName) => <Text className="font-semibold">{lastName}</Text>,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone-number",
      key: "phone-number",
      width: 150,
      render: (phoneNumber) => (
        <Text className="font-semibold">{phoneNumber}</Text>
      ),
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      width: 300,
      render: (address) => <Text className="font-semibold">{address}</Text>,
    },
    {
      title: "Điểm",
      dataIndex: "points",
      key: "points",
      render: (points) => <Text className="font-semibold">{points || 0}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status ? "green" : "red"} className="font-semibold">
          {status ? "Hoạt động" : "Vô hiệu hóa"}
        </Tag>
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
                console.log("Attempting to delete user:", record["user-name"]); // Kiểm tra tên người dùng
                deleteUser(record["user-name"]); // Gọi hàm xoá với tên người dùng
              }}
            >
              <DeleteOutlined className="cursor-pointer text-red-500" />
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Bạn có muốn khôi phục người dùng này?"
              onConfirm={() => {
                console.log("Attempting to restore user:", record["user-name"]);
                restoreUser(record["user-name"]); // Khôi phục người dùng thành "Available"
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
          Quản Lý Người Dùng
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
              <Option value={undefined}>
                <Tag color="grey">Tất cả</Tag>
              </Option>
              <Option value={true}>
                <Tag color="green">Hoạt động</Tag>
              </Option>
              <Option value={false}>
                <Tag color="red">Vô hiệu hóa</Tag>
              </Option>
            </Select>
          </Form.Item>
          <Button
            icon={<SearchOutlined />}
            type="primary"
            htmlType="submit"
            className="mr-2"
          >
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
          onChange: (page) => fetchUsers(page),
        }}
      />
    </Form>
  );
}

export default ManagerUser;
