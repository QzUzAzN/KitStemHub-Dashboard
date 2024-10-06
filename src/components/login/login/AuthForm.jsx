import { Button, Form, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

import api from "../../../config/axios";
import styles from "./AuthForm.module.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS
import { jwtDecode } from "jwt-decode";

function LoginInput() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleOnFinish = async (values) => {
    try {
      const response = await api.post("Users/Login", values);
      // const { accessToken, refreshToken } = response.data.details;
      // localStorage.setItem("token", accessToken);
      // localStorage.setItem("refreshToken", refreshToken);
      const { accessToken } = response.data.details;

      const decoded = jwtDecode(accessToken);
      const role =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      if (role === "customer") {
        toast.error("Customers are not allowed to access this area!", {
          position: "top-center",
          autoClose: 3000,
        });
        return; // Ngăn chặn đăng nhập và điều hướng
      }

      login(accessToken);

      toast.success("User logged in Successfully!", {
        position: "top-center",
        autoClose: 1500,
      });

      // Điều hướng dựa trên vai trò
      setTimeout(() => {
        switch (role) {
          case "admin":
            navigate("/admin");
            break;
          case "manager":
            navigate("/manager");
            break;
          default:
            navigate("/");
            break;
        }
      }, 1500);
    } catch (err) {
      toast.error("Login failed. Please check your credentials.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formsContainer}>
        <div className={styles.signinSignup}>
          <Form
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            style={{ maxWidth: 600 }}
            className={styles.signInForm}
            initialValues={{ remember: true }}
            onFinish={handleOnFinish}
            autoComplete="true"
          >
            <h2 className={styles.title}>Sign in</h2>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                },
              ]}
            >
              <Input
                placeholder="Email"
                prefix={<i className="fas fa-user"></i>}
              />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
            >
              <Input.Password
                placeholder="Password"
                prefix={<i className="fas fa-lock"></i>}
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className={`${styles.btn} ${styles.solid}`}
            >
              Login
            </Button>
          </Form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default LoginInput;
