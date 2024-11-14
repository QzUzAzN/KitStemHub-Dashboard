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
  Tag,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  MailOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import moment from "moment";
import AddressModal from "./AddressModal";

const { Option } = Select;
const { Text } = Typography;

function ManagerStaff() {
  const [form] = Form.useForm();
  const [formFilter] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [address, setAddress] = useState("");

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

  const fetchStaff = async (
    page = 1,
    pageSize = 20,
    searchFilters = filters
  ) => {
    try {
      setLoading(true);
      const params = {
        role: "staff",
        email: searchFilters.email,
        "phone-number": searchFilters.phoneNumber,
        "first-name": searchFilters.firstName,
        "last-name": searchFilters.lastName,
        status:
          searchFilters.status === undefined ? undefined : searchFilters.status,
        page: page - 1,
        pageSize: pageSize,
      };
      const response = await api.get("/users", {
        params,
      });

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
        // const currentPage = response.data.details.data["current-page"] || 0;

        setDataSource(staffData);
        setPagination({
          total: totalPages * pageSize,
          current: page,
          pageSize: pageSize,
        });
      } else {
        setDataSource([]);
        setPagination({
          total: 0,
          current: 1,
          pageSize: pageSize,
        });
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching staff:", error);
      setLoading(false);
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
        address: address,
        "gender-code": values["gender-code"],
        "birth-date": values["birth-date"].format("YYYY-MM-DD"),
      };
      console.log("Create payload:", payload);
      const response = await api.post("/users/register/staff", payload);
      console.log("Create response:", response.data);
      notification.success({
        message: "Thành công",
        description: "Nhân viên đã được thêm thành công!",
      });
      await fetchStaff();
      setIsModalVisible(false);
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
    const updatedFilters = { ...filters, ...values };
    setFilters(updatedFilters);
    fetchStaff(1, pagination.pageSize, updatedFilters);
  };

  const resetFilters = () => {
    formFilter.resetFields();
    setFilters({
      email: "",
      phoneNumber: "",
      firstName: "",
      lastName: "",
      status: undefined,
    });
    fetchStaff(1, pagination.pageSize, {
      email: "",
      phoneNumber: "",
      firstName: "",
      lastName: "",
      status: undefined,
    });
  };

  const handleAddStaff = () => {
    setEditingRecord(null);
    form.resetFields();
    setAddress("");
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const checkAvailability = async (email, phoneNumber) => {
    try {
      const response = await api.get("/users", { params: { role: "staff" } });
      const emails = response.data.details.data.users.map(
        (user) => user["user-name"]
      );
      const phoneNumbers = response.data.details.data.users.map(
        (user) => user["phone-number"]
      );
      const emailExists = emails.includes(email);
      const phoneNumberExists = phoneNumbers.includes(phoneNumber);

      return { emailExists, phoneNumberExists };
    } catch (error) {
      console.log("Lỗi check email or sdt: ", error);
      return { emailExists: false, phoneNumberExists: false };
    }
  };

  const handleSave = async () => {
    try {
      const values = form.getFieldsValue();

      await form.validateFields();

      if (editingRecord) {
        updateStaff(editingRecord["user-name"], values);
      } else {
        const { emailExists, phoneNumberExists } = await checkAvailability(
          values.email,
          values["phone-number"]
        );

        if (emailExists) {
          form.setFields([
            {
              name: "email",
              errors: ["Email đã tồn tại. Vui lòng nhập email khác!"],
            },
          ]);
        }
        if (phoneNumberExists) {
          form.setFields([
            {
              name: "phone-number",
              errors: ["Số điện thoại đã tồn tại. Vui lòng nhập số khác!"],
            },
          ]);
        }
        if (!emailExists && !phoneNumberExists) {
          createStaff(values);
        }
      }
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };
  const handleAddressSelected = (selectedAddress) => {
    setAddress(selectedAddress);
    form.setFieldsValue({ address: selectedAddress });
    setIsAddressModalVisible(false);
  };

  useEffect(() => {
    fetchStaff();
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
      title: "Họ",
      dataIndex: "last-name",
      key: "last-name",
      width: 150,
      render: (lastName) => <Text className="font-semibold">{lastName}</Text>,
    },
    {
      title: "Tên",
      dataIndex: "first-name",
      key: "first-name",
      width: 150,
      render: (firstName) => <Text className="font-semibold">{firstName}</Text>,
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
  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const passwordRegex =
    /^(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
  const lastNameRegex = /^[A-Za-zÀ-ỹ\s]+$/;
  const firstNameRegex = /^[A-Za-zÀ-ỹ\s]+$/;
  const phoneNumberRegex = /^(0[3|5|7|8|9])+([0-9]{8})\b/;
  return (
    <div>
      <Form form={formFilter} onFinish={handleFilterSubmit}>
        <div className="flex justify-between p-4 bg-white shadow-md items-center mb-7">
          <div className="text-2xl font-semibold text-gray-700">
            Quản Lý Nhân Viên
          </div>
          {/* Filter Form */}
          <div className="flex flex-wrap justify-end">
            <div className="w-full flex gap-4 justify-end">
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
                  <Option value={true}>
                    <Tag color="green" className="font-semibold">
                      Hoạt động
                    </Tag>
                  </Option>
                  <Option value={false}>
                    <Tag color="red" className="font-semibold">
                      Vô hiệu hóa
                    </Tag>
                  </Option>
                </Select>
              </Form.Item>
            </div>
            <div className="w-full flex gap-2 justify-end">
              <Button
                icon={<SearchOutlined />}
                type="primary"
                htmlType="submit"
                className="mr-2"
              >
                Tìm kiếm
              </Button>
              <Button onClick={resetFilters}>Đặt lại</Button>
            </div>
          </div>
        </div>
      </Form>
      <div className="flex justify-end ml-5 mb-3">
        <button
          onClick={handleAddStaff}
          className="flex mr-4 gap-3 text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-10 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
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
        rowKey="user-name"
        pagination={{
          total: pagination.total,
          current: pagination.current,
          pageSize: pagination.pageSize,
          onChange: (page) => fetchStaff(page, pagination.pageSize),
        }}
      />

      <Modal
        title={editingRecord ? "Chỉnh sửa Nhân Viên" : "Thêm Nhân Viên"}
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSave}
        confirmLoading={isSubmitting}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập email!",
              },
              {
                pattern: emailRegex,
                message: "Email không hợp lệ!",
              },
            ]}
            validateTrigger="onBlur"
          >
            <Input
              autoComplete="off"
              onChange={() => form.setFields([{ name: "email", errors: [] }])}
              disabled={!!editingRecord}
              placeholder="staff@example.com"
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu!",
              },
              {
                pattern: passwordRegex,
                message: "Mật khẩu không hợp lệ!",
              },
            ]}
            validateTrigger="onBlur"
          >
            <Input.Password
              autoComplete="new-password"
              onChange={() =>
                form.setFields([{ name: "password", errors: [] }])
              }
              disabled={!!editingRecord}
            />
          </Form.Item>
          <Form.Item
            name="last-name"
            label="Họ"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập họ!",
              },
              {
                pattern: lastNameRegex,
                message: "Họ không hợp lệ!",
              },
            ]}
            validateTrigger="onBlur"
          >
            <Input
              onChange={() =>
                form.setFields([{ name: "last-name", errors: [] }])
              }
            />
          </Form.Item>
          <Form.Item
            name="first-name"
            label="Tên"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên!",
              },
              {
                pattern: firstNameRegex,
                message: "Tên không hợp lệ!",
              },
            ]}
            validateTrigger="onBlur"
          >
            <Input
              onChange={() =>
                form.setFields([{ name: "first-name", errors: [] }])
              }
            />
          </Form.Item>

          <Form.Item
            name="phone-number"
            label="Số điện thoại"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập số điện thoại!",
              },
              {
                pattern: phoneNumberRegex,
                message: "Số điện thoại không hợp lệ!",
              },
            ]}
            validateTrigger="onBlur"
          >
            <Input
              onChange={() =>
                form.setFields([{ name: "phone-number", errors: [] }])
              }
            />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
            validateTrigger="onBlur"
          >
            <Input
              value={address}
              onClick={() => setIsAddressModalVisible(true)}
              readOnly
              placeholder="Nhấn để chọn địa chỉ"
              onChange={() => form.setFields([{ name: "address", errors: [] }])}
            />
          </Form.Item>
          <Form.Item
            name="gender-code"
            label="Giới tính"
            rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
            validateTrigger="onBlur"
          >
            <Select
              onChange={() =>
                form.setFields([{ name: "gender-code", errors: [] }])
              }
            >
              <Option value={1}>Nam</Option>
              <Option value={2}>Nữ</Option>
              <Option value={0}>Khác</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="birth-date"
            label="Ngày sinh"
            rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
            validateTrigger="onBlur"
          >
            <DatePicker
              format="YYYY-MM-DD"
              style={{ width: "100%" }}
              onChange={() =>
                form.setFields([{ name: "birth-date", errors: [] }])
              }
            />
          </Form.Item>
        </Form>
      </Modal>
      <AddressModal
        visible={isAddressModalVisible}
        onClose={() => setIsAddressModalVisible(false)}
        onAddressSelected={handleAddressSelected}
      />
    </div>
  );
}

export default ManagerStaff;
