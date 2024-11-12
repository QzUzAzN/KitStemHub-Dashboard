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
      style={{
        backgroundImage: `url(/loginbg.png)`,
      }}
    >
      <div className="absolute inset-0 backdrop-blur-[3px]"></div>

      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-white/60 backdrop-blur-md rounded-xl shadow-2xl border border-white/20">
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-3xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            STEM Kit Management
          </h2>
          <p className="text-blue-600 text-center text-sm font-medium">
            Hệ thống quản lý bộ kit STEM
          </p>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={handleOnFinish}
          onFinishFailed={onFinishFailed}
          layout="vertical"
          size="large"
          className="space-y-4"
          validateTrigger="onSubmit" // chỉ validate khi submit
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
              prefix={<UserOutlined className="text-gray-600" />}
              placeholder="Email đăng nhập"
              className="rounded-lg bg-white/90 text-gray-700 placeholder-gray-500"
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
              prefix={<LockOutlined className="text-gray-600" />}
              placeholder="Mật khẩu"
              className="rounded-lg !bg-white/90 text-gray-700 placeholder-gray-500"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full !bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-700 hover:to-purple-700 rounded-lg border-0 transition duration-300 ease-in-out transform hover:scale-105 h-12 text-base font-semibold text-white"
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        {/* Footer text */}
        <div className="text-center text-blue-600 text-sm font-medium">
          <p>Hệ thống quản lý và theo dõi bộ kit STEM</p>
          <p className="mt-1 text-blue-600">© 2024 KitStemHub</p>
        </div>
      </div>
    </div>
  );
}

export default LoginInput;
