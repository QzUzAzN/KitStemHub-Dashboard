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
  Switch,
} from "antd";
import { useEffect, useState } from "react";
import api from "../../config/axios";
import { Option } from "antd/es/mentions";
// import Search from "antd/es/input/Search";

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
  const [viewComponentsModalVisible, setViewComponentsModalVisible] =
    useState(false); // Modal hiển thị thành phần
  const [componentsData, setComponentsData] = useState([]); // State để lưu các thành phần của kit hiện tại
  const [isFetchingComponents, setIsFetchingComponents] = useState(false); // Trạng thái loading khi fetch component
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  // const [isFirstLoad, setIsFirstLoad] = useState(true); // Biến trạng thái để theo dõi lần tải đầu tiên
  const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái loading cho create và update
  const [filters, setFilters] = useState({
    kitName: "",
    categoryName: "",
    fromPrice: null,
    toPrice: null,
  });

  // Hàm fetch dữ liệu từ API
  const fetchKits = async (
    page = 1,
    pageSize = 20,
    showNotification = true,
    searchFilters = filters
  ) => {
    try {
      // Chuẩn bị các tham số tìm kiếm theo điều kiện của fromPrice và toPrice
      const params = {
        page: page - 1,
        pageSize: pageSize,
        "kit-name": searchFilters.kitName || filters.kitName,
        "category-name": searchFilters.categoryName || filters.categoryName,
      };

      const response = await api.get("kits", {
        params,
      });

      if (
        response.data &&
        response.data.details &&
        response.data.details.data &&
        response.data.details.data.kits
      ) {
        const kitsData = response.data.details.data.kits;
        const totalPages = response.data.details.data["total-pages"] || 0;
        const currentPage = response.data.details.data["current-page"] || 1;

        setDataSource(kitsData);
        setPagination({
          total: totalPages * pageSize,
          current: currentPage,
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
      // Append the status as a boolean, assuming the backend expects true/false
      formData.append("Status", newKit.status ? true : false);
      // Thêm ComponentId và ComponentQuantity
      newKit.components.forEach((component, index) => {
        formData.append(`ComponentId[${index}]`, component.componentId);
        formData.append(`ComponentQuantity[${index}]`, component.quantity); // Add quantity here
      });

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
      // Thêm ComponentId và ComponentQuantity
      updatedKit.components.forEach((component, index) => {
        formData.append(`ComponentId[${index}]`, component.componentId);
        formData.append(`ComponentQuantity[${index}]`, component.quantity); // Add quantity here
      });

      // Thêm trường Status (giả sử API cần)
      formData.append("Status", updatedKit.status ? true : false);
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
      notification.destroy();
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
      const response = await api.put(`kits/restore/${id}`, null, {
        headers: {
          Accept: "*/*",
        },
      });
      console.log("Kit restored:", response.data);
      await fetchKits();
      notification.destroy();
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
            error.response.data.details?.message || "Lỗi không xác định"
          }`,
        });
      } else {
        console.error(`Error restoring kit with id ${id}:`, error.message);
        notification.error({
          message: "Lỗi",
          description: `Có lỗi xảy ra khi khôi phục kit với id ${id}: ${error.message}`,
        });
      }
    }
  };

  const showImagesModal = (images) => {
    setCurrentImages(images); // Gán các ảnh vào state để hiển thị trong modal
    setViewImagesModalVisible(true); // Hiển thị modal
  };

  // Hàm xử lý khi submit filter (khi người dùng nhấn Search)
  const handleFilterSubmit = (values) => {
    const updatedFilters = {
      ...filters,
      ...values, // Chỉ update những trường mà người dùng đã điền
    };
    setFilters(updatedFilters); // Cập nhật filters với các giá trị mới
    fetchKits(1, pagination.pageSize, false, updatedFilters); // Gọi API với filter đã cập nhật
  };

  // Hàm reset bộ lọc (Reset tất cả input và fetch lại tất cả dữ liệu)
  const resetFilters = () => {
    form.resetFields(); // Reset các input
    setFilters({
      kitName: "",
      categoryName: "",
    });
    fetchKits(1, pagination.pageSize); // Fetch lại mà không có filter
  };

  // Hàm để gọi API và hiển thị components trong modal
  const handleViewComponents = async (kitId) => {
    setIsFetchingComponents(true);
    try {
      const response = await api.get(`kits/${kitId}`);

      if (
        response.data &&
        response.data.details &&
        response.data.details.data.kit &&
        response.data.details.data.kit.components
      ) {
        setComponentsData(response.data.details.data.kit.components); // Lưu các thành phần của kit vào state
      } else {
        setComponentsData([]); // Không có thành phần
      }

      setViewComponentsModalVisible(true); // Mở modal
      setIsFetchingComponents(false); // Dừng loading
    } catch (error) {
      console.error("Error fetching components:", error);
      setIsFetchingComponents(false); // Dừng loading nếu có lỗi
      notification.error({
        message: "Lỗi",
        description: "Có lỗi xảy ra khi lấy danh sách thành phần!",
        duration: 3,
      });
    }
  };

  const fetchComponents = async () => {
    try {
      const response = await api.get("/components"); // Đường dẫn tới API lấy components
      if (
        response.data &&
        response.data.details &&
        response.data.details.data
      ) {
        setComponentsData(response.data.details.data["component-models"]); // Đổ dữ liệu vào componentsData
      }
    } catch (error) {
      console.error("Lỗi khi lấy thành phần:", error);
    }
  };

  useEffect(() => {
    fetchKits(); // Lần đầu tải trang
    fetchCategories(); // Lấy danh mục
    fetchComponents();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 50,
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
      width: 300,
    },
    {
      title: "Tóm tắt",
      dataIndex: "brief",
      key: "brief",
      width: 450,
    },
    {
      title: "Mô tả", // Thêm cột Description
      dataIndex: "description",
      key: "description",
      width: 500, // Đặt chiều rộng cho cột
      render: (description) => (
        <span>{description ? description : "No description available"}</span>
      ),
    },
    {
      title: "Thành phần", // Thêm cột Thành phần
      key: "components",
      render: (record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleViewComponents(record.id)}
        >
          View Components
        </Button>
      ),
    },
    {
      title: "Ảnh",
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
      title: "Giá",
      dataIndex: "purchase-cost",
      key: "purchaseCost",
      render: (cost) => <span>{cost ? cost.toLocaleString() : "0"} VND</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span style={{ color: status ? "green" : "red" }}>
          {status ? "Available" : "Unavailable"}
        </span>
      ),
    },
    {
      title: "Thể Loại",
      dataIndex: ["kits-category", "name"],
      key: "kits-category",
      render: (categoryName) => <span>{categoryName}</span>,
    },
    {
      title: "Hành động",
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

  const handleEdit = async (record) => {
    try {
      if (!record || !record["category-id"]) {
        console.error("Invalid record or missing category-id:", record);
        return; // Prevent further action if the record is invalid
      }

      setEditingRecord(record);

      // Fetch kit details, including components
      const response = await api.get(`/kits/${record.id}`);
      const kitData = response.data.details.data.kit;
      console.log("Kit data: ", kitData);
      // Map the existing components to set them in the form
      const components = kitData.components.map((component) => ({
        componentId: component["component-id"], // Mapping correct field names
        quantity: component["component-quantity"], // Mapping correct field names
      }));

      // If there are current images, show the old images
      if (kitData["kit-images"] && kitData["kit-images"].length > 0) {
        setImagePreviews(kitData["kit-images"].map((img) => img.url)); // Show old images
      }

      // Set form values including components and other fields
      form.setFieldsValue({
        name: kitData.name,
        brief: kitData.brief,
        description: kitData.description || "",
        components: components, // Set existing components
        purchaseCost: kitData["purchase-cost"] || 0,
        categoryId: kitData["category-id"], // Use category-id
        status: kitData.status,
      });

      setOpen(true); // Open the form modal
    } catch (error) {
      console.error("Failed to fetch kit details:", error);
      notification.error({
        message: "Error",
        description: "Failed to load the kit details.",
      });
    }
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
        components: values.components || [],
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
      <div className="flex justify-between p-4 bg-white shadow-md items-center mb-3">
        <div className="text-3xl font-semibold text-gray-700">Quản lý Kit</div>

        {/* Search Input */}
        <div className="flex items-center">
          <Form layout="inline" onFinish={handleFilterSubmit}>
            <Form.Item name="kitName">
              <Input placeholder="Tên Kit" />
            </Form.Item>
            <Form.Item name="categoryName">
              <Input placeholder="Tên loại Kit" />
            </Form.Item>
            <Button type="primary" htmlType="submit">
              Tìm Kiếm
            </Button>
            <Button onClick={resetFilters}>Đặt Lại</Button>
          </Form>
        </div>
      </div>

      <div className="flex justify-end ml-5">
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
          total: pagination.total,
          current: pagination.current,
          pageSize: pagination.pageSize,
          onChange: (page) => fetchKits(page, pagination.pageSize), // Gọi lại API khi chuyển trang, giữ filter
          showSizeChanger: false, // Bỏ dropdown chọn số bản ghi mỗi trang
        }}
      />

      {/* Modal hiển thị danh sách thành phần */}
      <Modal
        title="Danh sách thành phần"
        visible={viewComponentsModalVisible}
        onCancel={() => setViewComponentsModalVisible(false)}
        footer={null}
      >
        <Spin spinning={isFetchingComponents}>
          <Table
            dataSource={componentsData}
            columns={[
              {
                title: "ID Thành phần",
                dataIndex: "component-id",
                key: "component-id",
              },
              {
                title: "Tên Thành phần",
                dataIndex: "component-name",
                key: "component-name",
              },
              {
                title: "Số lượng",
                dataIndex: "component-quantity",
                key: "component-quantity",
              },
            ]}
            rowKey="component-id"
            pagination={false}
          />
        </Spin>
      </Modal>

      {/* Modal hiển thị danh sách ảnh */}
      <Modal
        title="Ảnh đã tải lên"
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
        title={editingRecord ? "Chỉnh sửa Kit" : "Tạo mới Kit"}
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
              label="Tên"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Tóm tắt"
              name="brief"
              rules={[{ required: true, message: "Vui lòng nhập tóm tắt!" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Mô tả"
              name="description"
              rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>

            {/* Form List để chọn component và số lượng */}
            <Form.List name="components">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, fieldKey, ...restField }) => (
                    <div key={key} style={{ display: "flex", gap: "10px" }}>
                      <Form.Item
                        {...restField}
                        name={[name, "componentId"]}
                        fieldKey={[fieldKey, "componentId"]}
                        label="Chọn thành phần"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn thành phần!",
                          },
                        ]}
                        style={{ flex: 1 }}
                      >
                        <Select placeholder="Chọn thành phần">
                          {componentsData.map((component) => (
                            <Select.Option
                              key={component.id}
                              value={component.id}
                            >
                              {component.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, "quantity"]}
                        fieldKey={[fieldKey, "quantity"]}
                        label="Số lượng"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập số lượng!",
                          },
                        ]}
                        style={{ flex: 1 }}
                      >
                        <InputNumber
                          min={1}
                          placeholder="Số lượng"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>

                      <Button onClick={() => remove(name)} type="danger">
                        Xóa
                      </Button>
                    </div>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusCircleOutlined />}
                    >
                      Thêm thành phần
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            <Form.Item
              label="Giá"
              name="purchaseCost"
              rules={[
                { required: true, message: "Vui lòng nhập giá!" },
                {
                  type: "number",
                  min: 0,
                  message: "Giá phải lớn hơn 0",
                },
              ]}
            >
              <InputNumber min={0} />
            </Form.Item>

            <Form.Item label="Thể loại" name="categoryId">
              <Select>
                {categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Tải ảnh lên" name="images">
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

            {/* Thêm trường Trạng thái */}
            <Form.Item
              name="status"
              label="Trạng thái"
              valuePropName="checked"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
            >
              <Switch
                checkedChildren="Available"
                unCheckedChildren="Unavailable"
              />
            </Form.Item>
          </Form>
        </Spin>{" "}
        {/* Kết thúc Spin */}
      </Modal>
    </Form>
  );
}

export default ManagerContentKits;
