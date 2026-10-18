import React, { createContext, useState } from "react";
import axiosInstance from "../components/axiosInstance";
import { useNavigate } from "react-router-dom";

export const GeneralContext = createContext();

export const GeneralContextProvider = ({ children }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usertype, setUsertype] = useState("");

  const inputs = { username, email, usertype, password };

  const navigate = useNavigate();

  const login = async () => {
    try {
      const loginInputs = { email, password };
      console.log("Login inputs:", loginInputs);

      const res = await axiosInstance.post("/login", loginInputs);

      localStorage.setItem("userId", res.data._id);
      localStorage.setItem("userType", res.data.usertype);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("email", res.data.email);
      localStorage.setItem("balance", res.data.balance);

      if (res.data.usertype === "customer") {
        navigate("/home");
      } else if (res.data.usertype === "admin") {
        navigate("/admin");
      }
    } catch (err) {
      console.error("Login failed:", err);
      alert("Login failed. Please check credentials.");
    }
  };

  const register = async () => {
    try {
      const res = await axiosInstance.post("/register", inputs);

      localStorage.setItem("userId", res.data._id);
      localStorage.setItem("userType", res.data.usertype);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("email", res.data.email);
      localStorage.setItem("balance", res.data.balance);

      if (res.data.usertype === "customer") {
        navigate("/home");
      } else if (res.data.usertype === "admin") {
        navigate("/admin");
      }
    } catch (err) {
      console.error("Registration failed:", err.response?.data || err.message);
      alert("Registration failed");
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/logout");
      localStorage.clear();
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
      localStorage.clear();
      navigate("/");
    }
  };

  return (
    <GeneralContext.Provider
      value={{
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
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};

export default GeneralContextProvider;
