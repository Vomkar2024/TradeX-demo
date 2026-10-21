import axios from "axios";
import toast from "react-hot-toast";
import demoStore from "../utils/demoStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Demo mode interceptor
axiosInstance.interceptors.request.use(async (config) => {
  if (demoStore.isDemoActive()) {
    config.adapter = async (cfg) => {
      const url = cfg.url || "";
      const method = (cfg.method || "get").toLowerCase();
      let data = cfg.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          data = {};
        }
      } else {
        data = data || {};
      }

      try {
        if (url.includes("/fetch-stocks")) {
          return { data: demoStore.getStocks(), status: 200, statusText: "OK", headers: {}, config: cfg };
        }
        if (url.includes("/buyStock") && method === "post") {
          const res = demoStore.buyStock(data);
          return { data: res, status: 201, statusText: "Created", headers: {}, config: cfg };
        }
        if (url.includes("/sellStock") && method === "post") {
          const res = demoStore.sellStock(data);
          return { data: res, status: 201, statusText: "Created", headers: {}, config: cfg };
        }
        if (url.includes("/fetch-orders")) {
          return { data: demoStore.getOrders(), status: 200, statusText: "OK", headers: {}, config: cfg };
        }
        if (url.includes("/fetch-transactions")) {
          return { data: demoStore.getTransactions(), status: 200, statusText: "OK", headers: {}, config: cfg };
        }
        if (url.includes("/newTransaction") && method === "post") {
          const res = demoStore.newTransaction(data);
          return { data: res, status: 201, statusText: "Created", headers: {}, config: cfg };
        }
        if (url.includes("/fetch-user/")) {
          const userId = url.split("/fetch-user/")[1];
          return { data: demoStore.getUser(userId), status: 200, statusText: "OK", headers: {}, config: cfg };
        }
        if (url.includes("/fetch-users")) {
          return { data: demoStore.getAllUsers(), status: 200, statusText: "OK", headers: {}, config: cfg };
        }
        if (url.includes("/logout")) {
          return { data: { message: "Logged out" }, status: 200, statusText: "OK", headers: {}, config: cfg };
        }

        return { data: {}, status: 200, statusText: "OK", headers: {}, config: cfg };
      } catch (err) {
        return Promise.reject({
          response: {
            data: { message: err.message },
            status: 400,
            statusText: "Bad Request",
            headers: {},
            config: cfg,
          },
        });
      }
    };
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!demoStore.isDemoActive() && error.response && error.response.status === 401) {
      localStorage.clear();
      console.log("UNAUTHORIZED");
      toast.error("Session expired. Please log in again.");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

