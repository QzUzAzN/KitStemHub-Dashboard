import { useState, useEffect } from "react";
import { Form, Avatar, Card, Typography, Spin, Row, Col, Input } from "antd";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../../config/axios";

const { Title, Text } = Typography;

function StaffProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Thêm hàm capitalize
  const capitalize = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/profile");
        const userData = response.data.details.data["user-profile-dto"];
        setProfileData({
          userName: userData["user-name"],
          firstName: capitalize(userData["first-name"]),
          lastName: capitalize(userData["last-name"]),
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

  return (
    <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 min-h-screen p-8">
      <Card className="max-w-5xl mx-auto shadow-lg">
        <header className="flex justify-between items-center mb-8">
          <div>
            <Title level={2} className="mb-0">
              Hồ Sơ Nhân Viên
            </Title>
          </div>
        </header>

        <Card className="mb-8 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
          <div className="flex items-center">
            <div className="relative">
              <Avatar
                size={64}
                // src="/avatar.jpg"
                icon={<UserOutlined />}
                className="mr-4"
              />
            </div>
            <div>
              <Title level={3} className="mb-1 text-gray-800">
                {`${profileData.lastName} ${profileData.firstName}`}
              </Title>
              <Text className="text-gray-500 text-base">
                {profileData.userName}
              </Text>
            </div>
          </div>
        </Card>

        <Row gutter={[24, 24]} className="bg-white rounded-lg">
          <Col xs={24} sm={12}>
            <Form.Item
              name="lastName"
              label={
                <span className="sm:text-left lg:text-right text-gray-700 font-medium text-base w-32 inline-block">
                  Họ <span className="sm:hidden lg:inline-block">:</span>
                </span>
              }
              colon={false}
              className="mb-4"
            >
              <Input
                defaultValue={capitalize(profileData.lastName)}
                readOnly
                size="large"
                className="hover:border-blue-400 focus:shadow-sm transition-all w-full capitalize"
                style={{ backgroundColor: "#f8fafc" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="firstName"
              label={
                <span className="sm:text-left lg:text-right text-gray-700 font-medium text-base w-32 inline-block">
                  Tên <span className="sm:hidden lg:inline-block">:</span>
                </span>
              }
              colon={false}
              className="mb-4"
            >
              <Input
                defaultValue={capitalize(profileData.firstName)}
                readOnly
                size="large"
                className="hover:border-blue-400 focus:shadow-sm transition-all w-full capitalize"
                style={{ backgroundColor: "#f8fafc" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span className="sm:text-left lg:text-right text-gray-700 font-medium text-base w-32 inline-block">
                  Giới Tính <span className="sm:hidden lg:inline-block">:</span>
                </span>
              }
              colon={false}
              name="gender"
              className="mb-4"
            >
              <Input
                defaultValue={profileData.gender}
                readOnly
                size="large"
                className="hover:border-blue-400 focus:shadow-sm transition-all w-full"
                style={{ backgroundColor: "#f8fafc" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span className="sm:text-left lg:text-right text-gray-700 font-medium text-base w-32 inline-block">
                  Ngày Sinh <span className="sm:hidden lg:inline-block">:</span>
                </span>
              }
              colon={false}
              name="birthDate"
              className="mb-4"
            >
              <Input
                defaultValue={profileData.birthDate.format("DD/MM/YYYY")}
                readOnly
                size="large"
                className="hover:border-blue-400 focus:shadow-sm transition-all w-full"
                style={{ backgroundColor: "#f8fafc" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span className="sm:text-left lg:text-right text-gray-700 font-medium text-base w-32 inline-block">
                  Số Điện Thoại{" "}
                  <span className="sm:hidden lg:inline-block">:</span>
                </span>
              }
              colon={false}
              name="phoneNumber"
              className="mb-4"
            >
              <Input
                defaultValue={profileData.phoneNumber}
                readOnly
                size="large"
                className="hover:border-blue-400 focus:shadow-sm transition-all w-full"
                style={{ backgroundColor: "#f8fafc" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span className="sm:text-left lg:text-right text-gray-700 font-medium text-base w-32 inline-block">
                  Email <span className="sm:hidden lg:inline-block">:</span>
                </span>
              }
              colon={false}
              name="userName"
              className="mb-4"
            >
              <Input
                defaultValue={profileData.userName}
                readOnly
                size="large"
                className="hover:border-blue-400 focus:shadow-sm transition-all w-full"
                style={{ backgroundColor: "#f8fafc" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              label={
                <span className="sm:text-left md:text-right text-gray-700 font-medium text-base w-32 inline-block">
                  Địa Chỉ <span className="inline-block">:</span>
                </span>
              }
              name="address"
              className="mb-4"
              colon={false}
            >
              <Input
                defaultValue={profileData.address}
                readOnly
                size="large"
                className="hover:border-blue-400 focus:shadow-sm transition-all w-full"
                style={{ backgroundColor: "#f8fafc" }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default StaffProfile;
