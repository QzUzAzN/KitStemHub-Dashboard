import { useState, useEffect } from "react";
import api from "../../config/axios";
import { Table, Tag, Space, Typography, Spin, Alert, Card } from "antd";
import { StarFilled, UserOutlined, PhoneOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

function SupportHistory() {
  const [supportHistory, setSupportHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupportHistory = async () => {
      try {
        const response = await api.get("labsupports?supported=true");
        setSupportHistory(response.data.detail.data["lab-supports"]);
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
      dataIndex: ["staff", "user-name"],
      key: "staffName",
      render: (text) => (
        <Space>
          <UserOutlined className="text-gray-500" />
          <Text>{text}</Text>
        </Space>
      ),
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
      title: "Tên bài Lab",
      dataIndex: ["lab", "name"],
      key: "labName",
      render: (text) => <Text className="text-gray-800">{text}</Text>,
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
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => (
        <Space>
          {rating !== 0 ? (
            <>
              <Text className="font-medium">{rating}</Text>
              <StarFilled className="text-yellow-400" />
            </>
          ) : (
            <Text>Chưa Đánh Giá</Text>
          )}
        </Space>
      ),
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

  const expandedRowRender = (record) => {
    const user = record.user;
    const lab = record.lab;
    return (
      <Card className="bg-gray-50 shadow-sm">
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
          <div>
            <Title level={5} className="text-purple-600 mb-2">
              Phản hồi:
            </Title>
            <Text className="text-gray-700">
              {record["feed-back"] || "Không có phản hồi"}
            </Text>
          </div>
        </div>
      </Card>
    );
  };

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
      className="p-6 bg-gray-100 min-h-screen"
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
          expandable={{
            expandedRowRender,
            rowExpandable: () => true,
          }}
          pagination={{
            pageSize: 10,
          }}
          className="shadow-sm"
          rowClassName="hover:bg-gray-50 transition-colors duration-200"
        />
      </Card>
    </motion.div>
  );
}

export default SupportHistory;
