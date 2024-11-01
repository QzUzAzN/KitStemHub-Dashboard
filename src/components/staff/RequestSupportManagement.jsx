import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Card,
  Typography,
  Space,
  Tag,
  Input,
  Select,
  Tooltip,
} from "antd";
import { motion } from "framer-motion";
import {
  PlusOutlined,
  CheckOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import { toast } from "react-toastify";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

function RequestSupportManagement() {
  const [labSupports, setLabSupports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [searchLabSupportId, setSearchLabSupportId] = useState("");
  const [searchCustomerEmail, setSearchCustomerEmail] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetchLabSupports();
  }, [searchLabSupportId, searchCustomerEmail, sortOrder]);

  const fetchLabSupports = async (page = 1) => {
    try {
      const queryParams = new URLSearchParams({
        page: page - 1,
        supported: false,
        "lab-support-id": searchLabSupportId,
        "customer-email": searchCustomerEmail,
        "order-by-createat-desc": sortOrder === "desc",
      });

      const response = await api.get(`labsupports?${queryParams}`);
      if (response.data.status === "success") {
        setLabSupports(response.data.details.data["lab-supports"]);
        setPagination({
          ...pagination,
          current: page,
          total: response.data.details.data["total-pages"],
        });
      } else {
        toast.error("Không thể tải danh sách hỗ trợ");
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
            toast.success(response.data.details.message);
            fetchLabSupports();
          } else {
            toast.error("Không thể phân công nhân viên");
          }
        } catch (error) {
          console.error("Lỗi khi phân công nhân viên:", error);
          toast.error("Đã xảy ra lỗi khi phân công nhân viên");
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
            toast.success(response.data.details.message);
            fetchLabSupports();
          } else {
            toast.error("Không thể hoàn thành hỗ trợ");
          }
        } catch (error) {
          console.error("Lỗi khi hoàn thành hỗ trợ:", error);
          toast.error("Đã xảy ra lỗi khi hoàn thành hỗ trợ");
        }
      },
    });
  };

  const fetchLabSupportDetails = async (labSupportId) => {
    try {
      const response = await api.get(`labsupports/${labSupportId}`);
      if (response.data.status === "success") {
        return response.data.details.data["lab-support"];
      }
    } catch (error) {
      console.error("Error fetching lab support details:", error);
      toast.error("Không thể tải thông tin chi tiết hỗ trợ");
    }
    return null;
  };
  const handleViewLab = async (labId) => {
    try {
      // console.log(labId);
      const response = await api.get(`labs/${labId}/url`);
      console.log(response.data);
      const signedUrl = response.data.details["signed-url"];
      console.log(signedUrl);
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

  const handleSearch = () => {
    fetchLabSupports(1);
  };

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
            className="text-center text-2xl font-bold text-gray-800 mb-6"
          >
            Quản lý Yêu cầu Hỗ trợ
          </Title>

          <Space className="w-full justify-between">
            <Space>
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
          </Space>

          <Table
            columns={columns}
            dataSource={labSupports}
            loading={loading}
            rowKey="id"
            expandable={{}}
            pagination={pagination}
            className="shadow-sm"
            rowClassName="hover:bg-gray-50 transition-colors duration-200"
            onChange={(pagination) => fetchLabSupports(pagination.current)}
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
        </Space>
      </Card>
    </motion.div>
  );
}

export default RequestSupportManagement;
