import { useState, useEffect } from "react";
import api from "../../config/axios";
import { Table, Tag, Space, Typography, Spin, Alert } from "antd";
import { StarFilled } from "@ant-design/icons";

const { Title } = Typography;

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
      title: "STT",
      key: "index",
      render: (text, record, index) => index + 1,
      width: 70,
      fixed: "left",
    },
    {
      title: "Mã hỗ trợ",
      dataIndex: "id",
      key: "id",
      render: (text) => (
        <a className="text-blue-600 hover:text-blue-800">{text}</a>
      ),
    },
    {
      title: "Mã đơn hàng hỗ trợ",
      dataIndex: "order-support-id",
      key: "order-support-id",
    },
    {
      title: "Lab ID",
      dataIndex: "lab-id",
      key: "lab-id",
    },
    {
      title: "Mã nhân viên",
      dataIndex: "staff-id",
      key: "staff-id",
    },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => (
        <Space>
          {rating} <StarFilled className="text-yellow-400" />
        </Space>
      ),
    },
    {
      title: "Phản hồi",
      dataIndex: "feed-back",
      key: "feed-back",
      render: (feedback) => feedback || "Không có",
    },
    {
      title: "Trạng thái",
      key: "is-finished",
      dataIndex: "is-finished",
      render: (isFinished) => (
        <Tag color={isFinished ? "green" : "volcano"}>
          {isFinished ? "Hoàn thành" : "Chưa hoàn thành"}
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
    <div className="container mx-auto p-4">
      <Title level={2} className="mb-6">
        Lịch sử hỗ trợ
      </Title>
      <Table
        columns={columns}
        dataSource={supportHistory}
        rowKey="id"
        className="shadow-lg rounded-lg overflow-hidden"
        pagination={{
          pageSize: 10,
        }}
        // scroll={{ x: "max-content" }}
      />
    </div>
  );
}

export default SupportHistory;
