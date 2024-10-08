import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
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
  notification,
  Button,
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
  const [imageFiles, setImageFiles] = useState([]); // Mảng để lưu nhiều file ảnh
  const [imagePreviews, setImagePreviews] = useState([]); // Mảng để lưu preview của nhiều ảnh
  const [viewImagesModalVisible, setViewImagesModalVisible] = useState(false); // Modal hiển thị tất cả ảnh
  const [currentImages, setCurrentImages] = useState([]); // Mảng lưu trữ ảnh hiện tại để xem
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [isFirstLoad, setIsFirstLoad] = useState(true); // Biến trạng thái để theo dõi lần tải đầu tiên

  const fetchKits = async (
    page = 1,
    pageSize = 20,
    showNotification = true
  ) => {
    try {
      const response = await api.get("kits", {
        params: {
          page: page - 1,
          pageSize: pageSize,
        },
      });

      const kitsData = response.data.details.data.kits;
      const totalPages = response.data.details.data["total-pages"];
      const currentPage = response.data.details.data["current-page"];
      setDataSource(kitsData);
      setLoading(false);

      // Cập nhật phân trang
      setPagination({
        total: totalPages * pageSize, // Tổng số mục dữ liệu dựa trên tổng số trang và số mục mỗi trang
        current: currentPage, // Trang hiện tại
        pageSize: pageSize, // Số mục trên mỗi trang
      });
      // Chỉ hiển thị thông báo nếu có yêu cầu
      if (showNotification) {
        notification.destroy(); // Xóa tất cả thông báo hiện tại
        notification.success({
          message: "Thành công",
          description: "Lấy danh sách kits thành công!",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error fetching kits:", error);
      setLoading(false);
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi lấy danh sách kits!",
        duration: 3,
      });
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
      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append("images", file);
        });
      }

      const response = await api.post("kits", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Created Kit:", response.data);

      // Tính toán tổng số sản phẩm sau khi tạo mới
      const totalItems = pagination.total + 1;
      const totalPages = Math.ceil(totalItems / pagination.pageSize);

      // Kiểm tra xem sản phẩm mới có nằm trên trang hiện tại hay không
      let newPage = pagination.current;
      if (newPage < totalPages) {
        newPage = totalPages; // Điều hướng tới trang cuối nếu sản phẩm mới được tạo vượt quá số trang hiện tại
      }

      // Fetch lại dữ liệu với trang mới
      fetchKits(newPage, pagination.pageSize);
      setPagination((prev) => ({
        ...prev,
        total: totalItems, // Cập nhật tổng số mục dữ liệu sau khi thêm mới
      }));

      fetchCategories(); // Làm mới danh sách categories nếu cần
      form.resetFields();
      notification.success({
        message: "Thành công",
        description: "Kit đã được tạo thành công!",
      });
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi tạo kit!",
      });
      console.error(
        "Error creating kit:",
        error.response?.data?.details?.errors || error.message
      );
    }
  };

  const updateKit = async (id, updatedKit) => {
    try {
      const formData = new FormData();
      formData.append("Id", id);
      formData.append("CategoryId", updatedKit.categoryId);
      formData.append("Name", updatedKit.name);
      formData.append("Brief", updatedKit.brief);
      formData.append("Description", updatedKit.description || "");
      formData.append("PurchaseCost", updatedKit.purchaseCost || 0);
      formData.append("Status", updatedKit.status ? "true" : "false");

      // Nếu có ảnh mới thì thêm ảnh mới vào formData
      if (updatedKit.imageFiles && updatedKit.imageFiles.length > 0) {
        updatedKit.imageFiles.forEach((file) => {
          formData.append("images", file);
        });
      } else if (updatedKit.existingImages) {
        // Nếu không có ảnh mới, giữ lại ảnh cũ
        updatedKit.existingImages.forEach((image) => {
          formData.append("existingImages[]", image.url);
        });
      }

      const response = await api.put(`kits`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Updated Kit:", response.data);
      await fetchKits();
      fetchCategories();
      notification.success({
        message: "Thành công",
        description: "Kit đã được cập nhật thành công!",
      });
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật kit!",
      });
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

      await fetchKits(); // Làm mới danh sách kits sau khi xóa
      fetchCategories(); // Làm mới danh sách categories
      notification.success({
        message: "Thành công",
        description: "Kit đã được xóa thành công!",
      });
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi xóa kit!",
      });
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
      await fetchKits();
      notification.success({
        message: "Thành công",
        description: "Kit đã được khôi phục thành công!",
      });
    } catch (error) {
      if (error.response) {
        notification.error({
          message: "Lỗi",
          description: `Có lỗi xảy ra khi khôi phục kit với id ${id}!`,
        });
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

  const showImagesModal = (images) => {
    setCurrentImages(images); // Gán các ảnh vào state để hiển thị trong modal
    setViewImagesModalVisible(true); // Hiển thị modal
  };

  useEffect(() => {
    // Kiểm tra xem có phải lần tải đầu tiên hay không
    if (isFirstLoad) {
      fetchKits(1, 20, true); // Hiển thị thông báo lần đầu tải dữ liệu
      setIsFirstLoad(false); // Đánh dấu lần tải đầu tiên đã hoàn thành
    } else {
      fetchKits(1, 20, false); // Không hiển thị thông báo trong các lần sau
    }

    fetchCategories();
  }, [isFirstLoad]);

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
      dataIndex: "kit-images",
      key: "image",
      render: (images) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => showImagesModal(images)}
          disabled={!images || images.length === 0}
        >
          View Images
        </Button>
      ),
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
              <DeleteOutlined className="cursor-pointer text-red-500" />
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Bạn có muốn khôi phục kit này?"
              onConfirm={() => {
                console.log("Attempting to restore:", record.id); // Kiểm tra id
                restoreKit(record.id);
              }}
            >
              <UndoOutlined className="cursor-pointer text-green-500" />
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

    if (record["kit-images"] && record["kit-images"].length > 0) {
      setImagePreviews(record["kit-images"].map((img) => img.url)); // Hiển thị ảnh cũ
    }

    // Thiết lập giá trị cho form, sử dụng category-id thay vì kit-category.id
    form.setFieldsValue({
      ...record,
      categoryId: record["category-id"], // Sử dụng category-id thay vì kit-category
      purchaseCost: record["purchase-cost"] || 0,
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

      // Nếu có ảnh mới thì cập nhật ảnh mới, nếu không giữ nguyên ảnh cũ
      if (imageFiles.length > 0) {
        kitData.imageFiles = imageFiles; // Sử dụng ảnh mới nếu có
      } else if (editingRecord && editingRecord["kit-images"]) {
        kitData.existingImages = editingRecord["kit-images"]; // Giữ nguyên ảnh cũ nếu không có ảnh mới
      }

      if (editingRecord) {
        await updateKit(editingRecord.id, kitData);
      } else {
        await createKit(kitData);
      }

      setOpen(false);
      form.resetFields();
      setEditingRecord(null);
      setImageFiles([]); // Reset file đã chọn sau khi submit
      setImagePreviews([]);
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
        pagination={{
          total: pagination.total, // Tổng số sản phẩm
          current: pagination.current, // Trang hiện tại
          pageSize: pagination.pageSize, // Số sản phẩm mỗi trang
          onChange: (page) => fetchKits(page),
        }}
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

      {/* Modal hiển thị danh sách ảnh */}
      <Modal
        title="Uploaded Images"
        visible={viewImagesModalVisible}
        onCancel={() => setViewImagesModalVisible(false)}
        footer={null}
      >
        <div className="grid grid-cols-3 gap-4">
          {currentImages.map((image, index) => (
            <img
              key={index}
              src={image.url}
              alt={`Kit Image ${index + 1}`}
              className="w-full h-auto"
            />
          ))}
        </div>
      </Modal>

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

          <Form.Item label="Upload Images" name="images">
            <Input
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files); // Chuyển thành mảng để xử lý nhiều file
                setImageFiles(files); // Lưu tất cả các file vào state
                const filePreviews = files.map((file) => {
                  const reader = new FileReader();
                  return new Promise((resolve) => {
                    reader.onload = (event) => resolve(event.target.result);
                    reader.readAsDataURL(file);
                  });
                });

                // Chờ tất cả các ảnh được load
                Promise.all(filePreviews).then((previews) => {
                  setImagePreviews(previews); // Cập nhật state để hiển thị preview của tất cả ảnh
                });
              }}
            />
            {/* Hiển thị preview của tất cả ảnh đã chọn */}
            <div className="grid grid-cols-3 gap-4 mt-2">
              {imagePreviews.map((preview, index) => (
                <img
                  key={index}
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  style={{ width: "100px", height: "auto", marginTop: "10px" }}
                />
              ))}
            </div>

            {/* Hiển thị ảnh cũ nếu có và không có ảnh mới được chọn */}
            {!imageFiles.length &&
              editingRecord &&
              editingRecord["kit-images"] &&
              editingRecord["kit-images"].length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {editingRecord["kit-images"].map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={`Existing Image ${index + 1}`}
                      style={{
                        width: "100px",
                        height: "auto",
                        marginTop: "10px",
                      }}
                    />
                  ))}
                </div>
              )}
          </Form.Item>
        </Form>
      </Modal>
    </Form>
  );
}

export default ManagerContentKits;
