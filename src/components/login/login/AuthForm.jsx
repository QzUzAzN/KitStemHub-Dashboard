import { Button, Form, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../config/axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

function LoginInput() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleOnFinish = async (values) => {
    try {
      const response = await api.post("users/login", values);

      if (response.data && response.data.details) {
        const accessToken = response.data.details["access-token"];
        const refreshToken = response.data.details["refresh-token"];

        if (!accessToken) {
          throw new Error("Access token is missing from the response");
        }

        localStorage.setItem("tokenDashboard", accessToken);
        localStorage.setItem("refreshTokenDashboard", refreshToken);

        const decoded = jwtDecode(accessToken);
        const role =
          decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];

        if (role === "customer") {
          toast.error("Khách hàng không được phép truy cập khu vực này!");
          return;
        }

        login(accessToken);
        toast.success("Đăng nhập thành công!");

        // Điều hướng dựa trên vai trò
        setTimeout(() => {
          switch (role) {
            case "admin":
              navigate("/admin");
              break;
            case "manager":
              navigate("/manager");
              break;
            case "staff":
              navigate("/staff");
              break;
            default:
              navigate("/");
              break;
          }
        }, 1500);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      // console.log("Error message:", error.message);
      if (error.response.status !== 401)
        toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau!");

      if (error.response?.data) {
        const errorDetails = error.response.data.details;

        if (errorDetails?.errors?.["invalid-credentials"]) {
          toast.error(errorDetails.errors["invalid-credentials"]);
        } else if (errorDetails.errors["unavailable-username"]) {
          toast.error(errorDetails.errors["unavailable-username"]);
        } else {
          toast.error("Đăng nhập thất bại. Vui lòng thử lại.");
        }
      } else if (error.request) {
        // Xử lý lỗi network
        toast.error(
          "Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng."
        );
      } else {
        // Xử lý các lỗi khác
        toast.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    }

    // setIsSubmitting(false);
  };

  const onFinishFailed = () => {
    toast.error("Vui lòng điền đầy đủ các trường bắt buộc!");
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url('/Ustm.gif')` }}
    >
      {/* Overlay để làm mờ ảnh nền */}
      <div className="absolute inset-0 bg-black opacity-10 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-white bg-opacity-30 backdrop-blur-sm rounded-lg shadow-lg">
        <h2 className="text-3xl font-extrabold text-center text-white">
          Hello, Welcome!
        </h2>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={handleOnFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập email!",
              },
              {
                type: "email",
                message: "Vui lòng nhập địa chỉ email hợp lệ!",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Email"
              className="rounded-md"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Mật khẩu"
              className="rounded-md"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default LoginInput;
