import { useState, useEffect } from "react";
import { Table, Button, message, Modal, Card, Typography, Space } from "antd";
import { motion } from "framer-motion";
import { PlusOutlined, CheckOutlined } from "@ant-design/icons";
import api from "../../config/axios";
import { toast } from "react-toastify";

const { Title } = Typography;

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
        message.error("Failed to fetch lab supports");
      }
    } catch (error) {
      console.error("Error fetching lab supports:", error);
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
            message.error("Failed to assign staff");
          }
        } catch (error) {
          console.error("Error assigning staff:", error);
          message.error("An error occurred while assigning staff");
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
            console.log("ddax chay");
          } else {
            message.error("Failed to finish support");
          }
        } catch (error) {
          console.error("Error finishing support:", error);
          message.error("An error occurred while finishing support");
        }
      },
    });
  };

  const columns = [
    {
      title: "MÃ NHÂN VIÊN",
      dataIndex: "staff-id",
      key: "staff-id",
      render: (staffId, record) =>
        staffId ? (
          <span className="font-semibold text-blue-600">{staffId}</span>
        ) : (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAssignStaff(record)}
            className="bg-green-500 hover:bg-green-600"
          >
            Nhận hỗ trợ
          </Button>
        ),
    },
    {
      title: "MÃ HỖ TRỢ BÀI LAB",
      dataIndex: "id",
      key: "id",
      render: (id) => <span className="font-medium">{id}</span>,
    },
    {
      title: "MÃ HỖ TRỢ ĐƠN HÀNG",
      dataIndex: "order-support-id",
      key: "order-support-id",
      render: (id) => <span className="font-medium text-purple-600">{id}</span>,
    },
    {
      title: "TIẾN ĐỘ",
      dataIndex: "is-finished",
      key: "is-finished",
      render: (isFinished) => (
        <span
          className={`font-semibold ${
            isFinished ? "text-green-500" : "text-yellow-500"
          }`}
        >
          {isFinished ? "Hoàn thành" : "Đang xử lý"}
        </span>
      ),
    },
    {
      title: "NGÀY TẠO ĐƠN HÀNG",
      dataIndex: "create-date",
      key: "create-date",
      render: (date) => <span className="text-gray-600">{date}</span>,
    },
    {
      title: "ACTION",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={() => handleFinishSupport(record)}
          disabled={record["is-finished"] || !record["staff-id"]}
          className={`${
            record["is-finished"] || !record["staff-id"]
              ? "bg-gray-300"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          Xác nhận đã hỗ trợ
        </Button>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-gray-100 min-h-screen"
    >
      <Card className="shadow-lg rounded-lg">
        <Space direction="vertical" size="large" className="w-full">
          <div className="flex justify-between items-center">
            <Title level={2} className="mb-0">
              Quản lý Yêu cầu Hỗ trợ
            </Title>
          </div>
          <Table
            columns={columns}
            dataSource={labSupports}
            loading={loading}
            rowKey="id"
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
