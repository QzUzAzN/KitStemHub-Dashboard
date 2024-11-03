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
} from "antd";
import { useEffect, useState } from "react";
import { Option } from "antd/es/mentions";
import api from "../../config/axios";

const { Text } = Typography;

function ManagerContentLabs() {
  const [formFilter] = Form.useForm();
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]); // Sử dụng dữ liệu labs từ props
  const [isOpen, setOpen] = useState(false);
  const [levels, setLevels] = useState([]);
  const [kits, setKits] = useState([]);
  const [file, setFile] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null); // Trạng thái để biết là thêm mới hay chỉnh sửa
  const [loading, setLoading] = useState(false); // Thêm state để hiển thị trạng thái loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1, // Bắt đầu từ trang 0
    total: 0, // Tổng số items
    pageSize: 20, // Số mục trên mỗi trang (cố định là 20)
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
  }); // Bộ lọc cho lab name và kit name
  const [selectedKit, setSelectedKit] = useState(null);
  const [kitModalVisible, setKitModalVisible] = useState(false);
  const [kitSearchName, setKitSearchName] = useState("");

  // Hàm xử lý khi chọn file từ Upload component
  const handleFileChange = (info) => {
    if (info.file.status === "removed") {
      setFile(null); // Xóa file khỏi state nếu người dùng xóa file
    } else {
      setFile(info.fileList[0].originFileObj);

      console.log(info);
      console.log(info.fileList[0].originFileObj);

      // Lưu file vào state
    }
  };

  const fetchLabs = async (
    page = 1,
    pageSize = 20,
    searchFilters = filters
  ) => {
    try {
      setLoading(true); // Bắt đầu loading khi gọi API
      // Nếu page nhỏ hơn 1, ta đặt nó về 1 để không gửi giá trị âm
      const currentPage = Math.max(0, page - 1); // Đảm bảo page không bao giờ âm
      const params = {
        page: currentPage, // API bắt đầu từ trang 0
        pageSize: pageSize,
        "lab-name": searchFilters.labName || filters.labName, // Lọc theo lab name
        "kit-name": searchFilters.kitName || filters.kitName, // Lọc theo kit name
      };

      if (searchFilters.status) {
        params.status = searchFilters.status;
      }

      // Gọi API với tham số page và kiểm tra tham số
      console.log("Fetching labs with params:", params);
      // Gọi API với tham số page
      const response = await api.get("labs", {
        params,
      });

      if (response?.data?.details?.data?.labs) {
        const labsData = response.data.details.data.labs;
        const totalPages = response.data.details.data["total-pages"] || 0;
        const currentPage = response.data.details.data["current-page"] || 0;

        // Cập nhật dữ liệu lab vào state
        setDataSource(labsData);

        setPagination({
          total: totalPages * pageSize,
          current: currentPage + 1,
          pageSize: pageSize,
        });
      } else {
        // Nếu không có dữ liệu mong đợi
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
      setLoading(false); // Tắt loading nếu có lỗi
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

  // Hàm lấy Levels và Kits từ API
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

  // Hàm tạo Kit mới với multipart/form-data
  const createLab = async (newLab) => {
    setIsSubmitting(true);
    try {
      console.log("New Lab data before FormData:", newLab); // Log the incoming data
      console.log("Status value before FormData:", newLab.status);
      const formData = new FormData();

      formData.append("LevelId", newLab.levelId);
      formData.append("KitId", newLab.kitId);
      formData.append("Name", newLab.name);
      formData.append("Price", newLab.price || 0);
      formData.append("MaxSupportTimes", newLab.maxSupportTimes);
      formData.append("Author", newLab.author);
      formData.append("Status", newLab.status ? true : false);
      // Kiểm tra file trước khi thêm vào formData

      // Log each entry in FormData to confirm data being sent
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      if (!file) {
        alert("Vui lòng tải lên một tệp trước khi gửi.");
        return; // Ngừng nếu không có file
      }
      formData.append("File", file);
      const response = await api.post("labs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Created Lab:", response.data);
      fetchLabs(pagination.current, pagination.pageSize); // Refresh lại danh sách sau khi thêm mới
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

  // Hàm cập nhật Lab với multipart/form-data và cấu trúc request mới
  const updateLab = async (id, updatedLab) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      formData.append("Id", id); // Gửi ID vào body
      formData.append("LevelId", updatedLab.levelId);
      formData.append("KitId", updatedLab.kitId);
      formData.append("Name", updatedLab.name);
      formData.append("Price", updatedLab.price || 0);
      formData.append("MaxSupportTimes", updatedLab.maxSupportTimes);
      formData.append("Author", updatedLab.author);

      // Nếu có file thì thêm file vào formData
      if (updatedLab.file) {
        formData.append("File", updatedLab.file);
      }

      // Gọi API cập nhật lab
      const response = await api.put("labs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Updated Lab:", response.data);
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

  // Hàm xóa Kit dựa trên ID
  const handleDelete = async (id) => {
    try {
      if (!id) {
        console.error("Invalid lab ID:", id);
        return;
      }

      const response = await api.delete(`labs/${id}`);
      await fetchLabs(pagination.current, pagination.pageSize); // Refresh lại danh sách sau khi xóa
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
  // Hàm khôi phục lab
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

  // Hàm xử lý khi submit filter (khi người dùng nhấn Search)
  const handleFilterSubmit = (values) => {
    const updatedFilters = {
      ...filters,
      ...values, // Chỉ update những trường mà người dùng đã điền
    };
    setFilters(updatedFilters); // Cập nhật filters với các giá trị mới
    fetchLabs(1, pagination.pageSize, updatedFilters); // Gọi API với filter đã cập nhật
  };

  // Hàm reset bộ lọc (Reset tất cả input và fetch lại tất cả dữ liệu)
  const resetFilters = () => {
    formFilter.resetFields(); // Reset các input
    setFilters({
      labName: "",
      kitName: "",
      status: "",
    });
    fetchLabs(1, pagination.pageSize, { labName: "", kitName: "", status: "" }); // Fetch lại mà không có filter
  };

  const viewLabFile = async (labId) => {
    try {
      const response = await api.get(`labs/${labId}/url`);
      const signedUrl = response.data.details["signed-url"];
      window.open(signedUrl, "_blank"); // Mở URL trong tab mới
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
      title: "STT", // Cột Số Thứ Tự
      key: "index", // Đặt tên cho cột
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
      ), // Hiển thị số tiền
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
      dataIndex: ["kit", "name"], // Lấy tên từ kit.name
      key: "kit",
      render: (kitName) => (
        <Text className="font-semibold text-orange-400">{kitName}</Text>
      ),
    },
    {
      title: "Cấp độ",
      dataIndex: ["level", "name"], // Lấy tên từ level.name
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

    // Fetch thông tin Kit cho Lab hiện tại
    const selectedKitData = kits.find((kit) => kit.id === record.kit.id);
    if (selectedKitData) {
      setSelectedKit(selectedKitData);
    } else {
      setSelectedKit(null); // Nếu không tìm thấy Kit, đặt lại selectedKit về null
    }
    form.setFieldsValue({
      ...record,
      kit: record.kit.id,
      level: record.level.id,
      maxSupportTimes: record["max-support-times"],
    });
    setOpen(true);
  };

  // Xử lý khi lưu hoặc cập nhật
  const handleSaveOrUpdate = async (values) => {
    try {
      console.log(values);
      if (!file) {
        alert("Vui lòng tải lên một tệp trước khi gửi.");
        return;
      }

      console.log(values.name);

      const labData = {
        //id: editingRecord ? editingRecord.id : null, // Đảm bảo có ID nếu đang chỉnh sửa
        kitId: selectedKit?.id || values.kit,
        levelId: values.level,
        name: values.name,
        price: values.price || 0,
        maxSupportTimes: values.maxSupportTimes,
        author: values.author,
        status: values.status,
        file: file || editingRecord?.file, // Kiểm tra nếu đã có file trước đó
      };

      console.log("Sending data to API:", labData); // Log FormData before sending
      if (editingRecord) {
        // Nếu đang chỉnh sửa
        await updateLab(editingRecord.id, labData); // Gọi API cập nhật
      } else {
        // Nếu đang thêm mới
        await createLab(labData); // Gọi API thêm mới
      }

      setOpen(false); // Đóng modal
      form.resetFields(); // Reset form
      setEditingRecord(null); // Reset trạng thái chỉnh sửa
      fetchLabs(pagination.current, pagination.pageSize, filters);
    } catch (error) {
      console.error("Failed to save or update lab:", error);
    }
  };

  useEffect(() => {
    fetchLabs();
    fetchLevelsAndKits();
  }, []);

  return (
    <>
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
                  <Option value="">Tất cả</Option>
                  <Option value="true">Có sẵn</Option>
                  <Option value="false">Không có sẵn</Option>
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
          current: pagination.current, // Hiển thị trang hiện tại, cộng 1 vì Ant Design bắt đầu từ 1
          total: pagination.total, // Tổng số items
          pageSize: pagination.pageSize, // Số mục trên mỗi trang (luôn là 20)
          showSizeChanger: false,
          onChange: (page) => {
            // Đảm bảo trang không bao giờ là số âm
            const safePage = Math.max(1, page);
            fetchLabs(safePage, pagination.pageSize, filters); // Gọi lại API với trang mới
          },
        }}
      />

      {/* Modal để tạo mới hoặc chỉnh sửa */}
      <Modal
        title={editingRecord ? "Chỉnh sửa Lab" : "Tạo mới Lab"}
        open={isOpen}
        onCancel={() => setOpen(false)} // Đóng modal
        onOk={() => form.submit()} // Gọi hàm submit khi bấm OK
      >
        <Spin spinning={isSubmitting}>
          <Form
            form={form}
            labelCol={{
              span: 24,
            }}
            onFinish={handleSaveOrUpdate} // Gọi hàm lưu hoặc cập nhật khi form submit
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
                beforeUpload={() => false}
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
    </>
  );
}

export default ManagerContentLabs;
