import { useState, useEffect } from "react";
import { Form, Avatar, Card, Typography, Spin, Row, Col } from "antd";
import {
  UserOutlined,
  ManOutlined,
  WomanOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../../config/axios";

const { Title, Text } = Typography;

function StaffProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/profile");
        const userData = response.data.details.data["user-profile-dto"];
        setProfileData({
          userName: userData["user-name"],
          firstName: userData["first-name"],
          lastName: userData["last-name"],
          phoneNumber: userData["phone-number"],
          address: userData.address,
          gender: userData.gender,
          birthDate: dayjs(userData["birth-date"]),
        });
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải thông tin cá nhân:", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const getGenderIcon = (gender) => {
    return gender.toLowerCase() === "male" ? (
      <ManOutlined className="text-blue-500" />
    ) : (
      <WomanOutlined className="text-pink-500" />
    );
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 min-h-screen p-8">
      <Card className="max-w-5xl mx-auto shadow-lg">
        <header className="flex justify-between items-center mb-8">
          <div>
            <Title level={2} className="mb-0">
              Hồ Sơ Nhân Viên
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
              <Avatar
                size={64}
                src="/avatar.jpg"
                icon={<UserOutlined />}
                className="mr-4"
              />
            </div>
            <div>
              <Title level={3} className="mb-0">
                {`${profileData.firstName} ${profileData.lastName}`}
              </Title>
              <Text type="secondary">{profileData.userName}</Text>
            </div>
          </div>
        </Card>

        <Row gutter={[24, 16]} className="bg-white p-6 rounded-lg shadow-inner">
          <Col xs={24} sm={12}>
            <Form.Item
              name="firstName"
              className="mb-4"
              label={<span className="text-gray-800 font-bold">Họ</span>}
            >
              <Text strong className="text-normal text-gray-500">
                {profileData.firstName}
              </Text>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="lastName"
              className="mb-4"
              l
              label={<span className="text-gray-800 font-bold">Tên</span>}
            >
              <Text strong className="text-normal text-gray-500">
                {profileData.lastName}
              </Text>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={<span className="text-gray-800 font-bold">Giới Tính</span>}
              name="gender"
              className="mb-4"
            >
              <Text strong className="text-normal text-gray-500">
                {profileData.gender}
              </Text>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={<CalendarOutlined className="text-green-500" />}
              name="birthDate"
              className="mb-4"
            >
              <Text strong className="text-normal text-gray-500">
                {profileData.birthDate.format("DD/MM/YYYY")}
              </Text>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={<PhoneOutlined className="text-indigo-500" />}
              name="phoneNumber"
              className="mb-4"
            >
              <Text strong className="text-normal text-gray-500">
                {profileData.phoneNumber}
              </Text>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={<MailOutlined className="text-red-500" />}
              name="userName"
              className="mb-4"
            >
              <Text strong className="text-normal text-gray-500">
                {profileData.userName}
              </Text>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label={<HomeOutlined className="text-yellow-500" />}
              name="address"
              className="mb-0"
            >
              <Text strong className="text-normal text-gray-500">
                {profileData.address}
              </Text>
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default StaffProfile;
