import { useState, useEffect } from "react";
import api from "../../config/axios";
import { Table, Tag, Space, Typography, Spin, Alert, Card } from "antd";
import { StarFilled, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

function SupportHistory() {
  const [supportHistory, setSupportHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  useEffect(() => {
    const fetchSupportHistory = async (page = 1) => {
      try {
        const response = await api.get(
          `labsupports?page=${page - 1}&supported=true`
        );
        setSupportHistory(response.data.detail.data["lab-supports"]);
        setPagination({
          ...pagination,
          current: page,
          total: response.data.detail.data["total-pages"],
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        setError(`Có lỗi xảy ra khi tải dữ liệu: ${error.message}`);
        setIsLoading(false);
      }
    };

    fetchSupportHistory();
  }, []);

  const columns = [
    {
      title: "Nhân viên hỗ trợ",
      dataIndex: ["staff", "email", "first-name", "last-name"],
      key: "staffEmail",
      render: (text, record) =>
        record.staff && record.staff.email ? (
          <Space direction="vertical" size="small">
            <Text className="font-medium text-blue-600 ">
              {`${record.staff["first-name"] ?? "Chưa có tên"} ${
                record.staff["last-name"] ?? ""
              }`}
            </Text>

            <Text className=" text-gray-600">
              <MailOutlined className="text-gray-500 pr-2" />
              {record.staff.email}
            </Text>
          </Space>
        ) : null,
    },
    {
      title: "Mã hỗ trợ",
      dataIndex: "id",
      key: "id",
      render: (text) => (
        <Text className="font-medium text-blue-600">{text}</Text>
      ),
    },
    {
      title: "Thông tin bài Lab",
      key: "labInfo",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text strong className="text-purple-600">
            {record.lab.name}
          </Text>
          <Text className="text-gray-600">Tác giả: {record.lab.author}</Text>
          {/* <Text className="text-gray-600">
            Giá: {record.lab.price.toLocaleString()} VND
          </Text> */}
          <Text className="text-gray-600">
            Hỗ trợ tối đa: {record.lab["max-support-times"]} lần
          </Text>
          <Text className="text-gray-600">
            Cấp độ: {record.lab.level ? record.lab.level.name : "Chưa xác định"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Thông tin khách hàng",
      key: "customerInfo",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Text strong className="text-blue-600">
            {`${record.user["first-name"]} ${record.user["last-name"]}`}
          </Text>
          <Text className="text-gray-600">
            <PhoneOutlined className="mr-1" />
            {record.user.phone}
          </Text>
          <Text className="text-gray-500 text-xs">
            <MailOutlined className="mr-1" />
            {record.user.email}
          </Text>
        </Space>
      ),
    },
    {
      title: "Đánh giá và Feedback",
      key: "rating-feedback",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space>
            {record.rating !== 0 ? (
              <>
                {/* <Text className="font-medium">{record.rating}</Text> */}
                {Array.from({ length: record.rating }, (_, index) => (
                  <StarFilled key={index} className="text-yellow-400" />
                ))}
              </>
            ) : (
              <Text>Chưa Đánh Giá</Text>
            )}
          </Space>
          <Text className="font-medium">
            {record["feed-back"] || "Chưa có feedback"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created-at",
      key: "created-at",
      render: (createdAt) => {
        const date = new Date(createdAt);
        return (
          <Text className="text-gray-600">
            {date.toLocaleString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "is-finished",
      dataIndex: "is-finished",
      render: (isFinished) => (
        <Tag
          color={isFinished ? "green" : "orange"}
          className="px-2 py-1 text-sm font-medium rounded-full"
        >
          {isFinished ? "Hoàn thành" : "Đang xử lý"}
        </Tag>
      ),
    },
  ];

  if (isLoading)
    return (
      <Spin
        size="large"
        className="flex justify-center items-center h-screen"
      />
    );
  if (error) return <Alert message={error} type="error" className="m-4" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6  min-h-screen "
    >
      <Card className="shadow-lg rounded-lg overflow-hidden">
        <Title
          level={2}
          className="mb-6 text-center text-2xl font-bold text-gray-800"
        >
          Lịch sử hỗ trợ
        </Title>
        <Table
          columns={columns}
          dataSource={supportHistory}
          rowKey="id"
          pagination={pagination}
          className="shadow-sm"
          rowClassName="hover:bg-gray-50 transition-colors duration-200"
        />
      </Card>
    </motion.div>
  );
}

export default SupportHistory;
