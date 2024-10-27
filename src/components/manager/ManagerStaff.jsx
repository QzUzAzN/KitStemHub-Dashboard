import { useEffect, useState } from "react";
import api from "../../config/axios";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  notification,
  Popconfirm,
  Select,
  Table,
} from "antd";
import { DeleteOutlined, EditOutlined, UndoOutlined } from "@ant-design/icons";
import moment from "moment";

const { Option } = Select;

function ManagerStaff() {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
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
      const response = await api.get("/users", {
        params,
      });
      console.log(response.data.details.data.users); // Kiểm tra dữ liệu trả về từ API

      if (response.data?.details?.data?.users) {
        const staffData = response.data.details.data.users.map((user) => ({
          ...user,
          "gender-code":
            user.gender === "Male"
              ? 1
              : user.gender === "Female"
              ? 2
              : user.gender === "Other"
              ? 0
              : undefined,
        }));
        console.log(staffData);
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

  const createStaff = async (values) => {
    try {
      setIsSubmitting(true);
      const payload = {
        email: values.email,
        password: values.password,
        "first-name": values["first-name"],
        "last-name": values["last-name"],
        "phone-number": values["phone-number"],
        address: values.address,
        "gender-code": values["gender-code"],
        "birth-date": values["birth-date"].format("YYYY-MM-DD"),
      };
      console.log("Create payload:", payload);
      const response = await api.post("/users/register/staff", payload);
      console.log("Create response:", response.data); // Kiểm tra dữ liệu trả về sau khi tạo
      notification.success({
        message: "Thành công",
        description: "Nhân viên đã được thêm thành công!",
      });
      await fetchStaff(); // Refresh the list
      setIsModalVisible(false); // Close modal after success
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi thêm nhân viên!",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStaff = async (staffUserName, values) => {
    try {
      setIsSubmitting(true);
      const payload = {
        "first-name": values["first-name"] || editingRecord["first-name"],
        "last-name": values["last-name"] || editingRecord["last-name"],
        "phone-number": values["phone-number"] || editingRecord["phone-number"],
        address: values.address || editingRecord.address,
        "gender-code": values["gender-code"] ?? editingRecord["gender"],
        "birth-date": values["birth-date"]
          ? values["birth-date"].format("YYYY-MM-DD")
          : editingRecord["birth-date"],
      };

      await api.put(
        `/users/profile/staff/${encodeURIComponent(staffUserName)}`,
        payload
      );
      notification.success({
        message: "Thành công",
        description: "Thông tin nhân viên đã được cập nhật thành công!",
      });
      await fetchStaff(); // Refresh danh sách nhân viên
      setIsModalVisible(false); // Đóng modal sau khi cập nhật thành công
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật thông tin nhân viên!",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      email: record["user-name"],
      "first-name": record["first-name"],
      "last-name": record["last-name"],
      "phone-number": record["phone-number"],
      address: record.address,
      "gender-code": record["gender-code"],
      "birth-date": moment(record["birth-date"]),
    });
    setIsModalVisible(true);
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

  // Hàm mở modal và reset lại form
  const handleAddStaff = () => {
    setEditingRecord(null); // Đảm bảo không có bản ghi đang chỉnh sửa
    form.resetFields(); // Reset tất cả các trường của form
    setIsModalVisible(true);
  };

  // Đóng modal và đảm bảo rằng form được reset mỗi khi modal đóng
  const handleCancel = () => {
    form.resetFields(); // Reset lại form khi đóng modal
    setIsModalVisible(false);
  };

  const handleSave = (values) => {
    if (editingRecord) {
      updateStaff(editingRecord["user-name"], values);
    } else {
      createStaff(values);
    }
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
      title: "Giới tính",
      dataIndex: "gender-code",
      key: "gender-code",
      width: 100,
      render: (genderCode) => {
        switch (genderCode) {
          case 1:
            return "Nam";
          case 2:
            return "Nữ";
          case 0:
            return "Khác";
          default:
            return "Không xác định";
        }
      },
    },
    {
      title: "Ngày sinh",
      dataIndex: "birth-date",
      key: "birth-date",
      width: 150,
      render: (birthDate) =>
        birthDate ? moment(birthDate).format("DD-MM-YYYY") : "Không có",
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
          <EditOutlined
            onClick={() => handleEdit(record)}
            className="cursor-pointer"
          />

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
  console.log(dataSource); // Kiểm tra dataSource trước khi render bảng
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
      <Button type="primary" onClick={handleAddStaff}>
        Thêm Nhân Viên
      </Button>
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
        title={editingRecord ? "Chỉnh sửa Nhân Viên" : "Thêm Nhân Viên"}
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        confirmLoading={isSubmitting}
      >
        <Form form={form} onFinish={handleSave} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input disabled={!!editingRecord} />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: !editingRecord, message: "Vui lòng nhập mật khẩu!" },
            ]}
          >
            <Input.Password
              autoComplete="new-password"
              disabled={!!editingRecord}
            />
            {/* Dùng "new-password" cho trường hợp đăng ký */}
          </Form.Item>
          <Form.Item
            name="first-name"
            label="Tên"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="last-name"
            label="Họ"
            rules={[{ required: true, message: "Vui lòng nhập họ!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="phone-number" label="Số điện thoại">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input />
          </Form.Item>
          <Form.Item
            name="gender-code"
            label="Giới tính"
            rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
          >
            <Select>
              <Option value={1}>Nam</Option>
              <Option value={2}>Nữ</Option>
              <Option value={0}>Khác</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="birth-date"
            label="Ngày sinh"
            rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </Form>
  );
}

export default ManagerStaff;
