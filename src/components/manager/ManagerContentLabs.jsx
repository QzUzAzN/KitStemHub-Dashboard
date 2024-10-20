/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import {
  DeleteOutlined,
  EditOutlined,
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
} from "antd";
import { useEffect, useState } from "react";
import { Option } from "antd/es/mentions";
import api from "../../config/axios";

function ManagerContentLabs() {
  const [form] = Form.useForm();

  const [dataSource, setDataSource] = useState([]); // Sử dụng dữ liệu labs từ props
  const [isOpen, setOpen] = useState(false);
  const [levels, setLevels] = useState([]);
  const [kits, setKits] = useState([]);
  const [file, setFile] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null); // Trạng thái để biết là thêm mới hay chỉnh sửa
  const [loading, setLoading] = useState(true); // Thêm state để hiển thị trạng thái loading
  const [pagination, setPagination] = useState({
    current: 1, // Bắt đầu từ trang 0
    total: 0, // Tổng số items
    pageSize: 20, // Số mục trên mỗi trang (cố định là 20)
  });
  const [filters, setFilters] = useState({
    labName: "",
    kitName: "",
  }); // Bộ lọc cho lab name và kit name
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

  // Hàm lấy danh sách Labs
  // const fetchLabs = async () => {
  //   try {
  //     const response = await api.get("Labs");
  //     console.log(response.data);
  //     setDataSource(response.data.details.data.labs);
  //     setLoading(false);
  //   } catch (error) {
  //     console.error("Error fetching labs:", error);
  //     setLoading(false); // Tắt loading nếu có lỗi
  //   }
  // };
  const fetchLabs = async (
    page = 1,
    pageSize = 20,
    searchFilters = filters,
    showNotification = true
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

      // Gọi API với tham số page và kiểm tra tham số
      console.log("Fetching labs with params:", params);
      // Gọi API với tham số page
      const response = await api.get("labs", {
        params,
      });

      if (
        response.data &&
        response.data.details &&
        response.data.details.data &&
        response.data.details.data.labs
      ) {
        const labsData = response.data.details.data.labs;
        const totalPages = response.data.details.data["total-pages"] || 0;
        const currentPage = response.data.details.data["current-page"] || 0;

        // Cập nhật dữ liệu lab vào state
        setDataSource(labsData);

        // Tính toán pagination
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
      if (showNotification) {
        notification.destroy();
        notification.success({
          message: "Thành công",
          description: "Lấy danh sách labs thành công!",
          duration: 3,
        });
      }
    } catch (error) {
      notification.destroy();
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi lấy danh sách labs!",
        duration: 3,
      });
      console.error("Error fetching labs:", error);
      setLoading(false); // Tắt loading nếu có lỗi
    }
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
    try {
      const formData = new FormData();

      formData.append("LevelId", newLab.levelId);
      formData.append("KitId", newLab.kitId);
      formData.append("Name", newLab.name);
      formData.append("Price", newLab.price || 0);
      formData.append("MaxSupportTimes", newLab.maxSupportTimes);
      formData.append("Author", newLab.author);
      formData.append("Status", newLab.status ? "true" : "false");
      // Kiểm tra file trước khi thêm vào formData
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
  };

  // Hàm cập nhật Lab với multipart/form-data và cấu trúc request mới
  const updateLab = async (id, updatedLab) => {
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
      console.log("Chi tiết lỗi từ server:", error.response?.data?.details);
    }
  };

  // Hàm xóa Kit dựa trên ID
  const handleDelete = async (id) => {
    try {
      if (!id) {
        console.error("Invalid lab ID:", id);
        return;
      }

      const response = await api.delete(`labs/${id}`, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: { id },
      });
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

      const response = await api.put(`labs/restore/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

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
    form.resetFields(); // Reset các input
    setFilters({
      labName: "",
      kitName: "",
    });
    fetchLabs(1, pagination.pageSize); // Fetch lại mà không có filter
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
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => <span>{price.toLocaleString()} VND</span>, // Hiển thị số tiền
    },
    {
      title: "Số lần hỗ trợ tối đa",
      dataIndex: "max-support-times",
      key: "maxSupportTimes",
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span style={{ color: status ? "green" : "red" }}>
          {status ? "Có sẵn" : "Không có sẵn"}
        </span>
      ),
    },
    {
      title: "Kit",
      dataIndex: ["kit", "name"], // Lấy tên từ kit.name
      key: "kit",
      render: (kitName) => <span>{kitName}</span>,
    },
    {
      title: "Cấp độ",
      dataIndex: ["level", "name"], // Lấy tên từ level.name
      key: "level",
      render: (levelName) => <span>{levelName}</span>,
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

  const handleEdit = (record) => {
    setEditingRecord(record);
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
        kitId: values.kit,
        levelId: values.level,
        name: values.name,
        price: values.price || 0,
        maxSupportTimes: values.maxSupportTimes,
        author: values.author,
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
    } catch (error) {
      console.error("Failed to save or update lab:", error);
    }
  };

  useEffect(() => {
    fetchLabs();
    fetchLevelsAndKits();
  }, []);

  return (
    <Form form={form} component={false}>
      {/* Header */}
      <div className="flex justify-between p-4 bg-white shadow-md items-center mb-7">
        <div className="text-3xl font-semibold text-gray-700">Quản lý Lab</div>

        {/* Input search */}
        <Form layout="inline" onFinish={handleFilterSubmit}>
          <Form.Item name="labName">
            <Input placeholder="Tên Lab" />
          </Form.Item>
          <Form.Item name="kitName">
            <Input placeholder="Tên Kit" />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Tìm kiếm
          </Button>
          <Button onClick={resetFilters}>Đặt lại</Button>
        </Form>
      </div>
      {/* Nút Thêm */}
      <div className="flex mt-5 ml-5">
        <button
          onClick={() => {
            form.resetFields(); // Đặt lại các trường form khi thêm mới
            setEditingRecord(null); // Đặt lại record để chuyển sang trạng thái thêm mới
            setOpen(true); // Mở Modal để thêm mới
          }}
          className="flex mr-10 gap-3 text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-10 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
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

          {/* Status
          <Form.Item
            label="Status"
            name="status"
            valuePropName="checked"
            rules={[
              {
                required: true,
                message: "Please set the status!",
              },
            ]}
          >
            <Switch
              checkedChildren="Available"
              unCheckedChildren="Unavailable"
            />
          </Form.Item> */}

          <Form.Item
            label="Kit"
            name="kit"
            rules={[{ required: true, message: "Vui lòng chọn kit!" }]}
          >
            <Select placeholder="Select Kit">
              {kits.map((kit) => (
                <Option key={kit.id} value={kit.id}>
                  {console.log(kit.id)}
                  {kit.name}
                </Option>
              ))}
            </Select>
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

          <Form.Item
            label="Tệp"
            name="file"
            rules={[{ required: false, message: "Vui lòng tải lên một tệp!" }]}
          >
            <Upload
              beforeUpload={() => false}
              onChange={handleFileChange}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Tải tệp lên</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </Form>
  );
}

export default ManagerContentLabs;
