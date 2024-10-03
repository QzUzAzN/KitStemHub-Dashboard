/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import {
  Table,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Button,
  Select,
  Modal,
  Switch,
} from "antd";
import { useEffect, useState } from "react";
import { Option } from "antd/es/mentions";
import api from "../../config/axios";

function ManagerContentKits() {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [isOpen, setOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Thêm state để hiển thị trạng thái loading
  const [editingRecord, setEditingRecord] = useState(null); // Trạng thái để biết là thêm mới hay chỉnh sửa

  // Hàm lấy danh sách Kits từ API
  const fetchKits = async () => {
    try {
      const response = await api.get("Kits");
      console.log(response.data);
      setDataSource(response.data.details.data.kits);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching kits:", error);
      setLoading(false); // Tắt loading nếu có lỗi
    }
  };

  // Hàm tạo Kit mới với multipart/form-data
  const createKit = async (newKit) => {
    try {
      const formData = new FormData();
      formData.append("CategoryId", newKit.categoryId);
      formData.append("Name", newKit.name);
      formData.append("Brief", newKit.brief);
      formData.append("Description", newKit.description || "");
      formData.append("PurchaseCost", newKit.purchaseCost || 0);
      formData.append("Status", newKit.status ? "true" : "false");

      console.log(formData);
      const response = await api.post("Kits", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Created Kit:", response.data);
      fetchKits(); // Refresh lại danh sách sau khi thêm mới
    } catch (error) {
      console.error(
        "Error creating kit:",
        error.response?.data?.details?.errors || error.message
      );
      alert(
        "Lỗi: " +
          JSON.stringify(error.response?.data?.details?.errors || error.message)
      );
    }
  };

  // Hàm cập nhật Kit với multipart/form-data
  const updateKit = async (id, updatedKit) => {
    try {
      // Gửi yêu cầu dưới dạng JSON, không cần FormData cho PUT
      const response = await api.put("Kits", updatedKit, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Updated Kit:", response.data);
      fetchKits(); // Refresh lại danh sách sau khi cập nhật
    } catch (error) {
      console.error(
        `Error updating kit with id ${id}:`,
        error.response?.data || error.message
      );
    }
  };

  // Hàm xóa Kit dựa trên ID
  const deleteKit = async (id) => {
    try {
      await api.delete(`Kits/${id}`);
      fetchKits(); // Refresh lại danh sách sau khi xóa
    } catch (error) {
      console.error(`Error deleting kit with id ${id}:`, error);
    }
  };

  // Gọi hàm fetchKits để lấy dữ liệu khi component được mount
  useEffect(() => {
    fetchKits();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 50,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 300,
    },
    {
      title: "Brief",
      dataIndex: "brief",
      key: "brief",
      width: 450,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description) => (
        <div style={{ maxWidth: 400, whiteSpace: "normal" }}>
          {description.length > 100
            ? description.slice(0, 100) + "..."
            : description}
        </div>
      ),
    },
    {
      title: "Purchase Cost",
      dataIndex: "purchaseCost",
      key: "purchaseCost",
      render: (cost) => <span>{cost.toLocaleString()} VND</span>, // Hiển thị số tiền
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
      title: "Category",
      dataIndex: ["category", "name"], // Lấy tên từ category.name
      key: "category",
      render: (categoryName) => <span>{categoryName}</span>,
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
              onConfirm={() => handleDelete(record.id)} // Gọi hàm xóa
            >
              <DeleteOutlined style={{ cursor: "pointer", color: "red" }} />
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  // Xử lý chỉnh sửa
  const handleEdit = (record) => {
    setEditingRecord(record); // Đặt record hiện tại để chỉnh sửa
    form.setFieldsValue({
      ...record,
      category: record.category.name,
    });
    setOpen(true); // Mở Modal để chỉnh sửa
  };

  // Xử lý khi lưu hoặc cập nhật
  const handleSaveOrUpdate = async (values) => {
    try {
      console.log(values);

      // Prepare FormData for multipart/form-data request
      const kitData = {
        id: editingRecord ? editingRecord.id : null, // Đảm bảo có ID nếu đang chỉnh sửa
        categoryId: values.categoryId, // categoryId
        name: values.name, // Tên
        brief: values.brief, // Mô tả ngắn
        description: values.description || "", // Optional description
        purchaseCost: values.purchaseCost || 0, // Optional purchaseCost
        status: values.status ? true : false, // Trạng thái
      };

      console.log("Sending data to API:", kitData); // Log FormData before sending

      if (editingRecord) {
        // Nếu đang chỉnh sửa
        await updateKit(editingRecord.id, kitData); // Gọi API cập nhật
      } else {
        // Nếu đang thêm mới
        await createKit(kitData); // Gọi API thêm mới
      }

      setOpen(false); // Đóng modal
      form.resetFields(); // Reset form
      setEditingRecord(null); // Reset trạng thái chỉnh sửa
    } catch (error) {
      console.error("Failed to save or update kit:", error);
    }
  };

  // Xử lý xóa
  const handleDelete = async (id) => {
    try {
      await deleteKit(id); // Gọi API xóa Kit
    } catch (error) {
      console.error("Failed to delete kit:", error);
    }
  };

  return (
    <Form form={form} component={false}>
      {/* Header */}
      <div className="flex justify-between p-4 bg-white shadow-md items-center mb-7">
        <div className="text-2xl font-semibold text-gray-700">
          Manager Panel
        </div>
      </div>

      {/* Table hiển thị danh sách kits */}
      <Table
        bordered
        dataSource={dataSource}
        columns={columns}
        loading={loading} // Hiển thị trạng thái loading
        rowClassName="editable-row"
        rowKey="id"
        pagination={{ pageSize: 20 }} // Giới hạn mỗi trang có 8 bản ghi
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
        title={editingRecord ? "Edit Kit" : "Create New Kit"}
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

          {/* Brief */}
          <Form.Item
            label="Brief"
            name="brief"
            rules={[
              {
                required: true,
                message: "Please input the brief!",
              },
            ]}
          >
            <Input />
          </Form.Item>

          {/* Description */}
          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                required: true,
                message: "Please input the description!",
              },
            ]}
          >
            <Input.TextArea />
          </Form.Item>

          {/* Purchase Cost */}
          <Form.Item
            label="Purchase Cost"
            name="purchaseCost"
            rules={[
              {
                required: true,
                message: "Please input the purchase cost!",
              },
              {
                type: "number",
                min: 0,
                message: "Purchase cost must be a positive number",
              },
            ]}
          >
            <InputNumber min={0} />
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

          {/* Category */}
          <Form.Item
            label="Category"
            name="categoryId"
            rules={[
              {
                required: true,
                message: "Please select a category!",
              },
            ]}
          >
            <Select>
              <Option value={1}>Arduino</Option>
              <Option value={2}>Raspberry Pi</Option>
              <Option value={3}>Micro:bit</Option>
              <Option value={4}>LEGO Education</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Form>
  );
}

export default ManagerContentKits;
