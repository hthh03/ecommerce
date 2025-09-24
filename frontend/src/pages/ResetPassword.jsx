import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({
    tempPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const backendUrl = "http://localhost:4000"; // đổi theo server

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    const email = localStorage.getItem("resetEmail");
    if (!email) {
      toast.error("No email found. Please try forgot password again.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/api/user/reset-password`, {
        email,
        tempPassword: passwords.tempPassword,
        newPassword: passwords.newPassword,
      });

      if (res.data.success) {
        toast.success("Password updated successfully!");
        localStorage.removeItem("resetEmail");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error(res.data.message);
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
        <p className="prata-regular text-3xl">Reset Password</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      <input
        type="password"
        name="tempPassword"
        placeholder="Enter temporary password"
        className="w-full px-3 py-2 border border-gray-800"
        value={passwords.tempPassword}
        onChange={handleChange}
        required
        disabled={isLoading}
      />

      <div className="relative w-full">
        <input
          type={showPassword ? "text" : "password"}
          name="newPassword"
          placeholder="Enter new password"
          className="w-full px-3 py-2 pr-10 border border-gray-800"
          value={passwords.newPassword}
          onChange={handleChange}
          required
          disabled={isLoading}
          minLength="6"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
        >
          {showPassword ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      </div>

      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm new password"
        className="w-full px-3 py-2 border border-gray-800"
        value={passwords.confirmPassword}
        onChange={handleChange}
        required
        disabled={isLoading}
      />

      <button
        type="submit"
        className="bg-black text-white font-light px-8 py-2 mt-4 hover:bg-gray-800 disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? "Resetting..." : "Reset Password"}
      </button>

      <p
        onClick={() => navigate("/forgot-password")}
        className="text-sm cursor-pointer hover:text-gray-600 mt-2"
      >
        Back to Forgot Password
      </p>
    </form>
  );
};

export default ResetPassword;
