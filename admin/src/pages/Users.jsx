import React, { useEffect, useState } from 'react'
import axios from 'axios'
import {backendUrl} from '../App'
import { toast } from "react-toastify"

const Users = ({token}) => {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const fetchAllUsers = async () => {
    if (!token) {
      return null
    }
    try {
      const response = await axios.post(backendUrl + '/api/user/list', {}, {headers:{token}})
      if (response.data.success) {
        setUsers(response.data.users)
        setFilteredUsers(response.data.users)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const blockUser = async (userId, isBlocked) => {
    try {
      const response = await axios.post(backendUrl + '/api/user/block', {
        userId, 
        block: !isBlocked
      }, {headers:{token}})
      
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchAllUsers()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const deleteUser = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        const response = await axios.post(backendUrl + '/api/user/delete', {userId}, {headers:{token}})
        if (response.data.success) {
          toast.success(response.data.message)
          await fetchAllUsers()
        } else {
          toast.error(response.data.message)
        }
      } catch (error) {
        console.log(error)
        toast.error(error.response?.data?.message || error.message)
      }
    }
  }

  const getUserOrders = async (userId) => {
    try {
      const response = await axios.post(backendUrl + '/api/user/orders', {userId}, {headers:{token}})
      if (response.data.success) {
        setSelectedUser({
          ...users.find(user => user._id === userId),
          orders: response.data.orders
        })
        setShowDetails(true)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)
    
    if (term === "") {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      )
      setFilteredUsers(filtered)
    }
  }

  useEffect(() => {
    fetchAllUsers()
  }, [token])

  if (showDetails && selectedUser) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setShowDetails(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ← Back to Users
          </button>
          <h2 className="text-xl font-semibold">User Details: {selectedUser.name}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info - nhỏ hơn */}
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">User Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {selectedUser.name}</p>
              <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
              <p><span className="font-medium">Joined:</span> {new Date(selectedUser.date).toLocaleDateString()}</p>
              <p>
                <span className="font-medium">Status:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded text-sm ${
                    selectedUser.blocked
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {selectedUser.blocked ? "Blocked" : "Active"}
                </span>
              </p>
              <p>
                <span className="font-medium">Total Orders:</span>{" "}
                {selectedUser.orders?.length || 0}
              </p>
            </div>
          </div>

          {/* Orders - lớn hơn */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            {selectedUser.orders && selectedUser.orders.length > 0 ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {selectedUser.orders.slice(0, 5).map((order, index) => (
                  <div key={index} className="border p-3 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Order #{order._id?.slice(-6)}</span>
                      <span className="text-sm text-gray-600">
                        {new Date(order.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">Amount: ${order.amount}</p>
                    <p className="text-sm">Status: {order.status}</p>
                    <p className="text-sm">Items: {order.items?.length}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No orders found</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">User Management</h3>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">
            {filteredUsers.length} users found
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-[2fr_3fr_2fr_2fr_2fr] items-center py-3 px-4 border bg-gray-100 text-sm font-semibold rounded-lg">
        <span>Name</span>
        <span>Email</span>
        <span>Join Date</span>
        <span>Status</span>
        <span className="text-center">Actions</span>
      </div>

      {/* Table Body */}
      {filteredUsers.map((user, index) => (
        <div
          key={index}
          className="grid grid-cols-[2fr_3fr_2fr_2fr_2fr] items-center gap-2 py-3 px-4 border text-sm hover:bg-gray-50 rounded-lg transition-colors"
        >
          {/* Name */}
          <span className="text-gray-700 font-medium">{user.name || "—"}</span>

          {/* Email */}
          <span className="text-gray-500 text-xs">{user.email}</span>

          {/* Join Date */}
          <span className="font-semibold text-gray-700">
            {new Date(user.date).toLocaleDateString()}
          </span>

          {/* Status */}
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              user.blocked
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {user.blocked ? "Blocked" : "Active"}
          </span>

          {/* Actions */}
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => getUserOrders(user._id)}
              className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
            >
              View
            </button>
            <button
              onClick={() => blockUser(user._id, user.blocked)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                user.blocked
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-yellow-500 text-white hover:bg-yellow-600"
              }`}
            >
              {user.blocked ? "Unblock" : "Block"}
            </button>
            <button
              onClick={() => deleteUser(user._id)}
              className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm
            ? "No users found matching your search"
            : "No users found"}
        </div>
      )}
    </div>

    </div>
  )
}

export default Users