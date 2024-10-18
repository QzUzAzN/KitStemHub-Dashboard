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
  Switch,
  Spin,
} from "antd";
import { useEffect, useState } from "react";
import api from "../../config/axios";
import { Option } from "antd/es/mentions";
import Search from "antd/es/input/Search";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchPackageTerm, setSearchPackageTerm] = useState("");
  const [searchKitTerm, setSearchKitTerm] = useState("");
  const [filteredDataSource, setFilteredDataSource] = useState([]);
  const [labDetails, setLabDetails] = useState([]);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false); // Modal to view lab
  const [availableLabs, setAvailableLabs] = useState([]); // State to store related Labs

  const fetchPackages = async (
    page = 1,
    pageSize = 20,
    showNotification = true
  ) => {
    try {
      setLoading(true);
      const response = await api.get("packages", {
        params: {
          page: page - 1, // Backend might count from 0
          pageSize: pageSize,
        },
      });

      if (
        response.data &&
        response.data.details &&
        response.data.details.data
      ) {
        const packageData = response.data.details.data.packages;
        const totalPages = response.data.details.data["total-pages"] || 0;

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
      if (showNotification) {
        notification.destroy();
        notification.success({
          message: "Thành công",
          description: "Lấy danh sách package thành công",
          duration: 3,
        });
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      setLoading(false);
      notification.error({
        message: "Lỗi",
        description: "Đã xảy ra lỗi khi lấy danh sách package!",
      });
    }
  };

  const fetchKitsAndLevels = async () => {
    try {
      const [kitsResponse, levelsResponse] = await Promise.all([
        api.get("kits"),
        api.get("levels"),
      ]);
      setKits(kitsResponse.data.details.data.kits);
      setLevels(levelsResponse.data.details.data.levels);
    } catch (error) {
      console.error("Error fetching kits or levels:", error);
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
        notification.success({
          message: "Success",
          description: "Package created successfully!",
          duration: 3,
        });

        // Refetch all packages on the current page after creating a new one
        fetchPackages(pagination.current, pagination.pageSize);
      } else {
        throw new Error("Không tạo được gói, vui lòng thử lại.");
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

      // Sử dụng URL mà không có ID, và bao gồm ID trong phần thân của request
      await api.put(`packages`, { ...updatedPackage, id });

      // Refetch all packages on the current page after updating
      fetchPackages(pagination.current, pagination.pageSize);

      notification.success({
        message: "Thành công",
        description: "Gói được cập nhật thành công!",
        duration: 3,
      });
    } catch (error) {
      console.error("Error updating package:", error.response || error.message);
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
      setIsSubmitting(true); // Start loading

      console.log(`Attempting to hide package with id: ${id}`);

      // Call the DELETE API to hide the package
      const response = await api.delete(`packages/${id}`, {
        headers: {
          Accept: "*/*",
        },
      });

      console.log("Package deleted (hidden):", response.data);

      // Update UI to make the package hidden
      setDataSource((prevData) =>
        prevData.map((pkg) => (pkg.id === id ? { ...pkg, status: false } : pkg))
      );

      notification.success({
        message: "Thành công",
        description: "Gói ẩn thành công!",
        duration: 3,
      });
    } catch (error) {
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
      setIsSubmitting(false); // End loading
    }
  };

  const restorePackage = async (id) => {
    try {
      setIsSubmitting(true); // Start loading

      console.log(`Attempting to restore package with id: ${id}`);

      // Call the PUT API to restore the package
      const response = await api.put(`packages/restore/${id}`, null, {
        headers: {
          Accept: "*/*",
        },
      });

      console.log("Package restored:", response.data);

      // Update UI to make the package visible again
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
      setIsSubmitting(false); // End loading
    }
  };

  const handleKitChange = async (kitId) => {
    form.setFieldsValue({ labIds: [] }); // Reset labs when a new kit is selected
    try {
      const response = await api.get(`kits/${kitId}/lab`);
      const labs = response.data.details.data.labs || [];
      setAvailableLabs(labs); // Update state with the related Labs list
    } catch (error) {
      console.error("Error fetching labs:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch labs related to the selected kit!",
      });
    }
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

    // Thêm kit và lab chỉ khi tạo mới
    if (!editingRecord) {
      payload["kit-id"] = values.kitId;
      payload["lab-ids"] = values.labIds;
    }

    if (editingRecord) {
      await updatePackage(editingRecord.id, payload);
    } else {
      await createPackage(payload); // Call `createPackage`
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

  useEffect(() => {
    const filteredData = dataSource.filter((pkg) => {
      const matchesPackage = pkg.name
        .toLowerCase()
        .includes(searchPackageTerm.toLowerCase());
      const matchesKit = pkg.kit?.name
        .toLowerCase()
        .includes(searchKitTerm.toLowerCase());
      return matchesPackage && matchesKit;
    });
    setFilteredDataSource(filteredData);
  }, [searchPackageTerm, searchKitTerm, dataSource]);

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Package Name", dataIndex: "name", key: "name" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `${price.toLocaleString()} VND`,
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
    { title: "Level", dataIndex: ["level", "name"], key: "level-name" },
    { title: "Kit Name", dataIndex: ["kit", "name"], key: "kit-name" },
    {
      title: "Labs",
      key: "labs",
      render: (_, record) => (
        <Button
          onClick={() => handleViewLabDetails(record.id)}
          icon={<EyeOutlined />}
        >
          View Labs
        </Button>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-5 text-xl">
          <EditOutlined onClick={() => handleEdit(record)} />
          {record.status ? (
            <Popconfirm
              title="Are you sure to hide this package?"
              onConfirm={() => deletePackage(record.id)} // Call deletePackage
            >
              <DeleteOutlined className="cursor-pointer text-red-500" />
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Do you want to restore this package?"
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
      <div className="flex justify-between p-4 bg-white shadow-md items-center mb-7">
        <div className="text-2xl font-semibold text-gray-700">
          Manage Kit Package
        </div>
        <div className="flex gap-4">
          <Input
            placeholder="Search package name"
            value={searchPackageTerm}
            onChange={(e) => setSearchPackageTerm(e.target.value)}
          />
          <Input
            placeholder="Search Kit name"
            value={searchKitTerm}
            onChange={(e) => setSearchKitTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex mt-5 ml-5">
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
        dataSource={filteredDataSource}
        columns={columns}
        loading={loading}
        rowKey="id"
        rowClassName={(record) =>
          record.status ? "" : "bg-gray-200 opacity-50"
        } // Change color when package is hidden
        pagination={{
          total: pagination.total,
          current: pagination.current,
          pageSize: pagination.pageSize,
          onChange: (page, pageSize) => {
            fetchPackages(page, pageSize); // Refetch packages with new page
          },
        }}
      />

      <Modal
        title={editingRecord ? "Edit Package" : "Create New Package"}
        open={isOpen}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Spin spinning={isSubmitting}>
          <Form form={form} onFinish={handleSaveOrUpdate} layout="vertical">
            <Form.Item
              name="name"
              label="Package Name"
              rules={[
                { required: true, message: "Please enter package name!" },
              ]}
            >
              <Input />
            </Form.Item>

            {/* Hiển thị Kit và Labs khi tạo mới (khi không có editingRecord) */}
            {!editingRecord && (
              <>
                <Form.Item
                  name="kitId"
                  label="Select Kit"
                  rules={[{ required: true, message: "Please select a Kit!" }]}
                >
                  <Select onChange={handleKitChange} placeholder="Select Kit">
                    {kits.map((kit) => (
                      <Option key={kit.id} value={kit.id}>
                        {kit.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="labIds"
                  label="Select Labs"
                  rules={[{ required: true, message: "Please select labs!" }]}
                >
                  <Select mode="multiple" placeholder="Select Labs">
                    {availableLabs.map((lab) => (
                      <Select.Option key={lab.id} value={lab.id}>
                        {lab.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </>
            )}

            <Form.Item
              name="levelId"
              label="Select Level"
              rules={[{ required: true, message: "Please select a level!" }]}
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
              name="price"
              label="Price"
              rules={[{ required: true, message: "Please enter a price!" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="status" label="Status" valuePropName="checked">
              <Switch
                checkedChildren="Available"
                unCheckedChildren="Unavailable"
              />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      {/* Modal for lab details */}
      <Modal
        title="Lab Details"
        open={isLabModalOpen}
        onCancel={() => setIsLabModalOpen(false)}
        footer={null}
      >
        {labDetails.length > 0 ? (
          <ul>
            {labDetails.map((lab) => (
              <li key={lab.id}>
                <strong>{lab.name}</strong> - Price: {lab.price} VND, Author:{" "}
                {lab.author}
              </li>
            ))}
          </ul>
        ) : (
          <p>No labs available</p>
        )}
      </Modal>
    </Form>
  );
}

export default ManagerContentPackage;
