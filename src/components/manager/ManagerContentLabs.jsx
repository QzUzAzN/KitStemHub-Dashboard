/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import {
  DeleteOutlined,
  EditOutlined,
  FileSearchOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  UndoOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Table,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Modal,
  Upload,
  Button,
  notification,
  Switch,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { Option } from "antd/es/mentions";
import api from "../../config/axios";

const { Text } = Typography;

function ManagerContentLabs() {
  const [formFilter] = Form.useForm();
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [isOpen, setOpen] = useState(false);
  const [levels, setLevels] = useState([]);
  const [kits, setKits] = useState([]);
  const [file, setFile] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null); // Trạng thái để biết là thêm mới hay chỉnh sửa
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const [kitPagination, setKitPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    labName: "",
    kitName: "",
    status: "",
  });
  const [selectedKit, setSelectedKit] = useState(null);
  const [kitModalVisible, setKitModalVisible] = useState(false);
  const [kitSearchName, setKitSearchName] = useState("");

  // Hàm xử lý khi chọn file từ Upload component
  const handleFileChange = (info) => {
    if (info.file.status === "removed") {
      setFile(null);
    } else {
      setFile(info.fileList[0].originFileObj);
    }
  };

  const fetchLabs = async (
    page = 1,
    pageSize = 20,
    searchFilters = filters
  ) => {
    try {
      setLoading(true);

      const currentPage = Math.max(0, page - 1);
      const params = {
        page: currentPage,
        pageSize: pageSize,
        "lab-name": searchFilters.labName || filters.labName,
        "kit-name": searchFilters.kitName || filters.kitName,
      };

      if (searchFilters.status) {
        params.status = searchFilters.status;
      }

      const response = await api.get("labs", {
        params,
      });

      if (response?.data?.details?.data?.labs) {
        const labsData = response.data.details.data.labs;
        const totalPages = response.data.details.data["total-pages"] || 0;
        // const currentPage = response.data.details.data["current-page"] || 0;

        setDataSource(labsData);

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
      console.error("Error fetching labs:", error);
      setLoading(false);
    }
  };

  const fetchKits = async (page = 1, pageSize = 20, kitName = "") => {
    try {
      const response = await api.get("kits", {
        params: { "kit-name": kitName, page: page - 1, pageSize },
      });
      setKits(response.data.details.data.kits);
      setKitPagination({
        total: response.data.details.data["total-pages"] * pageSize,
        current: page,
        pageSize,
      });
    } catch (error) {
      console.error("Error fetching kits:", error);
    }
  };

  const handleSearchKit = () => {
    fetchKits(1, kitPagination.pageSize, kitSearchName);
  };

  const handleKitSelect = (kit) => {
    setSelectedKit(kit);
    setKitModalVisible(false);
    form.setFieldsValue({ kit: kit.id });
  };

  // Hàm lấy Levels và Kits
  const fetchLevelsAndKits = async () => {
    try {
      const levelsResponse = await api.get("levels");
      setLevels(levelsResponse.data.details.data.levels);

      const kitsResponse = await api.get("kits");
      setKits(kitsResponse.data.details.data.kits);
    } catch (error) {
      console.error("Error fetching levels or kits:", error);
    }
  };

  const createLab = async (newLab) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      formData.append("LevelId", newLab.levelId);
      formData.append("KitId", newLab.kitId);
      formData.append("Name", newLab.name);
      formData.append("Price", newLab.price || 0);
      formData.append("MaxSupportTimes", newLab.maxSupportTimes);
      formData.append("Author", newLab.author);
      formData.append("Status", newLab.status ? true : false);

      formData.append("File", file);
      const response = await api.post("labs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      fetchLabs(pagination.current, pagination.pageSize);
      notification.destroy();
      notification.success({
        message: "Thành công",
        description: "Lab đã được tạo thành công!",
        duration: 3,
      });
    } catch (error) {
      notification.destroy();
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi tạo lab!",
        duration: 3,
      });
      console.error(
        "Error creating lab:",
        error.response?.data?.details?.errors || error.message
      );
    }
    setIsSubmitting(false);
  };

  const updateLab = async (id, updatedLab) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      formData.append("Id", id);
      formData.append("LevelId", updatedLab.levelId);
      formData.append("KitId", updatedLab.kitId);
      formData.append("Name", updatedLab.name);
      formData.append("Price", updatedLab.price || 0);
      formData.append("MaxSupportTimes", updatedLab.maxSupportTimes);
      formData.append("Author", updatedLab.author);

      if (updatedLab.file) {
        formData.append("File", updatedLab.file);
      }

      const response = await api.put("labs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      fetchLabs(pagination.current, pagination.pageSize);
      notification.destroy();
      notification.success({
        message: "Thành công",
        description: "Lab đã được cập nhật thành công!",
        duration: 3,
      });
    } catch (error) {
      notification.destroy();
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật lab!",
        duration: 3,
      });
      console.error(
        `Error updating lab with id ${id}:`,
        error.response?.data || error.message
      );
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    try {
      if (!id) {
        console.error("Invalid lab ID:", id);
        return;
      }

      const response = await api.delete(`labs/${id}`);
      await fetchLabs(pagination.current, pagination.pageSize);
      notification.destroy();
      notification.success({
        message: "Thành công",
        description: "Lab đã được xóa thành công!",
        duration: 3,
      });
    } catch (error) {
      notification.destroy();
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi xóa lab!",
        duration: 3,
      });
      console.error(`Error deleting lab with id ${id}:`, error);
    }
  };

  const restoreLab = async (id) => {
    try {
      const formData = new FormData();
      formData.append("id", id);

      const response = await api.put(`labs/restore/${id}`, formData);

      await fetchLabs(pagination.current, pagination.pageSize);
      notification.destroy();
      notification.success({
        message: "Thành công",
        description: "Lab đã được khôi phục thành công!",
        duration: 3,
      });
    } catch (error) {
      notification.destroy();
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi khôi phục lab!",
        duration: 3,
      });
      console.error("Error restoring lab:", error);
    }
  };

  // Hàm xử lý khi submit filter
  const handleFilterSubmit = (values) => {
    const updatedFilters = {
      ...filters,
      ...values,
    };
    setFilters(updatedFilters);
    fetchLabs(1, pagination.pageSize, updatedFilters);
  };

  // Hàm reset filter
  const resetFilters = () => {
    formFilter.resetFields();
    setFilters({
      labName: "",
      kitName: "",
      status: "",
    });
    fetchLabs(1, pagination.pageSize, { labName: "", kitName: "", status: "" });
  };

  const viewLabFile = async (labId) => {
    try {
      const response = await api.get(`labs/${labId}/url`);
      const signedUrl = response.data.details["signed-url"];
      window.open(signedUrl, "_blank");
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi mở file bài lab!",
        duration: 3,
      });
      console.error("Error fetching signed URL:", error);
    }
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (text, record, index) => (
        <span>
          {(pagination.current - 1) * pagination.pageSize + index + 1}
        </span>
      ),
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (id) => <Text className="font-semibold text-gray-700">{id}</Text>,
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <Text strong className="text-purple-600">
          {name}
        </Text>
      ),
    },
    {
      title: "Chi tiết",
      key: "view",
      width: 150,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<FileSearchOutlined />}
          onClick={() => viewLabFile(record.id)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Xem lab
        </Button>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 150,
      render: (price) => (
        <Text className="font-semibold text-gray-700">
          {price.toLocaleString()} VND
        </Text>
      ),
    },
    {
      title: "Số lần hỗ trợ tối đa",
      dataIndex: "max-support-times",
      key: "maxSupportTimes",
      width: 100,
      render: (maxSupportTimes) => (
        <Text className="font-semibold text-gray-700">{maxSupportTimes}</Text>
      ),
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
      width: 130,
      render: (author) => (
        <Text className="font-semibold text-gray-700">{author}</Text>
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
      title: "Kit",
      dataIndex: ["kit", "name"],
      key: "kit",
      render: (kitName) => (
        <Text className="font-semibold text-orange-400">{kitName}</Text>
      ),
    },
    {
      title: "Cấp độ",
      dataIndex: ["level", "name"],
      key: "level",
      render: (level) => (
        <Tag color="purple" className="font-semibold">
          {level}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-5 text-xl">
          <EditOutlined
            onClick={() => handleEdit(record)}
            style={{ cursor: "pointer" }}
          />
          {record.status ? (
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa?"
              onConfirm={() => handleDelete(record.id)}
            >
              <DeleteOutlined className="cursor-pointer text-red-500" />
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Bạn có muốn khôi phục lab này?"
              onConfirm={() => restoreLab(record.id)}
            >
              <UndoOutlined className="cursor-pointer text-green-500 hover:text-green-700 !opacity-100" />
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  const kitModalColumns = [
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
  ];

  const handleEdit = (record) => {
    setEditingRecord(record);

    const selectedKitData = kits.find((kit) => kit.id === record.kit.id);
    if (selectedKitData) {
      setSelectedKit(selectedKitData);
    } else {
      setSelectedKit(null);
    }
    form.setFieldsValue({
      ...record,
      kit: record.kit.id,
      level: record.level.id,
      maxSupportTimes: record["max-support-times"],
    });
    setOpen(true);
  };

  const handleSaveOrUpdate = async (values) => {
    try {
      console.log(values);
      if (!file) {
        message.error("Vui lòng tải lên một tệp trước khi gửi.");
        return;
      }
      const labData = {
        kitId: selectedKit?.id || values.kit,
        levelId: values.level,
        name: values.name,
        price: values.price || 0,
        maxSupportTimes: values.maxSupportTimes,
        author: values.author,
        status: values.status,
        file: file || editingRecord?.file,
      };
      if (editingRecord) {
        await updateLab(editingRecord.id, labData);
      } else {
        await createLab(labData);
      }
      setOpen(false);
      form.resetFields();
      setEditingRecord(null);
      fetchLabs(pagination.current, pagination.pageSize, filters);
    } catch (error) {
      console.error("Failed to save or update lab:", error);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setEditingRecord(null);
    setSelectedKit(null);
    form.resetFields();
  };

  useEffect(() => {
    fetchLabs();
    fetchLevelsAndKits();
  }, []);

  return (
    <div>
      <Form form={formFilter} onFinish={handleFilterSubmit}>
        <div className="flex justify-between p-4 bg-white shadow-md items-center mb-3">
          <div className="text-3xl font-semibold text-gray-700">
            Quản lý Lab
          </div>
          {/* Header */}
          <div className="flex flex-wrap justify-end">
            <div className="w-full flex gap-4 justify-end">
              {/* Input search */}
              <Form.Item name="labName">
                <Input placeholder="Tên Lab" />
              </Form.Item>
              <Form.Item name="kitName">
                <Input placeholder="Tên Kit" />
              </Form.Item>
              <Form.Item name="status">
                <Select placeholder="Trạng thái" style={{ width: 120 }}>
                  <Option value="true">
                    <Tag color="green" className="font-semibold">
                      Có sẵn
                    </Tag>
                  </Option>
                  <Option value="false">
                    <Tag color="red" className="font-semibold">
                      Không có sẵn
                    </Tag>
                  </Option>
                </Select>
              </Form.Item>
            </div>
            <div className="w-full flex gap-2 justify-end">
              <Button
                icon={<SearchOutlined />}
                type="primary"
                htmlType="submit"
                className="mr-2"
              >
                Tìm kiếm
              </Button>
              <Button onClick={resetFilters}>Đặt lại</Button>
            </div>
          </div>
        </div>
      </Form>
      {/* Nút Thêm */}
      <div className="flex justify-end ml-5 mb-3">
        <button
          onClick={() => {
            form.resetFields();
            setEditingRecord(null);
            setSelectedKit(null);
            setFile(null);
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

      {/* Table hiển thị danh sách labs */}
      <Table
        bordered
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        rowClassName={(record) =>
          record.status ? "" : "bg-gray-200 opacity-50 cursor-not-allowed"
        }
        rowKey="id"
        pagination={{
          current: pagination.current,
          total: pagination.total,
          pageSize: pagination.pageSize,
          showSizeChanger: false,
          onChange: (page) => {
            const safePage = Math.max(1, page);
            fetchLabs(safePage, pagination.pageSize, filters);
          },
        }}
      />

      {/* Modal để tạo mới hoặc chỉnh sửa */}
      <Modal
        title={editingRecord ? "Chỉnh sửa Lab" : "Tạo mới Lab"}
        open={isOpen}
        onCancel={handleCancel}
        onOk={() => form.submit()}
      >
        <Spin spinning={isSubmitting}>
          <Form
            form={form}
            labelCol={{
              span: 24,
            }}
            onFinish={handleSaveOrUpdate}
          >
            {/* Name */}
            <Form.Item
              label="Tên"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            {/* Price */}
            <Form.Item
              label="Price"
              name="price"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập giá!",
                },
                {
                  type: "number",
                  min: 0,
                  message: "Giá phải lớn hơn 0",
                },
              ]}
            >
              <InputNumber min={0} />
            </Form.Item>
            {/* Max Support Times */}
            <Form.Item
              label="Số lần hỗ trợ tối đa"
              name="maxSupportTimes"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập số lần hỗ trợ tối đa!",
                },
                {
                  type: "number",
                  min: 0,
                  message: "Số lần hỗ trợ tối đa phải là số dương",
                },
              ]}
            >
              <InputNumber min={0} />
            </Form.Item>
            {/* Author */}
            <Form.Item
              label="Tác giả"
              name="author"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tác giả!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Kit"
              name="kit"
              rules={[{ required: true, message: "Vui lòng chọn kit!" }]}
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
            <Form.Item
              label="Cấp độ"
              name="level"
              rules={[{ required: true, message: "Vui lòng chọn cấp độ!" }]}
            >
              <Select placeholder="Select Level">
                {levels.map((level) => (
                  <Option key={level.id} value={level.id}>
                    {level.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Tệp" name="file">
              <Upload
                accept=".pdf,.doc,.docx"
                beforeUpload={(file) => {
                  const allowedTypes = [
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  ];
                  if (!allowedTypes.includes(file.type)) {
                    message.error("Chỉ cho phép tải file PDF hoặc Word");
                    return Upload.LIST_IGNORE;
                  }
                  return false;
                }}
                onChange={handleFileChange}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Tải tệp lên</Button>
              </Upload>
            </Form.Item>

            {/* Status */}
            {!editingRecord && (
              <Form.Item
                label="Trạng thái"
                name="status"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Có sẵn"
                  unCheckedChildren="Không có sẵn"
                />
              </Form.Item>
            )}
          </Form>
        </Spin>
      </Modal>

      {/* Modal chọn Kit */}
      <Modal
        title="Chọn Kit"
        open={kitModalVisible}
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
          columns={kitModalColumns}
          rowKey={(record) => record.id}
          pagination={{
            total: kitPagination.total,
            current: kitPagination.current,
            pageSize: kitPagination.pageSize,
            onChange: (page) =>
              fetchKits(page, kitPagination.pageSize, kitSearchName),
          }}
        />
      </Modal>
    </div>
  );
}

export default ManagerContentLabs;
