import { useState, useEffect } from "react";
import api from "../../config/axios";
import {
  Table,
  Tag,
  Space,
  Typography,
  Alert,
  Card,
  Input,
  Button,
  Tooltip,
} from "antd";
import {
  StarFilled,
  PhoneOutlined,
  MailOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const { Search } = Input;
const { Title, Text } = Typography;

function SupportHistory() {
  const [supportHistory, setSupportHistory] = useState([]);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [searchLabSupportId, setSearchLabSupportId] = useState("");
  const [searchCustomerEmail, setSearchCustomerEmail] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetchSupportHistory();
  }, [pagination.current, searchLabSupportId, searchCustomerEmail, sortOrder]);

  const fetchSupportHistory = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.current - 1,
        supported: true,
        "order-by-createat-desc": sortOrder === "desc",
      });

      if (searchLabSupportId) {
        params.append("lab-support-id", searchLabSupportId);
      }
      if (searchCustomerEmail) {
        params.append("customer-email", searchCustomerEmail);
      }

      const response = await api.get(`labsupports?${params.toString()}`);
      setSupportHistory(response.data.details.data["lab-supports"]);
      setPagination({
        ...pagination,
        total: response.data.details.data["total-pages"],
      });
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      setError(`Có lỗi xảy ra khi tải dữ liệu: ${error.message}`);
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchSupportHistory();
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    if (sorter.field === "created-at") {
      setSortOrder(sorter.order === "descend" ? "desc" : "asc");
    }
  };

  const handleViewLab = async (labId) => {
    try {
      const response = await api.get(`labs/${labId}/url`);
      const signedUrl = response.data.details["signed-url"];
      window.open(signedUrl, "_blank");
    } catch (error) {
      console.error("Lỗi khi tải bài lab:", error);
      toast.error("Không thể tải bài lab. Vui lòng thử lại sau.");
    }
  };

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
            {`${record.user["last-name"]} ${record.user["first-name"]}`}
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
      title: (
        <Space>
          Ngày tạo
          <Tooltip title={sortOrder !== "desc" ? "Mới Nhất" : "Cũ Nhất"}>
            <Button
              type="text"
              icon={
                sortOrder === "desc" ? (
                  <SortDescendingOutlined />
                ) : (
                  <SortAscendingOutlined />
                )
              }
              onClick={() =>
                setSortOrder(sortOrder === "desc" ? "asc" : "desc")
              }
              size="small"
            />
          </Tooltip>
        </Space>
      ),
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
      title: "Xem bài Lab",
      key: "viewLab",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<FileSearchOutlined />}
          onClick={() => handleViewLab(record.lab.id)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Xem Lab
        </Button>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 min-h-screen"
    >
      <Card className="shadow-lg rounded-lg overflow-hidden">
        <Space direction="vertical" size="large" className="w-full">
          <Title
            level={2}
            className="mb-6 text-center text-2xl font-bold text-gray-800"
          >
            Lịch sử hỗ trợ
          </Title>
          <Space className="mb-4">
            <Search
              placeholder="Mã hỗ trợ"
              value={searchLabSupportId}
              onChange={(e) => setSearchLabSupportId(e.target.value)}
              onSearch={handleSearch}
              style={{ width: 200 }}
            />
            <Search
              placeholder="Email khách hàng"
              value={searchCustomerEmail}
              onChange={(e) => setSearchCustomerEmail(e.target.value)}
              onSearch={handleSearch}
              style={{ width: 200 }}
            />
          </Space>
          {error ? (
            <Alert message={error} type="error" className="mb-4" />
          ) : (
            <Table
              columns={columns}
              dataSource={supportHistory}
              rowKey="id"
              pagination={pagination}
              onChange={handleTableChange}
              className="shadow-sm"
              rowClassName="hover:bg-gray-50 transition-colors duration-200"
              scroll={{
                x: 1500, // Cho phép scroll ngang
                y: "calc(100vh - 300px)", // Chiều cao động dựa theo viewport
              }}
              sticky={{
                offsetHeader: 0,
                offsetScroll: 0,
              }}
              style={{
                maxWidth: "100%",
                overflow: "auto",
              }}
            />
          )}
        </Space>
      </Card>
    </motion.div>
  );
}

export default SupportHistory;
