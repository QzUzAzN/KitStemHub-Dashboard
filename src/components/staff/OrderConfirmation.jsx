import React, { useState, useEffect } from "react";
import { Table, Input, Select, message } from "antd";
import { motion } from "framer-motion";
import { SearchOutlined } from "@ant-design/icons";
import api from "../../config/axios";

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
        message.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("An error occurred while fetching orders");
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
      render: (status) => (
        // <span
        //   className={`px-2 py-1 rounded-full text-xs font-semibold
        //   ${
        //     status === "Chờ Xác Nhận"
        //       ? "bg-blue-100 text-blue-800"
        //       : status === "Đã Xác Nhận"
        //       ? "bg-green-100 text-green-800"
        //       : status === "Đang Giao"
        //       ? "bg-yellow-100 text-yellow-800"
        //       : status === "Đã Giao"
        //       ? "bg-green-100 text-green-800"
        //       : "bg-red-100 text-red-800"
        //   }`}
        // ></span>
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold
          ${
            status === "VERIFYING"
              ? "bg-blue-100 text-blue-800"
              : status === "DELIVERING"
              ? "bg-yellow-100 text-yellow-800"
              : status === "SUCCESS"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status}
        </span>
      ),
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
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(record.id, value)}
        >
          <Option value="VERIFYING">Verifying</Option>
          <Option value="DELIVERING">Delivering</Option>
          <Option value="SUCCESS">Success</Option>
          <Option value="FAIL">Fail</Option>
        </Select>
      ),
    },
  ];

  const handleStatusChange = async (orderId, newStatus) => {
    // Implement the API call to update the order status
    message.success(`Order ${orderId} status changed to ${newStatus}`);
    // After successful update, you might want to refresh the orders
    // await fetchOrders();
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
          <Option value="All">All Status</Option>
          <Option value="VERIFYING">Verifying</Option>
          <Option value="DELIVERING">Delivering</Option>
          <Option value="SUCCESS">Success</Option>
          <Option value="FAIL">Fail</Option>
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
