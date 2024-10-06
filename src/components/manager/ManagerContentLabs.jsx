/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
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
  Switch,
  Upload,
  Button,
} from "antd";
import { useEffect, useState } from "react";
import { Option } from "antd/es/mentions";
import api from "../../config/axios";

function ManagerLabs() {
  const [form] = Form.useForm();

  const [dataSource, setDataSource] = useState([]); // Sử dụng dữ liệu labs từ props
  const [isOpen, setOpen] = useState(false);
  const [levels, setLevels] = useState([]);
  const [kits, setKits] = useState([]);
  const [file, setFile] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null); // Trạng thái để biết là thêm mới hay chỉnh sửa
  const [loading, setLoading] = useState(true); // Thêm state để hiển thị trạng thái loading
  const [pagination, setPagination] = useState({
    current: 0, // Bắt đầu từ trang 0
    total: 0, // Tổng số items
    pageSize: 20, // Số mục trên mỗi trang (cố định là 20)
  });

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
  const fetchLabs = async (page = 0) => {
    try {
      setLoading(true); // Bắt đầu loading khi gọi API

      // Gọi API với tham số page
      const response = await api.get("labs", {
        params: {
          Page: page,
        },
      });

      const data = response.data.details.data;
      console.log(data);

      setDataSource(data.labs); // Cập nhật dữ liệu lab

      // Tính tổng số items dựa trên totalPages và pageSize
      setPagination({
        current: data["current-page"], // Trang hiện tại từ API
        total: data["total-pages"] * 20, // Tổng số items (totalPages * pageSize)
        pageSize: 20, // Số mục trên mỗi trang
      });

      setLoading(false);
    } catch (error) {
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
        alert("Please upload a file before submitting.");
        return; // Ngừng nếu không có file
      }
      formData.append("File", file);
      const response = await api.post("Labs", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Created Lab:", response.data);
      fetchLabs(); // Refresh lại danh sách sau khi thêm mới
    } catch (error) {
      console.error(
        "Error creating lab:",
        error.response?.data?.details?.errors || error.message
      );
      alert(
        "Lỗi: " +
          JSON.stringify(error.response?.data?.details?.errors || error.message)
      );
    }
  };

  // Hàm cập nhật Kit với multipart/form-data
  const updateLab = async (id, updatedLab) => {
    try {
      const response = await api.put(`Labs/${id}`, updatedLab, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Updated Lab:", response.data);
      fetchLabs(); // Refresh lại danh sách sau khi cập nhật
    } catch (error) {
      console.error(
        `Error updating lab with id ${id}:`,
        error.response?.data || error.message
      );
    }
  };

  // Hàm xóa Kit dựa trên ID
  const handleDelete = async (id) => {
    try {
      await api.delete(`Labs/${id}`);
      fetchLabs(); // Refresh lại danh sách sau khi xóa
    } catch (error) {
      console.error(`Error deleting lab with id ${id}:`, error);
    }
  };

  useEffect(() => {
    fetchLabs();
    fetchLevelsAndKits();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => <span>{price.toLocaleString()} VND</span>, // Hiển thị số tiền
    },
    {
      title: "Max Support Times",
      dataIndex: "max-support-times",
      key: "maxSupportTimes",
    },
    {
      title: "Author",
      dataIndex: "author",
      key: "author",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span style={{ color: status ? "green" : "red" }}>
          {status ? "Available" : "Unavailable"}
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
      title: "Level",
      dataIndex: ["level", "name"], // Lấy tên từ level.name
      key: "level",
      render: (levelName) => <span>{levelName}</span>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        return (
          <div className="flex gap-5 text-xl">
            <EditOutlined
              onClick={() => handleEdit(record)} // Nhấn để chỉnh sửa
              style={{ cursor: "pointer" }}
            />
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa?"
              onConfirm={() => handleDelete(record.id)}
            >
              <DeleteOutlined style={{ cursor: "pointer", color: "red" }} />
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      kit: record.kit.id,
      level: record.level.id,
      "max-support-times": record["max-support-times"],
    });
    setOpen(true);
  };

  // Xử lý khi lưu hoặc cập nhật
  const handleSaveOrUpdate = async (values) => {
    try {
      console.log(values);
      if (!file) {
        alert("Please upload a file before submitting.");
        return;
      }

      console.log(values.name);

      const labData = {
        //id: editingRecord ? editingRecord.id : null, // Đảm bảo có ID nếu đang chỉnh sửa
        kitId: values.kit,
        levelId: values.level,
        name: values.name,
        price: values.price || 0,
        "max-support-times": values["max-support-times"],
        author: values.author,
        status: values.status ? true : false,
        file: file,
      };
      console.log(labData);

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

  return (
    <Form form={form} component={false}>
      {/* Header */}
      <div className="flex justify-between p-4 bg-white shadow-md items-center mb-7">
        <div className="text-2xl font-semibold text-gray-700">
          Lab Manager Panel
        </div>
      </div>

      {/* Table hiển thị danh sách labs */}
      <Table
        bordered
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        rowClassName="editable-row"
        rowKey="id"
        pagination={{
          current: pagination.current + 1, // Hiển thị trang hiện tại, cộng 1 vì Ant Design bắt đầu từ 1
          total: pagination.total, // Tổng số items
          pageSize: pagination.pageSize, // Số mục trên mỗi trang (luôn là 20)
          onChange: (page) => {
            fetchLabs(page - 1); // Gọi lại API với trang mới (page - 1 vì API bắt đầu từ 0)
          },
        }}
      />

      {/* Nút Thêm */}
      <div className="flex justify-end mt-5">
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

      {/* Modal để tạo mới hoặc chỉnh sửa */}
      <Modal
        title={editingRecord ? "Edit Lab" : "Create New Lab"}
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
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please input the name!",
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
                message: "Please input the price!",
              },
              {
                type: "number",
                min: 0,
                message: "Price must be a positive number",
              },
            ]}
          >
            <InputNumber min={0} />
          </Form.Item>

          {/* Max Support Times */}
          <Form.Item
            label="Max Support Times"
            name="max-support-times"
            rules={[
              {
                required: true,
                message: "Please input the max support times!",
              },
              {
                type: "number",
                min: 0,
                message: "Max support times must be a positive number",
              },
            ]}
          >
            <InputNumber min={0} />
          </Form.Item>

          {/* Author */}
          <Form.Item
            label="Author"
            name="author"
            rules={[
              {
                required: true,
                message: "Please input the author!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          {/* Status */}
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
          </Form.Item>

          <Form.Item
            label="Kit"
            name="kit"
            rules={[{ required: true, message: "Please select a kit!" }]}
          >
            <Select>
              {kits.map((kit) => (
                <Option key={kit.id} value={kit.id}>
                  {console.log(kit.id)}
                  {kit.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Level"
            name="level"
            rules={[{ required: true, message: "Please select a level!" }]}
          >
            <Select>
              {levels.map((level) => (
                <Option key={level.id} value={level.id}>
                  {level.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="File"
            name="file"
            rules={[{ required: false, message: "Please upload a file!" }]}
          >
            <Upload
              beforeUpload={() => false}
              onChange={handleFileChange}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload File</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </Form>
  );
}

export default ManagerLabs;
