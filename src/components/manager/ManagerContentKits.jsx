import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
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
  Switch,
} from "antd";
import { useEffect, useState } from "react";
import api from "../../config/axios";
import { Option } from "antd/es/mentions";

function ManagerContentKits() {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isOpen, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState(null);
  const [imageFile, setImageFile] = useState(null); // State để lưu file ảnh
  const [imagePreview, setImagePreview] = useState(null); // State lưu bản xem trước của hình ảnh

  const fetchKits = async () => {
    try {
      const response = await api.get("kits");
      setDataSource(response.data.details.data.kits);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching kits:", error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("categories");
      setCategories(response.data.details.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const createKit = async (newKit) => {
    try {
      const formData = new FormData();
      formData.append("CategoryId", newKit.categoryId);
      formData.append("Name", newKit.name);
      formData.append("Brief", newKit.brief);
      formData.append("Description", newKit.description || "");
      formData.append("PurchaseCost", newKit.purchaseCost || 0);
      formData.append("Status", newKit.status ? "true" : "false");

      // Kiểm tra và thêm file ảnh vào FormData
      if (imageFile) {
        console.log("Adding image file to FormData:", imageFile);
        formData.append("images", imageFile);
      }

      const response = await api.post("kits", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Created Kit:", response.data);
      fetchKits();
      fetchCategories();
    } catch (error) {
      console.error(
        "Error creating kit:",
        error.response?.data?.details?.errors || error.message
      );
    }
  };

  const updateKit = async (id, updatedKit) => {
    try {
      const formData = new FormData();
      formData.append("Id", id); // Đảm bảo gửi trường Id
      formData.append("CategoryId", updatedKit.categoryId);
      formData.append("Name", updatedKit.name);
      formData.append("Brief", updatedKit.brief);
      formData.append("Description", updatedKit.description || "");
      formData.append("PurchaseCost", updatedKit.purchaseCost || 0);
      formData.append("Status", updatedKit.status ? "true" : "false");

      // Kiểm tra và thêm file ảnh từ form
      if (imageFile) {
        const imagesArray = [imageFile]; // Đảm bảo rằng "images" là mảng
        imagesArray.forEach((image) => {
          formData.append("images", image);
        });
      }

      const response = await api.put(`kits`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Updated Kit:", response.data);
      fetchKits();
      fetchCategories();
    } catch (error) {
      console.error(
        `Error updating kit with id ${id}:`,
        error.response?.data || error.message
      );
    }
  };

  const deleteKit = async (id) => {
    try {
      if (!id) {
        console.error("ID không hợp lệ khi xóa kit:", id);
        return;
      }

      console.log(`Attempting to delete kit with id: ${id}`);

      // Sử dụng phương thức DELETE như bạn yêu cầu
      const response = await api.delete(`kits/${id}`, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "*/*",
        },
        data: {
          id: id,
        },
      });
      console.log("Kit deleted:", response.data);

      fetchKits(); // Làm mới danh sách kits sau khi xóa
      fetchCategories(); // Làm mới danh sách categories
    } catch (error) {
      console.error(
        `Error deleting kit with id ${id}:`,
        error.response?.data || error.message
      );
    }
  };

  const restoreKit = async (id) => {
    try {
      // Gọi API để lấy thông tin kit trước khi khôi phục
      const kitResponse = await api.get(`kits/${id}`);
      console.log(`Kit status before restore: ${kitResponse.data.status}`);

      if (kitResponse.data.status === "true") {
        console.log(
          `Kit với id: ${id} hiện đang Available, không cần khôi phục.`
        );
        return;
      }

      console.log(`Attempting to restore kit with id: ${id}`);

      // Sử dụng FormData để truyền ID như yêu cầu
      const formData = new FormData();
      formData.append("id", id);

      const response = await api.put(`kits/restore/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Đảm bảo đúng Content-Type
          Accept: "*/*",
        },
      });

      console.log("Kit restored:", response.data);
      fetchKits();
    } catch (error) {
      if (error.response) {
        console.error(
          `Error restoring kit with id ${id}:`,
          error.response.data || error.message
        );
        console.log("Full error response:", error.response);
      } else {
        console.error(`Error restoring kit với id ${id}:`, error.message);
      }
    }
  };

  useEffect(() => {
    fetchKits();
    fetchCategories();
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
      title: "Image",
      dataIndex: "kit-images", // Nếu URL ảnh được trả về trong `kit-images`
      key: "image",
      render: (images) => {
        // Kiểm tra nếu có ảnh thì hiển thị, nếu không thì hiển thị một thông báo khác
        if (images && images.length > 0) {
          return (
            <img
              src={images[0].url}
              alt="Kit Image"
              style={{ width: "100px", height: "auto" }}
            />
          );
        } else {
          return <span>No Image</span>;
        }
      },
    },
    {
      title: "Purchase Cost",
      dataIndex: "purchase-cost",
      key: "purchaseCost",
      render: (cost) => <span>{cost ? cost.toLocaleString() : "0"} VND</span>,
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
      dataIndex: ["kits-category", "name"],
      key: "kits-category",
      render: (categoryName) => <span>{categoryName}</span>,
    },
    {
      title: "Action",
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
              onConfirm={() => {
                console.log("Attempting to delete:", record.id); // Kiểm tra id
                deleteKit(record.id);
              }}
            >
              <DeleteOutlined style={{ cursor: "pointer", color: "red" }} />
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Bạn có muốn khôi phục kit này?"
              onConfirm={() => {
                console.log("Attempting to restore:", record.id); // Kiểm tra id
                restoreKit(record.id);
              }}
            >
              <UndoOutlined style={{ cursor: "pointer", color: "green" }} />
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  const handleEdit = (record) => {
    if (!record || !record["category-id"]) {
      console.error("Invalid record or missing category-id:", record);
      return; // Ngăn chặn tiếp tục nếu record không hợp lệ
    }

    setEditingRecord(record);

    // Thiết lập giá trị cho form, sử dụng category-id thay vì kit-category.id
    form.setFieldsValue({
      ...record,
      categoryId: record["category-id"], // Sử dụng category-id thay vì kit-category
    });

    setOpen(true);
  };

  const handleSaveOrUpdate = async (values) => {
    try {
      const kitData = {
        id: editingRecord ? editingRecord.id : null,
        categoryId: values.categoryId,
        name: values.name,
        brief: values.brief,
        description: values.description || "",
        purchaseCost: values.purchaseCost || 0,
        status: values.status ? true : false,
      };

      if (editingRecord) {
        await updateKit(editingRecord.id, kitData);
      } else {
        await createKit(kitData);
      }

      setOpen(false);
      form.resetFields();
      setEditingRecord(null);
      setImageFile(null); // Reset file đã chọn sau khi submit
    } catch (error) {
      console.error("Failed to save or update kit:", error);
    }
  };

  return (
    <Form form={form} component={false}>
      <div className="flex justify-between p-4 bg-white shadow-md items-center mb-7">
        <div className="text-2xl font-semibold text-gray-700">
          Manager Panel
        </div>
      </div>

      <Table
        bordered
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        rowClassName={(record) =>
          record.status ? "" : "bg-gray-200 opacity-50 cursor-not-allowed"
        }
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />

      <div className="flex justify-end mt-5">
        <button
          onClick={() => {
            form.resetFields();
            setEditingRecord(null);
            setOpen(true);
          }}
          className="flex mr-10 gap-3 text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-10 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
        >
          <div>
            <PlusCircleOutlined />
          </div>
          Thêm
        </button>
      </div>

      <Modal
        title={editingRecord ? "Edit Kit" : "Create New Kit"}
        open={isOpen}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} labelCol={{ span: 24 }} onFinish={handleSaveOrUpdate}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please input the name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Brief"
            name="brief"
            rules={[{ required: true, message: "Please input the brief!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please input the description!" },
            ]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            label="Purchase Cost"
            name="purchaseCost"
            rules={[
              { required: true, message: "Please input the purchase cost!" },
              {
                type: "number",
                min: 0,
                message: "Cost must be a positive number",
              },
            ]}
          >
            <InputNumber min={0} />
          </Form.Item>

          <Form.Item label="Status" name="status" valuePropName="checked">
            <Switch
              checkedChildren="Available"
              unCheckedChildren="Unavailable"
            />
          </Form.Item>

          <Form.Item
            label="Category"
            name="categoryId"
            rules={[{ required: true, message: "Please select a category!" }]}
          >
            <Select>
              {categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Upload Image" name="image">
            <Input
              type="file"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  setImageFile(files[0]); // Lưu file vào state
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setImagePreview(event.target.result); // Lưu URL của ảnh để hiển thị
                  };
                  reader.readAsDataURL(files[0]); // Đọc file dưới dạng URL
                } else {
                  setImageFile(null);
                  setImagePreview(null); // Xóa bản xem trước nếu không có ảnh
                  console.log("No file selected");
                }
              }}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Image Preview"
                style={{ width: "100px", height: "auto", marginTop: "10px" }}
              />
            )}
          </Form.Item>
        </Form>
      </Modal>
    </Form>
  );
}

export default ManagerContentKits;
