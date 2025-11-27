import React, { useContext, useEffect, useRef, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const Profile = () => {
  const { backendUrl, token } = useContext(ShopContext);

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); 
  const fileInputRef = useRef(null);

  const loadProfile = async () => {
    try {
      if (!token) return;
      const response = await axios.get(backendUrl + "/api/user/profile", {
        headers: { token },
      });
      if (response.data.success) {
        setUser(response.data.user);
        setName(response.data.user.name || "");
        setPhone(response.data.user.phone || "");
        setAddress(response.data.user.address || "");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading profile");
    }
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();

    console.log("Sending data:", { name, phone, address });
    
    try {
      const response = await axios.put(
        backendUrl + "/api/user/profile",
        { name, phone, address },
        { headers: { token } }
      );
      
      console.log("Response:", response.data);
      
      if (response.data.success) {
        toast.success("Profile updated successfully");
        setUser(response.data.user);
        console.log("Updated user:", response.data.user);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Error updating profile");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("address", address);

    try {
      const response = await axios.put(
        backendUrl + "/api/user/profile",
        formData,
        { headers: { token, "Content-Type": "multipart/form-data" } }
      );
      if (response.data.success) {
        toast.success("Avatar updated successfully");
        setUser(response.data.user);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error updating avatar");
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (user.authType !== 'google' && !oldPassword) {
        toast.error("Please enter your current password");
        return;
    }
    
    try {
      const response = await axios.put(
        backendUrl + "/api/user/change-password",
        { oldPassword, newPassword },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error changing password");
    }
  };

  useEffect(() => {
    loadProfile();
  }, [token]);

  return (
    <div className="w-[90%] sm:max-w-6xl m-auto mt-14 text-gray-800">

      <div className="flex items-center gap-2 mb-8 justify-center">
        <p className="prata-regular text-3xl">My Profile</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>

      {user ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-1 flex flex-col items-center gap-4 border p-6 rounded-md shadow-sm h-fit">
            <img
              src={user.avatar || "https://via.placeholder.com/150"}
              alt="avatar"
              className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => fileInputRef.current.click()}
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
            />
            <div className="text-center">
              <p className="text-xl font-semibold">{user.name}</p>
              <p className="text-gray-500 text-sm">{user.email}</p>
              {user.phone && <p className="text-gray-500 text-sm">{user.phone}</p>}
              {user.address && <p className="text-gray-400 text-xs mt-1">{user.address}</p>}
            </div>
            <p className="text-xs text-gray-400 text-center">
              Click on avatar to change photo
            </p>
          </div>

          <div className="lg:col-span-2">
            <div className="flex border-b mb-6">
              <button
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "profile"
                    ? "text-black border-b-2 border-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                Update Profile
              </button>
              <button
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "password"
                    ? "text-black border-b-2 border-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("password")}
              >
                Change Password
              </button>
            </div>

            {/* Tab Content */}
            <div className="border p-6 rounded-md shadow-sm">
              {activeTab === "profile" && (
                <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                  <h2 className="text-xl font-semibold mb-2">Update Information</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                      placeholder="Enter your address"
                      rows="3"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                      value={user.email}
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  
                  <button 
                    type="submit"
                    className="bg-black text-white font-medium px-6 py-3 mt-4 rounded-md hover:bg-gray-800 transition-colors"
                  >
                    Save Changes
                  </button>
                </form>
              )}

              {activeTab === "password" && (
              <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                  <h2 className="text-xl font-semibold mb-2">
                      {!user.isPasswordSet ? "Set New Password" : "Change Password"}
                  </h2>
                  
                  {(user.authType !== 'google' || user.isPasswordSet) && (
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                              Current Password *
                          </label>
                          <div className="relative">
                              <input
                                  type={showOldPassword ? "text" : "password"}
                                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                                  placeholder="Enter current password"
                                  value={oldPassword}
                                  onChange={(e) => setOldPassword(e.target.value)}
                                  required
                              />
                              <button
                                  type="button"
                                  className="absolute inset-y-0 right-0 px-3 flex items-center"
                                  onClick={() => setShowOldPassword(!showOldPassword)}
                              >
                                  {showOldPassword ? (
                                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                  </svg>
                                ) : (
                                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                )}
                              </button>
                          </div>
                      </div>
                  )}
                  
                  {user.authType === 'google' && !user.isPasswordSet && (
                      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative text-sm">
                          <p>You are logged in via Google. You can set a password here to login with email next time.</p>
                      </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 px-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent ${
                          confirmPassword && newPassword !== confirmPassword 
                            ? "border-red-300 focus:ring-red-500" 
                            : "border-gray-300"
                        }`}
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 px-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                    {confirmPassword && newPassword === confirmPassword && confirmPassword.length > 0 && (
                      <p className="text-xs text-green-500 mt-1">Passwords match ✓</p>
                    )}
                  </div>
                  
                <button 
                    type="submit"
                    className="bg-black text-white font-medium px-6 py-3 mt-4 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                    disabled={
                        newPassword !== confirmPassword || 
                        !newPassword || 
                        !confirmPassword || 
                        ((user.authType !== 'google' || user.isPasswordSet) && !oldPassword)
                    }
                >
                    {!user.isPasswordSet ? "Create Password" : "Update Password"}
                </button>
                </form>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-lg">Loading profile...</p>
        </div>
      )}
    </div>
  );
};

export default Profile;