import React, { useState, useEffect } from "react";
import { Table, Input, Select, Tag, Typography } from "antd";
import { motion } from "framer-motion";
import { SearchOutlined } from "@ant-design/icons";
import api from "../../config/axios";
import { toast } from "react-toastify";

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

function OrderConfirmation() {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("orders");
      if (response.data.status === "success") {
        setOrders(response.data.details.data.orders);
      } else {
        toast.error("Không thể tải danh sách đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn hàng:", error);
      toast.error("Đã xảy ra lỗi khi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Trạng thái giao hàng",
      dataIndex: "shipping-status",
      key: "shipping-status",
      render: (status) => {
        let color = "default";
        switch (status) {
          case "ĐÃ XÁC NHẬN":
            color = "blue";
            break;
          case "ĐANG GIAO HÀNG":
            color = "orange";
            break;
          case "GIAO HÀNG THÀNH CÔNG":
            color = "green";
            break;
          case "GIAO HÀNG THẤT BẠI":
            color = "red";
            break;
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Địa chỉ giao hàng",
      dataIndex: "shipping-address",
      key: "shipping-address",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone-number",
      key: "phone-number",
    },
    {
      title: "Đã tải lab",
      dataIndex: "is-lab-downloaded",
      key: "is-lab-downloaded",
      render: (isDownloaded) => (isDownloaded ? "Có" : "Không"),
    },
    {
      title: "Tổng giá",
      dataIndex: "total-price",
      key: "total-price",
      render: (price) => `${price.toLocaleString()} VND`,
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Select
          defaultValue={record["shipping-status"]}
          style={{ width: 200 }}
          onChange={(value) => handleStatusChange(record.id, value)}
        >
          <Option value="ĐÃ XÁC NHẬN">Đã xác nhận</Option>
          <Option value="ĐANG GIAO HÀNG">Đang giao hàng</Option>
          <Option value="GIAO HÀNG THÀNH CÔNG">Giao hàng thành công</Option>
          <Option value="GIAO HÀNG THẤT BẠI">Giao hàng thất bại</Option>
        </Select>
      ),
    },
  ];

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      let endpoint;
      switch (newStatus) {
        case "ĐÃ XÁC NHẬN":
          endpoint = `orders/${orderId}/verified`;
          break;
        case "ĐANG GIAO HÀNG":
          endpoint = `orders/${orderId}/delivering`;
          break;
        case "GIAO HÀNG THÀNH CÔNG":
          endpoint = `orders/${orderId}/success`;
          break;
        case "GIAO HÀNG THẤT BẠI":
          endpoint = `orders/${orderId}/fail`;
          break;
        default:
          throw new Error("Trạng thái không hợp lệ");
      }

      const response = await api.put(endpoint);
      if (response.data.status === "success") {
        toast.success(response.data.details.message);
        await fetchOrders();
      } else {
        toast.error("Không thể cập nhật trạng thái đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
      toast.error("Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng");
    }
  };

  const filteredData = orders.filter(
    (item) =>
      (statusFilter === "Tất cả" || item["shipping-status"] === statusFilter) &&
      (item.id.toLowerCase().includes(searchText.toLowerCase()) ||
        item.user["user-name"].toLowerCase().includes(searchText.toLowerCase()))
  );

  const expandedRowRender = (record) => {
    const user = record.user;
    return (
      <div>
        <Text strong>Thông tin khách hàng:</Text>
        <p>
          Họ và tên: {user["first-name"]} {user["last-name"]}
        </p>
        <p>Email: {user["user-name"]}</p>
        <p>Số điện thoại: {user["phone-number"]}</p>
        <p>Địa chỉ: {user["address"]}</p>
        <p>Điểm tích lũy: {user["points"]}</p>
        <p>
          Trạng thái tài khoản:{" "}
          {user["status"] ? "Hoạt động" : "Không hoạt động"}
        </p>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <h1 className="text-2xl font-bold mb-6">Xác nhận đơn hàng</h1>
      <div className="flex justify-between mb-4">
        <Search
          placeholder="Tìm kiếm theo Mã đơn hàng hoặc Email khách hàng"
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          prefix={<SearchOutlined className="text-gray-400" />}
        />
        <Select
          defaultValue="Tất cả"
          style={{ width: 200 }}
          onChange={(value) => setStatusFilter(value)}
        >
          <Option value="Tất cả">Tất cả trạng thái</Option>
          <Option value="CHỜ XÁC NHẬN">Chờ xác nhận</Option>
          <Option value="ĐÃ XÁC NHẬN">Đã xác nhận</Option>
          <Option value="ĐANG GIAO HÀNG">Đang giao hàng</Option>
          <Option value="GIAO HÀNG THÀNH CÔNG">Giao hàng thành công</Option>
          <Option value="GIAO HÀNG THẤT BẠI">Giao hàng thất bại</Option>
        </Select>
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
        expandable={{
          expandedRowRender: expandedRowRender,
          rowExpandable: (record) => record.user != null,
        }}
        className="shadow-md rounded-lg overflow-hidden"
        pagination={{ pageSize: 10 }}
        loading={loading}
        rowKey="id"
      />
    </motion.div>
  );
}

export default OrderConfirmation;
