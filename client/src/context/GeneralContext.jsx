import React, { useState, useEffect } from "react";
import axiosInstance from "../components/axiosInstance";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import demoStore from "../utils/demoStore";
import { GeneralContext } from "./GeneralContextCore";

export { GeneralContext };

export const GeneralContextProvider = ({ children }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usertype, setUsertype] = useState("customer");
  const [balance, setBalance] = useState(() => Number(localStorage.getItem("balance") || 0));
  const [showAuthModal, setShowAuthModal] = useState(false);

  const updateBalance = (newBalance) => {
    const num = Number(newBalance);
    setBalance(num);
    localStorage.setItem("balance", num);
    window.dispatchEvent(new CustomEvent("balanceUpdated", { detail: num }));
  };

  useEffect(() => {
    const handleBalanceEvent = (e) => {
      if (e.detail !== undefined) {
        setBalance(Number(e.detail));
      } else {
        setBalance(Number(localStorage.getItem("balance") || 0));
      }
    };
    const handleStorageEvent = (e) => {
      if (e.key === "balance") {
        setBalance(Number(e.newValue || 0));
      }
    };

    window.addEventListener("balanceUpdated", handleBalanceEvent);
    window.addEventListener("storage", handleStorageEvent);
    return () => {
      window.removeEventListener("balanceUpdated", handleBalanceEvent);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

  const inputs = {
    username,
    Username: username,
    email,
    usertype: usertype || "customer",
    UserType: usertype === "admin" ? "Admin" : "User",
    password,
  };
  const navigate = useNavigate();

  const loginDemo = (role = "customer") => {
    const user = demoStore.initDemo(role);
    updateBalance(user.balance);
    if (role === "admin") {
      toast.success(`Welcome back, ${user.username}!`);
      navigate("/admin");
    } else {
      toast.success(
        `Welcome (${user.username})! Starting balance: ₹${Number(user.balance).toLocaleString('en-IN')}`
      );
      navigate("/home");
    }
  };

  const resetDemoData = () => {
    const user = demoStore.resetDemo();
    updateBalance(user.balance);
    toast.success("Demo account reset to initial values.");
    window.location.reload();
  };

  const login = async () => {
    try {
      const loginInputs = { email, password };
      console.log("Login inputs:", loginInputs);

      const res = await axiosInstance.post("/login", loginInputs);
      const userData = res.data.user || res.data;
      const normalizedUserType = (userData.usertype || userData.UserType || "customer").toLowerCase();
      const normalizedUsername = userData.username || userData.Username || (normalizedUserType === "admin" ? "Administrator" : "Trader");
      const normalizedBalance = Number(userData.balance ?? userData.cashBalance ?? 25000);

      localStorage.removeItem("isDemoMode");
      localStorage.setItem("userId", userData._id);
      localStorage.setItem("userType", normalizedUserType === "admin" ? "admin" : "customer");
      localStorage.setItem("username", normalizedUsername);
      localStorage.setItem("email", userData.email);
      updateBalance(normalizedBalance);
      if (res.data.token) {
        localStorage.setItem("tradex_token", res.data.token);
      }

      toast.success(`Welcome back, ${normalizedUsername}!`);

      if (normalizedUserType === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error("Login failed:", err);
      // Fallback if demo user and server is offline
      if (email.trim().toLowerCase() === "demo@tradex.com" && (!err.response || err.code === "ERR_NETWORK")) {
        toast("Backend unreachable, switching to offline demo mode...", { icon: "⚡" });
        loginDemo("customer");
        return;
      }
      toast.error(err.response?.data?.message || "Login failed. Please check credentials or backend server.");
    }
  };

  const register = async () => {
    try {
      const res = await axiosInstance.post("/register", inputs);
      const userData = res.data.user || res.data;
      const normalizedUserType = (userData.usertype || userData.UserType || "customer").toLowerCase();
      const normalizedUsername = userData.username || userData.Username || username || "Trader";
      const normalizedBalance = Number(userData.balance ?? userData.cashBalance ?? 500);

      localStorage.removeItem("isDemoMode");
      localStorage.setItem("userId", userData._id || "user_" + Date.now());
      localStorage.setItem("userType", normalizedUserType === "admin" ? "admin" : "customer");
      localStorage.setItem("username", normalizedUsername);
      localStorage.setItem("email", userData.email || email);
      updateBalance(normalizedBalance);
      if (res.data.token) {
        localStorage.setItem("tradex_token", res.data.token);
      }

      toast.success(`Account registered successfully! Welcome ${normalizedUsername}`);

      if (normalizedUserType === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error("Registration failed:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Registration failed. Verify server connection.");
    }
  };

  const logout = async () => {
    try {
      if (!demoStore.isDemoActive()) {
        await axiosInstance.post("/logout");
      }
      setBalance(0);
      localStorage.clear();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      setBalance(0);
      localStorage.clear();
      navigate("/");
    }
  };

  return (
    <GeneralContext.Provider
      value={{
        balance,
        updateBalance,
        username,
        setUsername,
        email,
        setEmail,
        password,
        setPassword,
        usertype,
        setUsertype,
        login,
        register,
        logout,
        loginDemo,
        resetDemoData,
        showAuthModal,
        setShowAuthModal,
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};

export default GeneralContextProvider;

