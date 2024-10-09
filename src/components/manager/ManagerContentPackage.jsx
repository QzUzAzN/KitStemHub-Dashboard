import { useEffect, useState } from "react";
import {
  Table,
  notification,
  Popconfirm,
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Switch,
  Select,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  UndoOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";

function ManagerContentPackage() {
  const [packagesData, setPackagesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null); // Manage the currently editing record
  const [form] = Form.useForm();
  const [isLabModalOpen, setIsLabModalOpen] = useState(false); // Modal for labs
  const [labDetails, setLabDetails] = useState([]); // Store the lab details for a package

  // Fetch data from API
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await api.get("packages");
      if (response.data.status === "success") {
        setPackagesData(response.data.details.data.packages);
      } else {
        notification.error({
          message: "Error",
          description: "Failed to fetch packages data!",
        });
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch packages data!",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Create a new package
  const createPackage = async (newPackage) => {
    try {
      const payload = {
        name: newPackage.name,
        "kit-id": newPackage.kitId,
        "level-id": newPackage.levelId,
        price: newPackage.price,
        status: newPackage.status,
        "lab-ids": newPackage.labIds, // Đây là danh sách các lab IDs
      };

      const response = await api.post("packages", payload);
      console.log(response.data.details.data.package);
      notification.success({
        message: "Success",
        description: "Package created successfully!",
      });
      fetchPackages(); // Refresh the list after adding a new package
    } catch (error) {
      console.error("Error creating package:", error);
      notification.error({
        message: "Error",
        description: "Failed to create package!",
      });
    }
  };

  // Update an existing package
  const updatePackage = async (id, updatedPackage) => {
    try {
      await api.put(`packages/${id}`, updatedPackage);
      notification.success({
        message: "Success",
        description: "Package updated successfully!",
      });
      fetchPackages(); // Refresh the list after updating a package
    } catch (error) {
      console.error("Error updating package:", error);
      notification.error({
        message: "Error",
        description: "Failed to update package!",
      });
    }
  };

  // Delete a package
  const handleDelete = async (id) => {
    try {
      await api.delete(`packages/${id}`);
      notification.success({
        message: "Deleted",
        description: "Package deleted successfully!",
      });
      fetchPackages(); // Fetch the list again after deletion
    } catch (error) {
      console.error("Error deleting package:", error);
      notification.error({
        message: "Error",
        description: "Failed to delete package!",
      });
    }
  };

  // Save or update the package
  const handleSaveOrUpdate = async (values) => {
    try {
      const payload = {
        name: values.name,
        "kit-id": values.kitId,
        "level-id": values.levelId,
        price: values.price,
        status: values.status,
        "lab-ids": values.labIds, // Đảm bảo truyền đúng danh sách lab IDs
      };

      if (editingRecord) {
        // If editing an existing package
        await updatePackage(editingRecord.id, payload);
      } else {
        // If creating a new package
        await createPackage(payload);
      }

      setIsModalOpen(false); // Close modal
      form.resetFields(); // Reset form
      setEditingRecord(null); // Reset editing state
    } catch (error) {
      console.error("Failed to save or update package:", error);
      notification.error({
        message: "Error",
        description: "Failed to save package!",
      });
    }
  };

  // Fetch lab details for a package
  const handleViewLabDetails = async (packageId) => {
    try {
      const response = await api.get(`packages/${packageId}/labs`);
      const labs =
        response?.data?.details?.data?.package?.["package-labs"] || [];

      if (labs.length > 0) {
        setLabDetails(labs); // Set lab details to state
        setIsLabModalOpen(true); // Open the modal
      } else {
        notification.info({
          message: "Info",
          description: "No labs available for this package.",
        });
      }
    } catch (error) {
      console.error("Error fetching lab details:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch lab details!",
      });
    }
  };

  const restorePackage = async (id) => {
    try {
      await api.put(`packages/${id}/restore`);
      notification.success({
        message: "Restored",
        description: "Package restored successfully!",
      });
      fetchPackages(); // Fetch the list again after restoring
    } catch (error) {
      console.error("Error restoring package:", error);
      notification.error({
        message: "Error",
        description: "Failed to restore package!",
      });
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Package Name",
      dataIndex: "name",
      key: "name",
    },
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
    {
      title: "Level",
      dataIndex: ["level", "name"],
      key: "level-name",
    },
    {
      title: "Kit Name",
      dataIndex: ["kit", "name"],
      key: "kit-name",
    },
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
          <EditOutlined
            onClick={() => handleEdit(record)}
            style={{ cursor: "pointer" }}
          />
          {record.status ? (
            <Popconfirm
              title="Are you sure to delete?"
              onConfirm={() => handleDelete(record.id)}
            >
              <DeleteOutlined className="cursor-pointer text-red-500" />
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Do you want to restore this package?"
              onConfirm={() => restorePackage(record.id)}
            >
              <UndoOutlined className="cursor-pointer text-green-500 hover:text-green-700 !opacity-100" />
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  // Edit a package
  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalOpen(true);
    form.setFieldsValue({
      name: record.name,
      price: record.price,
    });
  };

  return (
    <Form form={form} component={false}>
      {/* Header */}
      <div className="flex justify-between p-4 bg-white shadow-md items-center mb-7">
        <div className="text-2xl font-semibold text-gray-700">
          Manage Packages
        </div>
      </div>

      {/* Table to display package list */}
      <Table
        bordered
        dataSource={packagesData}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
        }}
      />

      {/* Add Button */}
      <div className="flex justify-end mt-5">
        <button
          onClick={() => {
            form.resetFields(); // Reset form when adding new package
            setEditingRecord(null); // Clear editing record
            setIsModalOpen(true); // Open modal for adding new
          }}
          className="flex mr-10 gap-3 text-gray-900 hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-10 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
        >
          <div>
            <PlusCircleOutlined />
          </div>
          Add
        </button>
      </div>

      {/* Modal form for adding/editing package */}
      <Modal
        title={editingRecord ? "Edit Package" : "Create New Package"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleSaveOrUpdate} layout="vertical">
          <Form.Item
            name="name"
            label="Package Name"
            rules={[{ required: true, message: "Please input package name!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="kitId"
            label="Kit ID"
            rules={[{ required: true, message: "Please select a kit!" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="levelId"
            label="Level ID"
            rules={[{ required: true, message: "Please select a level!" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: "Please input package price!" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="status" label="Status" valuePropName="checked">
            <Switch
              checkedChildren="Available"
              unCheckedChildren="Unavailable"
            />
          </Form.Item>

          {/* Form chọn các lab để thêm vào package */}
          <Form.Item
            name="labIds"
            label="Select Labs"
            rules={[{ required: true, message: "Please select labs!" }]}
          >
            <Select mode="multiple" placeholder="Select labs">
              {labDetails.map((lab) => (
                <Select.Option key={lab.id} value={lab.id}>
                  {lab.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal to view labs associated with a package */}
      <Modal
        title="Lab Details"
        open={isLabModalOpen}
        onCancel={() => setIsLabModalOpen(false)}
        footer={null}
      >
        {labDetails.length > 0 ? (
          <ul>
            {labDetails.map((lab) => (
              <li key={lab.id}>{lab.name}</li>
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
