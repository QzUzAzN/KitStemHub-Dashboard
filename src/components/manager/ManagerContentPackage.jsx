import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import {
  Table,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Modal,
  notification,
  Button,
  Switch,
  Spin,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import api from "../../config/axios";
import { Option } from "antd/es/mentions";

const { Text } = Typography;

function ManagerContentPackage() {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [kits, setKits] = useState([]);
  const [levels, setLevels] = useState([]);
  const [isOpen, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [kitPagination, setKitPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    levelId: undefined,
    fromPrice: undefined,
    toPrice: undefined,
    kitName: "",
    categoryName: "",
    status: undefined,
    includeLabs: undefined,
  });
  const [labDetails, setLabDetails] = useState([]);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [availableLabs, setAvailableLabs] = useState([]);
  const [selectedKitPrice, setSelectedKitPrice] = useState(null);
  const [selectedKit, setSelectedKit] = useState(null);
  const [kitModalVisible, setKitModalVisible] = useState(false);
  const [kitSearchName, setKitSearchName] = useState("");

  const fetchPackages = async (
    page = 1,
    pageSize = 20,
    searchFilters = filters
  ) => {
    try {
      setLoading(true);
      const params = {
        page: page - 1,
        pageSize: pageSize,
        name: searchFilters.name,
        "from-price": searchFilters.fromPrice,
        "to-price": searchFilters.toPrice,
        "kit-name": searchFilters.kitName,
        "category-name": searchFilters.categoryName,
        status: searchFilters.status,
        "include-labs": searchFilters.includeLabs,
      };

      if (searchFilters.levelId !== undefined) {
        params["level-id"] = searchFilters.levelId;
      }

      const response = await api.get("packages", {
        params,
      });

      if (response?.data?.details?.data?.packages) {
        const packageData = response.data.details.data.packages;
        const totalPages = response.data.details.data["total-pages"] || 0;
        // const currentPage = response.data.details.data["current-page"] || 0;

        setDataSource(packageData);
        setPagination({
          total: totalPages * pageSize,
          current: page,
          pageSize: pageSize,
        });
      } else {
        setDataSource([]);
        setPagination({
          total: 0,
          current: 1,
          pageSize: pageSize,
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching packages:", error);
      setLoading(false);
      notification.error({
        message: "Lỗi",
        description: "Đã xảy ra lỗi khi lấy danh sách package!",
      });
    }
  };

  const fetchKits = async (page = 1, pageSize = 20, kitName = "") => {
    try {
      setLoading(true);
      const params = { "kit-name": kitName, page: page - 1, pageSize };
      const response = await api.get("kits", { params });
      const kitsData = response.data.details.data.kits;
      const totalKits = response.data.details.data["total-pages"] * pageSize;

      setKits(kitsData);
      setKitPagination({ current: page, pageSize, total: totalKits });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching kits:", error);
      setLoading(false);
    }
  };

  const handleSearchKit = () => {
    fetchKits(1, kitPagination.pageSize, kitSearchName);
  };

  const fetchKitsAndLevels = async () => {
    try {
      const levelsResponse = await api.get("levels");

      setLevels(levelsResponse.data.details.data.levels);

      const kitsResponse = await api.get("kits");
      setKits(kitsResponse.data.details.data.kits);
    } catch (error) {
      console.error("Lỗi khi lấy levels hoặc kits:", error);
    }
  };

  const createPackage = async (newPackage) => {
    try {
      const payload = {
        name: newPackage.name,
        "kit-id": newPackage["kit-id"],
        "level-id": newPackage["level-id"],
        price: newPackage.price,
        status: newPackage.status,
        "lab-ids": newPackage["lab-ids"],
      };

      const response = await api.post("packages", payload);
      if (response.data && response.data.status === "success") {
        notification.destroy();
        notification.success({
          message: "Thành công",
          description: "Tạo gói thành công!",
          duration: 3,
        });

        fetchPackages(pagination.current, pagination.pageSize);
      }
    } catch (error) {
      console.error(
        "Error creating package:",
        error.response?.data || error.message
      );
      notification.error({
        message: "Lỗi",
        description: error.response?.data?.message || "Không tạo được gói!",
        duration: 3,
      });
    }
  };

  const updatePackage = async (id, updatedPackage) => {
    try {
      setIsSubmitting(true);
      await api.put(`packages`, { ...updatedPackage, id });
      fetchPackages(pagination.current, pagination.pageSize);
      notification.destroy();
      notification.success({
        message: "Thành công",
        description: "Gói được cập nhật thành công!",
        duration: 3,
      });
    } catch (error) {
      console.error("Error updating package:", error.response || error.message);
      notification.destroy();
      notification.error({
        message: "Lỗi",
        description: `Đã xảy ra lỗi khi cập nhật gói: ${
          error.response?.data?.message || error.message
        }`,
        duration: 3,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePackage = async (id) => {
    try {
      setIsSubmitting(true);
      const response = await api.delete(`packages/${id}`);
      setDataSource((prevData) =>
        prevData.map((pkg) => (pkg.id === id ? { ...pkg, status: false } : pkg))
      );
      notification.destroy();
      notification.success({
        message: "Thành công",
        description: "Gói ẩn thành công!",
        duration: 3,
      });
    } catch (error) {
      notification.destroy();
      notification.error({
        message: "Lỗi",
        description: "Đã xảy ra lỗi khi ẩn gói!",
        duration: 3,
      });
      console.error(
        `Error hiding package with id ${id}:`,
        error.response?.data || error.message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const restorePackage = async (id) => {
    try {
      setIsSubmitting(true);
      const response = await api.put(`packages/restore/${id}`);
      setDataSource((prevData) =>
        prevData.map((pkg) => (pkg.id === id ? { ...pkg, status: true } : pkg))
      );

      notification.success({
        message: "Thành công",
        description: "Đã khôi phục gói thành công!",
      });
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Đã xảy ra lỗi khi khôi phục gói!",
        duration: 3,
      });
      console.error(
        `Error restoring package with id ${id}:`,
        error.response?.data || error.message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKitChange = async (kitId) => {
    setKitModalVisible(false);
    form.setFieldsValue({ labIds: [] });

    try {
      const selectedKit = kits.find((kit) => kit.id === kitId);
      setSelectedKitPrice(selectedKit ? selectedKit.price : null);
      const response = await api.get(`kits/${kitId}/lab`);
      let labs = response.data.details.data.labs || [];

      labs = labs.filter((lab) => lab.status === true);

      setAvailableLabs(labs);
    } catch (error) {
      console.error("Error fetching labs:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể lấy danh sách labs liên quan đến kit đã chọn!",
      });
    }
  };

  const handleKitSelect = (kit) => {
    setSelectedKit(kit);
    setSelectedKitPrice(kit.price);
    form.setFieldsValue({ kitId: kit.id });
    setKitModalVisible(false);
    handleKitChange(kit.id);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      name: record.name,
      levelId: record.level.id,
      price: record.price,
    });
    setOpen(true);
  };

  const handleSaveOrUpdate = async (values) => {
    const payload = {
      name: values.name,
      "level-id": values.levelId,
      price: values.price,
      status: values.status,
    };

    if (!editingRecord) {
      payload["kit-id"] = values.kitId;
      payload["lab-ids"] = values.labIds;
    }

    if (editingRecord) {
      await updatePackage(editingRecord.id, payload);
    } else {
      await createPackage(payload);
    }

    setOpen(false);
    form.resetFields();
    setEditingRecord(null);
  };

  const handleViewLabDetails = async (packageId) => {
    try {
      const response = await api.get(`packages/${packageId}/labs`);
      const labs =
        response?.data?.details?.data?.package?.["package-labs"] || [];
      if (labs.length > 0) {
        setLabDetails(labs);
        setIsLabModalOpen(true);
      } else {
        notification.info({
          message: "Thông tin",
          description: "Không có bài labs có sẵn cho gói này.",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error fetching lab details:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể lấy thông tin chi tiết về bài lab!",
      });
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchKitsAndLevels();
  }, []);

  const handleResetFilters = () => {
    // Đặt lại tất cả các bộ lọc về giá trị trống
    setFilters({
      name: "",
      levelId: undefined,
      fromPrice: undefined,
      toPrice: undefined,
      kitName: "",
      categoryName: "",
      status: undefined,
      includeLabs: undefined,
    });

    // Gọi lại hàm fetchPackages để tải lại dữ liệu
    fetchPackages(1, pagination.pageSize, {
      name: "",
      levelId: undefined,
      fromPrice: undefined,
      toPrice: undefined,
      kitName: "",
      categoryName: "",
      status: undefined,
      includeLabs: undefined,
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setEditingRecord(null);
    setSelectedKit(null);
    setAvailableLabs([]);
    setOpen(false);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tên gói",
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <Text className="font-semibold text-red-600">{name}</Text>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <Text className="font-semibold text-grey-700">
          {price.toLocaleString()} VND
        </Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status ? "green" : "red"} className="font-semibold">
          {status ? "Có sẵn" : "Không có sẵn"}
        </Tag>
      ),
    },
    {
      title: "Cấp độ",
      dataIndex: ["level", "name"],
      key: "level-name",
      render: (level) => (
        <Tag color="purple" className="font-semibold">
          {level}
        </Tag>
      ),
    },
    {
      title: "Kit",
      dataIndex: ["kit", "name"],
      key: "kit-name",
      render: (kitName) => (
        <Text className="font-semibold text-orange-400">{kitName}</Text>
      ),
    },
    {
      title: "Loại Kit",
      dataIndex: ["kit", "category", "name"],
      key: "category-name",
      render: (level) => (
        <Tag color="blue" className="font-semibold">
          {level}
        </Tag>
      ),
    },
    {
      title: "Labs",
      key: "labs",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleViewLabDetails(record.id)}
          icon={<EyeOutlined />}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Xem Labs
        </Button>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-5 text-xl">
          <EditOutlined onClick={() => handleEdit(record)} />
          {record.status ? (
            <Popconfirm
              title="Bạn có chắc muốn ẩn gói này không?"
              onConfirm={() => deletePackage(record.id)} // Call deletePackage
            >
              <DeleteOutlined className="cursor-pointer text-red-500" />
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Bạn có muốn khôi phục gói này không?"
              onConfirm={() => restorePackage(record.id)} // Call restorePackage
            >
              <UndoOutlined className="cursor-pointer text-green-500" />
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <Form form={form} component={false}>
      <div className="flex justify-between p-4 bg-white shadow-md items-center mb-3">
        <div className="text-3xl font-semibold text-gray-700">
          Quản Lý Gói Kit
        </div>
        <div className="flex flex-wrap gap-4 justify-end">
          {/* Hàng 1 */}
          <div className="w-full flex gap-4 justify-end">
            <Input
              style={{ width: "350px" }}
              placeholder="Tìm kiếm tên gói"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
            <Select
              placeholder="Chọn Cấp độ"
              value={filters.levelId}
              onChange={(value) => setFilters({ ...filters, levelId: value })}
              style={{ width: "200px" }}
            >
              <Option value={undefined}>Tất cả các cấp độ</Option>
              {levels.map((level) => (
                <Option key={level.id} value={level.id}>
                  {level.name}
                </Option>
              ))}
            </Select>
            <InputNumber
              placeholder="Giá từ"
              value={filters.fromPrice}
              onChange={(value) => setFilters({ ...filters, fromPrice: value })}
              style={{ width: "200px" }}
            />
            <InputNumber
              placeholder="Đến giá"
              value={filters.toPrice}
              onChange={(value) => setFilters({ ...filters, toPrice: value })}
              style={{ width: "200px" }}
            />
          </div>

          {/* Hàng 2 */}
          <div className="w-full flex gap-4 justify-end">
            <Input
              placeholder="Tên Kit"
              value={filters.kitName}
              onChange={(e) =>
                setFilters({ ...filters, kitName: e.target.value })
              }
              style={{ width: "300px" }}
            />
            <Input
              placeholder="Tên loại Kit"
              value={filters.categoryName}
              onChange={(e) =>
                setFilters({ ...filters, categoryName: e.target.value })
              }
              style={{ width: "300px" }}
            />
            <Select
              placeholder="Trạng thái"
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              style={{ width: "200px" }}
            >
              <Option value={true}>
                <Tag color="green" className="font-semibold">
                  Có sẵn
                </Tag>
              </Option>
              <Option value={false}>
                <Tag color="red" className="font-semibold">
                  Không có sẵn
                </Tag>
              </Option>
            </Select>
          </div>
          <div className="w-full flex gap-4 justify-end">
            {/* Nút Search */}
            <Button
              icon={<SearchOutlined />}
              type="primary"
              onClick={() => fetchPackages(1, pagination.pageSize, filters)}
            >
              Tìm Kiếm
            </Button>

            {/* Nút Reset */}
            <Button onClick={() => handleResetFilters()}>Đặt lại</Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end ml-5 mb-3">
        <button
          onClick={() => {
            form.resetFields();
            setEditingRecord(null);
            setSelectedKit(null);
            setAvailableLabs([]);
            setOpen(true);
          }}
          className="flex mr-4 gap-3 text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-10 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
        >
          <div>
            <PlusCircleOutlined />
          </div>
          Thêm
        </button>
      </div>

      <Table
        bordered
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        rowKey="id"
        rowClassName={(record) =>
          record.status ? "" : "bg-gray-200 opacity-50"
        }
        pagination={{
          total: pagination.total,
          current: pagination.current,
          pageSize: pagination.pageSize,
          showSizeChanger: false,
          onChange: (page, pageSize) => {
            fetchPackages(page, pageSize);
          },
        }}
      />

      <Modal
        title={editingRecord ? "Chỉnh Sửa Gói" : "Tạo Gói Mới"}
        open={isOpen}
        onCancel={handleCancel}
        onOk={() => form.submit()}
      >
        <Spin spinning={isSubmitting}>
          <Form form={form} onFinish={handleSaveOrUpdate} layout="vertical">
            <Form.Item
              name="name"
              label="Tên Gói"
              rules={[{ required: true, message: "Vui lòng nhập tên gói!" }]}
            >
              <Input />
            </Form.Item>

            {/* Hiển thị Kit và Labs khi tạo mới (khi không có editingRecord) */}
            {!editingRecord && (
              <>
                <Form.Item
                  name="kitId"
                  label="Chọn Kit"
                  rules={[{ required: true, message: "Vui lòng chọn Kit!" }]}
                >
                  <Button
                    onClick={() => {
                      setKitModalVisible(true);
                      fetchKits();
                    }}
                  >
                    {selectedKit
                      ? `${selectedKit.name} - ${selectedKit[
                          "purchase-cost"
                        ].toLocaleString()} VND`
                      : "Chọn Kit"}
                  </Button>
                </Form.Item>
                {selectedKitPrice && (
                  <p>
                    Giá Kit đã chọn: {selectedKitPrice.toLocaleString()} VND
                  </p>
                )}
                <Form.Item
                  name="labIds"
                  label="Chọn Labs"
                  rules={[
                    { required: true, message: "Vui lòng chọn bài Lab!" },
                  ]}
                >
                  <Select mode="multiple" placeholder="Chọn bài Lab">
                    {availableLabs.map((lab) => (
                      <Select.Option key={lab.id} value={lab.id}>
                        {lab.name} , <strong>Giá</strong> :{" "}
                        {lab.price.toLocaleString()} VND
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </>
            )}

            <Form.Item
              name="levelId"
              label="Chọn cấp độ Level"
              rules={[{ required: true, message: "Vui lòng chọn cấp độ!" }]}
            >
              <Select placeholder="Chọn cấp độ">
                {levels.map((level) => (
                  <Option key={level.id} value={level.id}>
                    {level.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="price"
              label="Giá"
              rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              valuePropName="checked"
              style={{ display: editingRecord ? "none" : "block" }}
            >
              <Switch
                checkedChildren="Có sẵn"
                unCheckedChildren="Không có sẵn"
              />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      {/* Modal for selecting kits */}
      <Modal
        title="Chọn Kit"
        visible={kitModalVisible}
        onCancel={() => {
          setKitModalVisible(false);
          setKitSearchName("");
          fetchKits(1, kitPagination.pageSize, "");
        }}
        footer={null}
      >
        <div className="flex items-center mb-3">
          <Input
            placeholder="Tìm kiếm kit"
            value={kitSearchName}
            onChange={(e) => setKitSearchName(e.target.value)}
          />
          <Button
            icon={<SearchOutlined />}
            onClick={handleSearchKit}
            type="primary"
            className="ml-2"
          >
            Tìm kiếm
          </Button>
        </div>
        <Table
          dataSource={kits}
          columns={[
            { title: "Tên Kit", dataIndex: "name", key: "name" },
            {
              title: "Giá",
              dataIndex: "purchase-cost",
              key: "purchase-cost",
              render: (cost) => `${cost.toLocaleString()} VND`,
            },
            {
              title: "Thao tác",
              key: "action",
              render: (_, record) => (
                <Button type="primary" onClick={() => handleKitSelect(record)}>
                  Chọn
                </Button>
              ),
            },
          ]}
          rowKey="id"
          pagination={{
            total: kitPagination.total,
            current: kitPagination.current,
            pageSize: kitPagination.pageSize,
            onChange: (page) =>
              fetchKits(page, kitPagination.pageSize, kitSearchName),
          }}
        />
      </Modal>

      {/* Modal for lab details */}
      <Modal
        title="Chi tiết bài lab"
        open={isLabModalOpen}
        onCancel={() => setIsLabModalOpen(false)}
        footer={null}
      >
        {labDetails.length > 0 ? (
          <ul>
            {labDetails.map((lab) => (
              <li key={lab.id}>
                <strong>{lab.name}</strong> , <strong>Giá</strong> : {lab.price}{" "}
                VND , <strong>Tác giả</strong> : {lab.author}
              </li>
            ))}
          </ul>
        ) : (
          <p>Không có bài lab nào</p>
        )}
      </Modal>
    </Form>
  );
}

export default ManagerContentPackage;
