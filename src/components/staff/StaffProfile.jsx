import {
  Form,
  Input,
  Select,
  Avatar,
  Card,
  Typography,
  DatePicker,
} from "antd";
import dayjs from "dayjs"; // Import dayjs

const { Title, Text } = Typography;

function StaffProfile() {
  // Giả định dữ liệu profile được lấy từ API hoặc state
  const profileData = {
    firstName: "Alexa",
    lastName: "Rawles",
    gender: "Female",
    birthDate: dayjs("1990-01-01"), // Convert to dayjs object
    address: "123 Main St, City, Country",
    email: "alexarawles@gmail.com",
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 min-h-screen p-8">
      <Card className="max-w-5xl mx-auto shadow-lg">
        <header className="flex justify-between items-center mb-8">
          <div>
            <Title level={2} className="mb-0">
              Staff Profile
            </Title>
            <Text type="secondary">
              {new Date().toLocaleString("vi-VN", {
                weekday: "short",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </div>
        </header>

        <Card className="mb-8 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
          <div className="flex items-center">
            <div className="relative">
              <Avatar size={64} src="/avatar.jpg" className="mr-4" />
            </div>
            <div>
              <Title level={3} className="mb-0">
                {`${profileData.firstName} ${profileData.lastName}`}
              </Title>
              <Text type="secondary">{profileData.email}</Text>
            </div>
          </div>
        </Card>

        <Form
          layout="vertical"
          className="bg-white p-6 rounded-lg shadow"
          initialValues={profileData}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item label="First Name" name="firstName">
              <Input readOnly />
            </Form.Item>
            <Form.Item label="Last Name" name="lastName">
              <Input readOnly />
            </Form.Item>
            <Form.Item label="Gender" name="gender">
              <Select disabled>
                <Select.Option value="male">Male</Select.Option>
                <Select.Option value="female">Female</Select.Option>
                <Select.Option value="other">Other</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Birth Date" name="birthDate">
              <DatePicker className="w-full" disabled format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item label="Address" name="address" className="col-span-2">
              <Input.TextArea rows={3} readOnly />
            </Form.Item>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default StaffProfile;
