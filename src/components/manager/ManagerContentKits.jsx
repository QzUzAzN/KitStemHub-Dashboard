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
  notification,
  Button,
  Spin,
} from "antd";
import { useEffect, useState } from "react";
import api from "../../config/axios";
import { Option } from "antd/es/mentions";
import Search from "antd/es/input/Search";

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
  const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái loading cho create và update
  const [searchTerm, setSearchTerm] = useState(""); // Thêm trạng thái tìm kiếm
  const [filteredDataSource, setFilteredDataSource] = useState([]); // Thêm trạng thái cho dữ liệu lọc
  const fetchKits = async (
    page = 1,
    pageSize = 20,
    showNotification = true,
    search = ""
  ) => {
    try {
      const response = await api.get("kits", {
        params: {
          page: page - 1,
          pageSize: pageSize,
          search: search,
        },
      });

      // Ghi log toàn bộ phản hồi từ API để kiểm tra
      console.log("API Response:", response.data);

      // Kiểm tra xem phản hồi có tồn tại các trường cần thiết
      if (
        response.data &&
        response.data.details &&
        response.data.details.data &&
        response.data.details.data.kits
      ) {
        const kitsData = response.data.details.data.kits;
        const totalPages = response.data.details.data["total-pages"] || 0;
        const currentPage = response.data.details.data["current-page"] || 1;

        // Ghi log dữ liệu nhận được
        console.log("Kits data:", kitsData);

        // Cập nhật dữ liệu vào state
        setDataSource(kitsData);
        setFilteredDataSource(kitsData); // Cập nhật dữ liệu lọc
        setPagination({
          total: totalPages * pageSize,
          current: currentPage,
          pageSize: pageSize,
        });
      } else {
        // Nếu không có dữ liệu mong đợi
        setDataSource([]);
        setFilteredDataSource([]); // Cập nhật dữ liệu lọc
        setPagination({
          total: 0,
          current: 1,
          pageSize: pageSize,
        });
        console.error("No kits data found in response:", response.data);
      }

      setLoading(false);

      if (showNotification) {
        notification.destroy();
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
      setIsSubmitting(true); // Bắt đầu loading
      const formData = new FormData();
      formData.append("CategoryId", newKit.categoryId);
      formData.append("Name", newKit.name);
      formData.append("Brief", newKit.brief);
      formData.append("Description", newKit.description || ""); // Thêm Description
      formData.append("PurchaseCost", newKit.purchaseCost || 0);

      // Thêm file ảnh vào FormData
      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append("KitImagesList", file); // Sử dụng KitImagesList để thêm ảnh
        });
      }

      const response = await api.post("kits", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Created Kit:", response.data);

      // Gọi lại fetchKits để làm mới danh sách sau khi thêm mới
      await fetchKits(pagination.current, pagination.pageSize);

      form.resetFields();
      setImageFiles([]);
      setImagePreviews([]);

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
    } finally {
      setIsSubmitting(false); // Kết thúc loading
    }
  };

  const updateKit = async (id, updatedKit) => {
    try {
      setIsSubmitting(true); // Bắt đầu loading
      const formData = new FormData();
      formData.append("Id", id);
      formData.append("CategoryId", updatedKit.categoryId);
      formData.append("Name", updatedKit.name);
      formData.append("Brief", updatedKit.brief);
      formData.append("Description", updatedKit.description || ""); // Thêm Description
      formData.append("PurchaseCost", updatedKit.purchaseCost || 0);

      // Nếu có ảnh mới thì thêm ảnh mới vào formData
      if (updatedKit.imageFiles && updatedKit.imageFiles.length > 0) {
        updatedKit.imageFiles.forEach((file) => {
          formData.append("KitImagesList", file);
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
    } finally {
      setIsSubmitting(false); // Kết thúc loading
    }
  };

  const deleteKit = async (id) => {
    try {
      setIsSubmitting(true); // Bắt đầu loading
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
    } finally {
      setIsSubmitting(false); // Kết thúc loading
    }
  };

  const restoreKit = async (id) => {
    try {
      setIsSubmitting(true); // Bắt đầu loading
      const response = await api.put(`kits/restore/${id}`, null, {
        headers: {
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
        console.error(
          `Error restoring kit with id ${id}:`,
          error.response.data
        );
        notification.error({
          message: "Lỗi",
          description: `Có lỗi xảy ra khi khôi phục kit với id ${id}: ${
            error.response.data.details?.message || "Unknown error"
          }`,
        });
      } else {
        console.error(`Error restoring kit with id ${id}:`, error.message);
        notification.error({
          message: "Lỗi",
          description: `Có lỗi xảy ra khi khôi phục kit với id ${id}: ${error.message}`,
        });
      }
    } finally {
      setIsSubmitting(false); // Kết thúc loading
    }
  };

  const showImagesModal = (images) => {
    setCurrentImages(images); // Gán các ảnh vào state để hiển thị trong modal
    setViewImagesModalVisible(true); // Hiển thị modal
  };

  // Hàm lọc dữ liệu trực tiếp trên client
  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (value.trim() === "") {
      setFilteredDataSource(dataSource); // Hiển thị lại toàn bộ dữ liệu nếu không có từ khóa
    } else {
      const filteredData = dataSource.filter(
        (kit) => kit.name.toLowerCase().includes(value) // Lọc các kit có tên chứa từ khóa
      );
      setFilteredDataSource(filteredData); // Cập nhật danh sách lọc
    }
  };

  useEffect(() => {
    if (isFirstLoad) {
      fetchKits(); // Tải dữ liệu lần đầu
      setIsFirstLoad(false); // Đánh dấu rằng đã tải lần đầu
    }
    fetchCategories(); // Tải dữ liệu categories
  }, [isFirstLoad]); // Không cần phải phụ thuộc vào searchTerm

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
      title: "Description", // Thêm cột Description
      dataIndex: "description",
      key: "description",
      width: 500, // Đặt chiều rộng cho cột
      render: (description) => (
        <span>{description ? description : "No description available"}</span>
      ),
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
            className="cursor-pointer"
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
              <UndoOutlined className="restore-button cursor-pointer text-green-400" />
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

    // Nếu có ảnh hiện tại, hiển thị ảnh cũ
    if (record["kit-images"] && record["kit-images"].length > 0) {
      setImagePreviews(record["kit-images"].map((img) => img.url)); // Hiển thị ảnh cũ
    }

    // Thiết lập giá trị cho form, sử dụng category-id thay vì kit-category.id
    form.setFieldsValue({
      ...record,
      categoryId: record["category-id"], // Sử dụng category-id thay vì kit-category
      purchaseCost: record["purchase-cost"] || 0,
    });

    setOpen(true); // Mở modal form
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

        {/* Search Input */}
        <div className="flex items-center">
          <Search
            placeholder="Search Kits"
            onChange={handleSearchChange} // Xử lý khi thay đổi tìm kiếm
            enterButton
            className="search-product"
          />
        </div>
      </div>

      <Table
        bordered
        dataSource={filteredDataSource}
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
        <Spin spinning={isSubmitting}>
          {/* Thêm Spin vào modal */}
          <Form
            form={form}
            labelCol={{ span: 24 }}
            onFinish={handleSaveOrUpdate}
          >
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
              <Input.TextArea rows={3} />
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

            <Form.Item label="Category" name="categoryId">
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
                  const files = Array.from(e.target.files);
                  setImageFiles(files);
                  const filePreviews = files.map((file) => {
                    const reader = new FileReader();
                    return new Promise((resolve) => {
                      reader.onload = (event) => resolve(event.target.result);
                      reader.readAsDataURL(file);
                    });
                  });

                  Promise.all(filePreviews).then((previews) => {
                    setImagePreviews(previews);
                  });
                }}
              />
              <div className="grid grid-cols-3 gap-4 mt-2">
                {imagePreviews.map((preview, index) => (
                  <img
                    key={index}
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    style={{
                      width: "100px",
                      height: "auto",
                      marginTop: "10px",
                    }}
                  />
                ))}
              </div>
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
        </Spin>{" "}
        {/* Kết thúc Spin */}
      </Modal>
    </Form>
  );
}

export default ManagerContentKits;
