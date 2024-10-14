import React, { useState, useEffect } from "react";
import { Table, Input, Select } from "antd";
import { motion } from "framer-motion";
import { SearchOutlined } from "@ant-design/icons";
import api from "../../config/axios";
import { toast } from "react-toastify";

const { Search } = Input;
const { Option } = Select;

function OrderConfirmation() {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
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
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("An error occurred while fetching orders");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "ORDER ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "USER ID",
      dataIndex: "user-id",
      key: "user-id",
    },
    {
      title: "SHIPPING STATUS",
      dataIndex: "shipping-status",
      key: "shipping-status",
      render: (status) => {
        let colorClass = "";
        switch (status) {
          case "ĐÃ XÁC NHẬN":
            colorClass = "bg-blue-100 text-blue-800";
            break;
          case "ĐANG GIAO HÀNG":
            colorClass = "bg-yellow-100 text-yellow-800";
            break;
          case "GIAO HÀNG THÀNH CÔNG":
            colorClass = "bg-green-100 text-green-800";
            break;
          case "GIAO HÀNG THẤT BẠI":
            colorClass = "bg-red-100 text-red-800";
            break;
          default:
            colorClass = "bg-gray-100 text-gray-800";
        }
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      title: "SHIPPING ADDRESS",
      dataIndex: "shipping-address",
      key: "shipping-address",
    },
    {
      title: "PHONE NUMBER",
      dataIndex: "phone-number",
      key: "phone-number",
    },
    {
      title: "LAB DOWNLOADED",
      dataIndex: "is-lab-downloaded",
      key: "is-lab-downloaded",
      render: (isDownloaded) => (isDownloaded ? "Yes" : "No"),
    },
    {
      title: "TOTAL PRICE",
      dataIndex: "total-price",
      key: "total-price",
      render: (price) => `${price.toLocaleString()} VND`,
    },
    {
      title: "NOTE",
      dataIndex: "note",
      key: "note",
    },
    {
      title: "ACTION",
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
          throw new Error("Invalid status");
      }

      const response = await api.put(endpoint);
      if (response.data.status === "success") {
        toast.success(response.data.details.message);
        await fetchOrders(); // Cập nhật danh sách đơn hàng sau khi thay đổi trạng thái
      } else {
        toast.error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("An error occurred while updating order status");
    }
  };

  const filteredData = orders.filter(
    (item) =>
      (statusFilter === "All" || item["shipping-status"] === statusFilter) &&
      (item.id.toLowerCase().includes(searchText.toLowerCase()) ||
        item["user-id"].toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <h1 className="text-2xl font-bold mb-6">Order Confirmation</h1>
      <div className="flex justify-between mb-4">
        <Search
          placeholder="Search by Order ID or User ID"
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          prefix={<SearchOutlined className="text-gray-400" />}
        />
        <Select
          defaultValue="All"
          style={{ width: 200 }}
          onChange={(value) => setStatusFilter(value)}
        >
          <Option value="All">Tất cả trạng thái</Option>
          <Option value="ĐÃ XÁC NHẬN">Đã xác nhận</Option>
          <Option value="ĐANG GIAO HÀNG">Đang giao hàng</Option>
          <Option value="GIAO HÀNG THÀNH CÔNG">Giao hàng thành công</Option>
          <Option value="GIAO HÀNG THẤT BẠI">Giao hàng thất bại</Option>
        </Select>
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
        className="shadow-md rounded-lg overflow-hidden"
        pagination={{ pageSize: 10 }}
        loading={loading}
        rowKey="id"
      />
    </motion.div>
  );
}

export default OrderConfirmation;
