import axios from "axios";
import { toast } from "react-toastify";
// const baseUrl = "http://54.66.193.22:5001/api/";
const baseUrl = "https://54.66.193.22:5000/api/";

const api = axios.create({
  baseURL: baseUrl,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")?.replaceAll('"', "");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // console.log(originalRequest);
    // console.log("hello" + error.config);
    // console.log("Error Config:", error.config);
    // console.log("Error Response Status:", error.response.status);
    // console.log("Error Message:", error.message);
    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    //Cờ _retry để đảm bảo rằng không thực hiện lại việc gọi API quá nhiều lần nếu lỗi 401
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const currentRefreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post(
          `${baseUrl}Users/RefreshToken/${currentRefreshToken}`
        );
        const { accessToken, refreshToken } = response.data.details;
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        //axios chịu trách nhiệm cho việc bắt 401 ở login
        toast.error("Invalid email or password. Please try again.");
        // console.error("Error refreshing token:", refreshError);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        // window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
