import React, { useState, useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const { backendUrl, navigate } = useContext(ShopContext);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(`${backendUrl}/api/user/forgot-password`, { email });
      if (res.data.success) {
        toast.success("A temporary password has been sent to your email!");
        localStorage.setItem("resetEmail", email); 
        setTimeout(() => navigate("/reset-password"), 1500);
      } else {
        toast.error(res.data.message || "Something went wrong");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">Forgot Password</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      <input
        type="email"
        placeholder="Enter your email address"
        className="w-full px-3 py-2 border border-gray-800"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isLoading}
      />

      <button
        type="submit"
        className="bg-black text-white font-light px-8 py-2 mt-4 hover:bg-gray-800 disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Send Reset Email"}
      </button>

      <p
        onClick={() => navigate("/login")}
        className="text-sm cursor-pointer hover:text-gray-600 mt-2"
      >
        Back to Login
      </p>
    </form>
  );
};

export default ForgotPassword;
