import axios from "axios";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
  baseURL: "http://localhost:6001",
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 400) {
      localStorage.clear();
      console.log("UNAUTHORIZED");
      toast.error("Log in to use SB Stocks Application");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
