/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  Table,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Button,
  Select,
} from "antd";
import { useState } from "react";

function ManagerContentKits() {
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState([
    {
      key: "1",
      id: "1111111111",
      name: "Mike",
      age: 32,
      address: "10 Downing Street",
      status: "Thành công",
    },
    {
      key: "2",
      id: "1111111112",
      name: "John",
      age: 42,
      address: "11 Downing Street",
      status: "Thất bại",
    },
    {
      key: "3",
      id: "1111111113",
      name: "Jim",
      age: 28,
      address: "12 Downing Street",
      status: "Đang giao",
    },
  ]);
  const [editingKey, setEditingKey] = useState("");

  const successStatus =
    "bg-green-500 w-32 flex justify-center text-white rounded-md";
  const failedStatus =
    "bg-red-600 w-32 flex justify-center text-white rounded-md";
  const deliveryStatus =
    "bg-zinc-500 w-32 flex justify-center text-white rounded-md";

  const getStatusClass = (status) => {
    switch (status) {
      case "Thành công":
        return successStatus;
      case "Thất bại":
        return failedStatus;
      case "Đang giao":
        return deliveryStatus;
      default:
        return "";
    }
  };

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...dataSource];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        newData.splice(index, 1, { ...newData[index], ...row });
        setDataSource(newData);
        setEditingKey("");
      }
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      editable: true,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      editable: true,
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      editable: true,
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      editable: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      editable: true,
      render: (status) => <p className={getStatusClass(status)}>{status}</p>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button
              onClick={() => save(record.key)}
              type="link"
              style={{ marginRight: 8 }}
            >
              Save
            </Button>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <Button type="link">Cancel</Button>
            </Popconfirm>
          </span>
        ) : (
          <div className="flex gap-5 text-xl">
            <EditOutlined
              onClick={() => edit(record)}
              style={{ cursor: "pointer" }}
            />
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa?"
              onConfirm={() => handleDelete(record.key)}
            >
              <DeleteOutlined style={{ cursor: "pointer", color: "red" }} />
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) return col;
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType:
          col.dataIndex === "age"
            ? "number"
            : col.dataIndex === "status"
            ? "select"
            : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={dataSource}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={{
          onChange: cancel,
        }}
      />
    </Form>
  );
}

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  children,
  ...restProps
}) => {
  let inputNode;
  if (inputType === "number") {
    inputNode = <InputNumber />;
  } else if (inputType === "select") {
    inputNode = (
      <Select>
        <Select.Option value="Thành công">Thành công</Select.Option>
        <Select.Option value="Thất bại">Thất bại</Select.Option>
        <Select.Option value="Đang giao">Đang giao</Select.Option>
      </Select>
    );
  } else {
    inputNode = <Input />;
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export default ManagerContentKits;
