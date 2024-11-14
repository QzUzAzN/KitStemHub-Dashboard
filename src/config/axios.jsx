import axios from "axios";
import { toast } from "react-toastify";
// const baseUrl = "http://54.66.193.22:5001/api/";
const baseUrl = "https://54.66.193.22:5000/api/";

const api = axios.create({
  baseURL: baseUrl,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("tokenDashboard")?.replaceAll('"', "");
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

    //Cờ _retry để đảm bảo rằng không thực hiện lại việc gọi API quá nhiều lần nếu lỗi 401
    if (error.response.status === 401 && !originalRequest._retry) {
      if (error.response?.data?.details?.errors?.["invalid-credentials"]) {
        localStorage.removeItem("tokenDashboard");
        localStorage.removeItem("refreshTokenDashboard");
      }
      originalRequest._retry = true;
      try {
        const currentRefreshToken = localStorage.getItem(
          "refreshTokenDashboard"
        );
        const response = await api.post(
          `${baseUrl}users/refreshtoken/${currentRefreshToken}`
        );
        const accessToken = response.data.details["access-token"];
        const refreshToken = response.data.details["refresh-token"];
        localStorage.setItem("tokenDashboard", accessToken);
        localStorage.setItem("refreshTokenDashboard", refreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
