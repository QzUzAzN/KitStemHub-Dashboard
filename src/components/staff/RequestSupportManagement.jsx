import { useState, useEffect } from "react";
import {
  Table,
  Button,
  message,
  Modal,
  Card,
  Typography,
  Space,
  Tag,
} from "antd";
import { motion } from "framer-motion";
import {
  PlusOutlined,
  CheckOutlined,
  UserOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import { toast } from "react-toastify";

const { Title, Text } = Typography;

function RequestSupportManagement() {
  const [labSupports, setLabSupports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabSupports();
  }, []);

  const fetchLabSupports = async () => {
    try {
      const response = await api.get("labsupports?supported=false");
      if (response.data.status === "success") {
        setLabSupports(response.data.detail.data["lab-supports"]);
      } else {
        message.error("Không thể tải danh sách hỗ trợ");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách hỗ trợ:", error);
      toast.warning("Hiện tại chưa có yêu cầu hỗ trợ từ khách hàng!");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStaff = async (record) => {
    Modal.confirm({
      title: "Xác nhận nhận hỗ trợ",
      content: "Bạn có chắc chắn muốn nhận hỗ trợ cho yêu cầu này?",
      onOk: async () => {
        try {
          const response = await api.put(`labsupports/${record.id}/accept`);
          if (response.data.status === "success") {
            message.success(response.data.details.message);
            fetchLabSupports();
          } else {
            message.error("Không thể phân công nhân viên");
          }
        } catch (error) {
          console.error("Lỗi khi phân công nhân viên:", error);
          message.error("Đã xảy ra lỗi khi phân công nhân viên");
        }
      },
    });
  };

  const handleFinishSupport = async (record) => {
    Modal.confirm({
      title: "Xác nhận hoàn thành hỗ trợ",
      content: "Bạn có chắc chắn đã hoàn thành hỗ trợ cho yêu cầu này?",
      onOk: async () => {
        try {
          const response = await api.put(`labsupports/${record.id}/finished`);
          if (response.data.status === "success") {
            message.success(response.data.details.message);
            fetchLabSupports();
          } else {
            message.error("Không thể hoàn thành hỗ trợ");
          }
        } catch (error) {
          console.error("Lỗi khi hoàn thành hỗ trợ:", error);
          message.error("Đã xảy ra lỗi khi hoàn thành hỗ trợ");
        }
      },
    });
  };

  const columns = [
    {
      title: "Nhân viên hỗ trợ",
      dataIndex: "staff-id",
      key: "staff-id",
      render: (staffId, record) =>
        staffId ? (
          <Text className="font-medium text-blue-600">{staffId}</Text>
        ) : (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAssignStaff(record)}
            className="bg-green-500 hover:bg-green-600 border-none shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Nhận hỗ trợ
          </Button>
        ),
    },
    {
      title: "Mã hỗ trợ",
      dataIndex: "id",
      key: "id",
      render: (id) => <Text className="font-semibold text-gray-700">{id}</Text>,
    },
    {
      title: "Tên bài Lab",
      dataIndex: ["lab", "name"],
      key: "labName",
      render: (name) => <Text className="text-purple-600">{name}</Text>,
    },
    {
      title: "Khách hàng",
      key: "customer",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text>
            <UserOutlined className="mr-1" />
            {`${record.user["first-name"]} ${record.user["last-name"]}`}
          </Text>
          <Text>
            <PhoneOutlined className="mr-1" />
            {record.user.phone}
          </Text>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "is-finished",
      key: "is-finished",
      render: (isFinished) => (
        <Tag
          color={isFinished ? "green" : "orange"}
          className="px-2 py-1 text-sm font-medium rounded-full"
        >
          {isFinished ? "Hoàn thành" : "Đang xử lý"}
        </Tag>
      ),
    },
    {
      title: "Xác nhận đã hỗ trợ",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={() => handleFinishSupport(record)}
          disabled={record["is-finished"] || !record["staff-id"]}
          className={`${
            record["is-finished"] || !record["staff-id"]
              ? "bg-gray-300 cursor-not-allowed"
              : "!bg-green-500 shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          } border-none`}
        >
          Hoàn thành hỗ trợ
        </Button>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    const user = record.user;
    const lab = record.lab;
    return (
      <Card className="bg-gray-50 shadow-inner">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Title level={5} className="text-blue-600 mb-2">
              Thông tin khách hàng:
            </Title>
            <Text className="block text-gray-700">
              Họ và tên:{" "}
              <span className="font-medium">{`${user["first-name"]} ${user["last-name"]}`}</span>
            </Text>
            <Text className="block text-gray-700">
              Email: <span className="font-medium">{user.email}</span>
            </Text>
            <Text className="block text-gray-700">
              Số điện thoại: <span className="font-medium">{user.phone}</span>
            </Text>
          </div>
          <div>
            <Title level={5} className="text-green-600 mb-2">
              Thông tin bài Lab:
            </Title>
            <Text className="block text-gray-700">
              Tác giả: <span className="font-medium">{lab.author}</span>
            </Text>
            <Text className="block text-gray-700">
              Giá:{" "}
              <span className="font-medium text-red-500">
                {lab.price.toLocaleString()} VND
              </span>
            </Text>
            <Text className="block text-gray-700">
              Số lần hỗ trợ tối đa:{" "}
              <span className="font-medium">{lab["max-support-times"]}</span>
            </Text>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-gray-100 min-h-screen"
    >
      <Card className="shadow-lg rounded-lg overflow-hidden">
        <Space direction="vertical" size="large" className="w-full">
          <Title
            level={2}
            className="text-center text-2xl font-bold text-gray-800 mb-6"
          >
            Quản lý Yêu cầu Hỗ trợ
          </Title>
          <Table
            columns={columns}
            dataSource={labSupports}
            loading={loading}
            rowKey="id"
            expandable={{
              expandedRowRender,
              rowExpandable: (record) => record.user != null,
            }}
            pagination={{ pageSize: 10 }}
            className="shadow-sm"
            rowClassName="hover:bg-gray-50 transition-colors duration-200"
          />
        </Space>
      </Card>
    </motion.div>
  );
}

export default RequestSupportManagement;
