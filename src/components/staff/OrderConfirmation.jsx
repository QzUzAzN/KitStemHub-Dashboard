import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Select,
  Tag,
  Typography,
  Space,
  Modal,
  Button,
  Spin,
  Card,
  Image,
  Divider,
  Tooltip,
  DatePicker,
  Modal as ConfirmModal,
} from "antd";
import { motion } from "framer-motion";
import {
  SearchOutlined,
  PhoneOutlined,
  MailOutlined,
  EyeOutlined,
  SortDescendingOutlined,
  SortAscendingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CarOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import { toast } from "react-toastify";
import moment from "moment-timezone"; // để đổi múi giờ sang vietnam

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;
const { Title } = Typography;
const { RangePicker } = DatePicker;

function OrderConfirmation() {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState("createdat");
  const [sortOrder, setSortOrder] = useState("desc");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [colorStatus, setColorStatus] = useState("");
  const [dateRange, setDateRange] = useState(null);

  const fetchOrders = async (
    page = 1,
    pageSize = 20,
    status = "Tất cả",
    emailQuery = "",
    currentSortField = sortField,
    currentSortOrder = sortOrder
  ) => {
    try {
      setLoading(true);
      const statusQuery =
        status === "Tất cả" ? "" : `&shipping-status=${status}`;
      const emailQueryParam = emailQuery ? `&customer-email=${emailQuery}` : "";
      const sortQuery = `&sort-fields=${currentSortField}&sort-orders=${currentSortOrder}`;

      let dateRangeQuery = "";
      if (dateRange && dateRange[0] && dateRange[1]) {
        const startDate = moment(dateRange[0])
          .tz("Asia/Ho_Chi_Minh")
          .startOf("day")
          .format("YYYY-MM-DD");
        const endDate = moment(dateRange[1])
          .tz("Asia/Ho_Chi_Minh")
          .endOf("day")
          .format("YYYY-MM-DD");
        dateRangeQuery = `&created-from=${startDate}&created-to=${endDate}`;
      }
      console.log(dateRangeQuery);

      const response = await api.get(
        `orders?page=${
          page - 1
        }&size=${pageSize}${statusQuery}${emailQueryParam}${sortQuery}${dateRangeQuery}`
      );
      if (response.data.status === "success") {
        setOrders(response.data.details.data.orders);
        setPagination({
          ...pagination,
          current: page,
          total: response.data.details.data["total-pages"] * pageSize,
        });
      } else {
        toast.error("Không thể tải danh sách đơn hàng");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [sortField, sortOrder]);

  const handleTableChange = (pagination, filters, sorter) => {
    const newSortField = "createdat";
    let newSortOrder = "desc";

    if (sorter.order) {
      newSortOrder = sorter.order === "ascend" ? "asc" : "desc";
    }

    // console.log("New Sort Field:", newSortField);
    // console.log("New Sort Order:", newSortOrder);

    setSortField(newSortField);
    setSortOrder(newSortOrder);

    fetchOrders(
      pagination.current,
      pagination.pageSize,
      statusFilter,
      searchText,
      newSortField,
      newSortOrder
    );
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    fetchOrders(1, pagination.pageSize, value, searchText); // Gọi API với filter trạng thái và email
  };

  const handleSearch = (value) => {
    setSearchText(value);
    fetchOrders(1, pagination.pageSize, statusFilter, value); // Gọi API khi tìm kiếm email
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ĐÃ XÁC NHẬN":
        return "blue";
      case "ĐANG GIAO HÀNG":
        return "orange";
      case "GIAO HÀNG THÀNH CÔNG":
        return "green";
      case "GIAO HÀNG THẤT BẠI":
        return "red";
      default:
        return "default";
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
      title: "Trạng thái giao hàng",
      dataIndex: "shipping-status",
      key: "shipping-status",
      render: (status) => {
        const color = getStatusColor(status);
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Địa chỉ giao hàng",
      dataIndex: "shipping-address",
      key: "shipping-address",
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
            {record["phone-number"]}
          </Text>
          <Text className="text-gray-500 text-xs">
            <MailOutlined className="mr-1" />
            {record.user["user-name"]}
          </Text>
        </Space>
      ),
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
      width: 320,
      render: (_, record) => (
        <div
          size="small"
          className="shadow-sm hover:shadow-md transition-shadow"
          bodyStyle={{ padding: "12px" }}
        >
          <Space direction="vertical" size="middle" className="w-full">
            {/* Phần xử lý trạng thái */}
            {(record["shipping-status"] === "CHỜ XÁC NHẬN" ||
              record["shipping-status"] === "ĐÃ XÁC NHẬN" ||
              record["shipping-status"] === "ĐANG GIAO HÀNG") && (
              <div className="border-b pb-3">
                {record["shipping-status"] === "CHỜ XÁC NHẬN" && (
                  <Space.Compact block className="!flex">
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      className="flex-[2]"
                      onClick={() =>
                        showConfirmationModal(
                          record.id,
                          "ĐÃ XÁC NHẬN",
                          record["shipping-status"]
                        )
                      }
                    >
                      Xác nhận đơn hàng
                    </Button>
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      onClick={() =>
                        showConfirmationModal(
                          record.id,
                          "GIAO HÀNG THẤT BẠI",
                          record["shipping-status"]
                        )
                      }
                      className="flex-1"
                    >
                      Hủy đơn
                    </Button>
                  </Space.Compact>
                )}

                {record["shipping-status"] === "ĐÃ XÁC NHẬN" && (
                  <Button
                    type="primary"
                    icon={<CarOutlined />}
                    className="!bg-orange-500 hover:!bg-orange-600 w-full h-[40px]"
                    onClick={() =>
                      showConfirmationModal(
                        record.id,
                        "ĐANG GIAO HÀNG",
                        record["shipping-status"]
                      )
                    }
                  >
                    Bắt đầu giao hàng
                  </Button>
                )}

                {record["shipping-status"] === "ĐANG GIAO HÀNG" && (
                  <Space.Compact block className="!flex">
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      className="!bg-green-500 hover:!bg-green-600 flex-[2]"
                      onClick={() =>
                        showConfirmationModal(
                          record.id,
                          "GIAO HÀNG THÀNH CÔNG",
                          record["shipping-status"]
                        )
                      }
                    >
                      Giao thành công
                    </Button>
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      onClick={() =>
                        showConfirmationModal(
                          record.id,
                          "GIAO HÀNG THẤT BẠI",
                          record["shipping-status"]
                        )
                      }
                      className="flex-1"
                    >
                      Thất bại
                    </Button>
                  </Space.Compact>
                )}
              </div>
            )}

            {/* Nút xem chi tiết */}
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => showOrderDetails(record.id)}
              className="w-full h-[36px] hover:bg-gray-50"
            >
              Xem chi tiết
            </Button>
          </Space>
        </div>
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
        await fetchOrders(
          pagination.current,
          pagination.pageSize,
          statusFilter,
          searchText
        ); // Cập nhật lại danh sách sau khi thay đổi
      } else {
        toast.error("Không thể cập nhật trạng thái đơn hàng");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi cập nhật trạng thái đơn hàng");
    }
  };

  const showOrderDetails = async (orderId) => {
    setModalVisible(true);
    setLoadingOrderDetails(true);
    try {
      const response = await api.get(`orders/${orderId}`);
      if (response.data.status === "success") {
        const orderData = response.data.details.data.order;
        setSelectedOrder(orderData);
        setColorStatus(getStatusColor(orderData["shipping-status"]));
      } else {
        toast.error("Không thể tải thông tin chi tiết đơn hàng");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi tải thông tin chi tiết đơn hàng");
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleDateRangeChange = async (dates) => {
    setDateRange(dates);
    // console.log(dates);
    setLoading(true);
    try {
      await fetchOrders(1, pagination.pageSize, statusFilter, searchText);
    } finally {
      setLoading(false);
    }
  };

  const showConfirmationModal = (orderId, newStatus, currentStatus) => {
    let title, icon, okText, cancelText, content;

    switch (newStatus) {
      case "ĐÃ XÁC NHẬN":
        title = "Xác nhận đơn hàng";
        icon = <CheckCircleOutlined className="text-blue-500" />;
        content = "Bạn có chắc chắn muốn xác nhận đơn hàng này?";
        okText = "Xác nhận";
        break;
      case "ĐANG GIAO HÀNG":
        title = "Chuyển sang trạng thái đang giao hàng";
        icon = <CarOutlined className="text-orange-500" />;
        content = "Xác nhận chuyển đơn hàng sang trạng thái đang giao?";
        okText = "Xác nhận giao hàng";
        break;
      case "GIAO HÀNG THÀNH CÔNG":
        title = "Xác nhận giao hàng thành công";
        icon = <CheckCircleOutlined className="text-green-500" />;
        content = "Xác nhận đơn hàng đã được giao thành công?";
        okText = "Xác nhận thành công";
        break;
      case "GIAO HÀNG THẤT BẠI":
        title =
          currentStatus === "CHỜ XÁC NHẬN"
            ? "Hủy đơn hàng"
            : "Xác nhận giao hàng thất bại";
        icon = <CloseCircleOutlined className="text-red-500" />;
        content =
          currentStatus === "CHỜ XÁC NHẬN"
            ? "Bạn có chắc chắn muốn hủy đơn hàng này?"
            : "Xác nhận đơn hàng giao không thành công?";
        okText =
          currentStatus === "CHỜ XÁC NHẬN"
            ? "Hủy đơn hàng"
            : "Xác nhận thất bại";
        break;
    }

    ConfirmModal.confirm({
      title: (
        <div className="flex items-center gap-2">
          {icon} <span>{title}</span>
        </div>
      ),
      icon: null,
      content: content,
      okText: okText,
      cancelText: "Đóng",
      okButtonProps: {
        className:
          newStatus === "GIAO HÀNG THẤT BẠI" ? "bg-red-500" : "bg-blue-500",
      },
      onOk() {
        return handleStatusChange(orderId, newStatus);
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className=" m-6 p-6 bg-white min-h-screen"
    >
      <h1 className="text-center text-3xl font-bold text-gray-800 mb-6">
        Xác nhận đơn hàng
      </h1>
      <div className="flex justify-between mb-4">
        <Search
          placeholder="Tìm kiếm theo Email khách hàng"
          onSearch={handleSearch}
          style={{ width: 300 }}
          prefix={<SearchOutlined className="text-gray-400" />}
        />
        <Space>
          <RangePicker
            onChange={handleDateRangeChange}
            format="YYYY/MM/DD"
            placeholder={["Từ ngày", "Đến ngày"]}
          />
          <Select
            defaultValue="Tất cả"
            style={{ width: 200 }}
            onChange={handleStatusFilterChange}
          >
            <Option value="Tất cả">Tất cả trạng thái</Option>
            <Option value="CHỜ XÁC NHẬN">Chờ xác nhận</Option>
            <Option value="ĐÃ XÁC NHẬN">Đã xác nhận</Option>
            <Option value="ĐANG GIAO HÀNG">Đang giao hàng</Option>
            <Option value="GIAO HÀNG THÀNH CÔNG">Giao hàng thành công</Option>
            <Option value="GIAO HÀNG THẤT BẠI">Giao hàng thất bại</Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={orders}
        className="w-full"
        pagination={{
          ...pagination,
          showSizeChanger: false,
        }}
        loading={loading}
        onChange={handleTableChange}
        rowKey="id"
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

      <Modal
        title={<Title level={3}>Chi tiết đơn hàng: {selectedOrder?.id}</Title>}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={900}
      >
        {loadingOrderDetails ? (
          <div className="text-center">
            <Spin size="large" />
          </div>
        ) : selectedOrder ? (
          <div>
            <Card title="Thông tin đơn hàng" className="mb-6 shadow-sm">
              <Space direction="vertical" size="middle" className="w-full">
                <div className="flex justify-between">
                  <Text>Mã đơn hàng:</Text>
                  <Text strong>{selectedOrder.id}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Ngày tạo:</Text>
                  <Text strong>
                    {new Date(selectedOrder["created-at"]).toLocaleString()}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text>Trạng thái:</Text>
                  <Tag
                    bordered={false}
                    color={colorStatus}
                    style={{
                      fontSize: "13px",
                      fontWeight: "bold",
                      margin: "0px",
                    }}
                  >
                    {selectedOrder["shipping-status"]}
                  </Tag>
                </div>
                <div className="flex justify-between">
                  <Text>Địa chỉ giao hàng:</Text>
                  <Text strong>{selectedOrder["shipping-address"]}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Số điện thoại:</Text>
                  <Text strong>{selectedOrder["phone-number"]}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Tổng giá:</Text>
                  <Text strong>
                    {formatCurrency(selectedOrder["total-price"])}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text>Ghi chú:</Text>
                  <Text strong>{selectedOrder.note || "Không có"}</Text>
                </div>
              </Space>
            </Card>

            <Card title="Danh sách sản phẩm" className="mb-6 shadow-sm">
              {selectedOrder["package-orders"].map((packageOrder, index) => (
                <React.Fragment key={index}>
                  <div className="flex items-center py-4">
                    <div className="mr-4">
                      <Image
                        src={
                          packageOrder.package?.kit?.["kit-images"]?.[0]?.url ||
                          "https://via.placeholder.com/100"
                        }
                        alt={packageOrder.package?.kit?.name || "Package Image"}
                        width={80}
                        height={80}
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-grow">
                      <Text strong className="block">
                        {packageOrder.package?.kit?.name || "Unknown Package"}
                      </Text>

                      <Text type="secondary block">
                        {packageOrder.package?.name || "Unknown Name"}
                      </Text>
                      <Text>
                        {formatCurrency(packageOrder.package?.price || 0)} x{" "}
                        {packageOrder["package-quantity"] || 0}
                      </Text>
                    </div>
                    <div className="text-right">
                      <Text strong>
                        {formatCurrency(
                          (packageOrder.package?.price || 0) *
                            (packageOrder["package-quantity"] || 0)
                        )}
                      </Text>
                    </div>
                  </div>

                  {index < selectedOrder["package-orders"].length - 1 && (
                    <Divider />
                  )}
                </React.Fragment>
              ))}
            </Card>

            <Card title="Bài Labs" className="mb-6 shadow-sm">
              <Table
                dataSource={selectedOrder["package-orders"].flatMap(
                  (po) => po.package?.["package-labs"] || []
                )}
                columns={[
                  {
                    title: "Tên Lab",
                    dataIndex: "name",
                    key: "name",
                  },
                  {
                    title: "Giá",
                    dataIndex: "price",
                    key: "price",
                    render: (price) => formatCurrency(price),
                  },
                  {
                    title: "Số lần hỗ trợ tối đa",
                    dataIndex: "max-support-times",
                    key: "max-support-times",
                  },
                  {
                    title: "Tác giả",
                    dataIndex: "author",
                    key: "author",
                  },
                  {
                    title: "Cấp độ",
                    dataIndex: ["level", "name"],
                    key: "level",
                    render: (text, record) =>
                      record.level ? record.level.name : "N/A",
                  },
                ]}
                pagination={false}
                rowKey="id"
              />
            </Card>

            <Card title="Tổng kết đơn hàng" className="shadow-sm">
              <Space direction="vertical" size="middle" className="w-full">
                <div className="flex justify-between">
                  <Text>Tạm tính:</Text>
                  <Text strong>{formatCurrency(selectedOrder.price)}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Phí vận chuyển:</Text>
                  <Text strong>
                    {formatCurrency(selectedOrder["shipping-fee"])}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text>Giảm giá:</Text>
                  <Text strong>-{formatCurrency(selectedOrder.discount)}</Text>
                </div>
                <Divider />
                <div className="flex justify-between">
                  <Text strong className="text-lg">
                    Tổng cộng:
                  </Text>
                  <Text strong className="text-lg text-green-600">
                    {formatCurrency(selectedOrder["total-price"])}
                  </Text>
                </div>
              </Space>
            </Card>
          </div>
        ) : (
          <p>Không có thông tin chi tiết</p>
        )}
      </Modal>
    </motion.div>
  );
}

export default OrderConfirmation;
