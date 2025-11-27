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
    if (window.confirm('Are you sure you want to delete this user?')) {
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
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <button 
            onClick={() => setShowDetails(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 self-start"
          >
            ← Back to Users
          </button>
          <h2 className="text-xl sm:text-2xl font-semibold">User Details: {selectedUser.name}</h2>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          <div className="xl:col-span-1 bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">User Information</h3>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium min-w-0 sm:min-w-[80px]">Name:</span> 
                <span className="text-gray-700 break-words">{selectedUser.name}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium min-w-0 sm:min-w-[80px]">Email:</span> 
                <span className="text-gray-700 break-all">{selectedUser.email}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium min-w-0 sm:min-w-[80px]">Joined:</span> 
                <span className="text-gray-700">{new Date(selectedUser.date).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium min-w-0 sm:min-w-[80px]">Status:</span>
                <span
                  className={`inline-block mt-1 sm:mt-0 sm:ml-2 px-2 py-1 rounded text-sm ${
                    selectedUser.blocked
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {selectedUser.blocked ? "Blocked" : "Active"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium min-w-0 sm:min-w-[80px]">Total Orders:</span>{" "}
                <span className="text-gray-700">{selectedUser.orders?.length || 0}</span>
              </div>
            </div>
          </div>

          <div className="xl:col-span-2 bg-white p-4 sm:p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            {selectedUser.orders && selectedUser.orders.length > 0 ? (
              <div className="space-y-3 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                {selectedUser.orders.slice(0, 5).map((order, index) => (
                  <div key={index} className="border p-3 sm:p-4 rounded">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="font-medium">Order #{order._id?.slice(-6)}</span>
                      <span className="text-sm text-gray-600">
                        {new Date(order.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">Amount: ${order.amount}</p>
                      <p className="text-sm">Status: {order.status}</p>
                      <p className="text-sm">Items: {order.items?.length}</p>
                    </div>
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
    <div className="p-4 sm:p-6">

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h3 className="text-xl sm:text-2xl font-semibold">User Management</h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full sm:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600 whitespace-nowrap">
            {filteredUsers.length} users found
          </span>
        </div>
      </div>

      <div className="hidden lg:flex flex-col gap-2">
        <div className="grid grid-cols-[2fr_3fr_2fr_2fr_2fr] items-center py-3 px-4 border bg-gray-100 text-sm font-semibold rounded-lg">
          <span>Name</span>
          <span>Email</span>
          <span>Join Date</span>
          <span>Status</span>
          <span className="text-center">Actions</span>
        </div>

        {filteredUsers.map((user, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_3fr_2fr_2fr_2fr] items-center gap-2 py-3 px-4 border text-sm hover:bg-gray-50 rounded-lg transition-colors"
          >
            <span className="text-gray-700 font-medium truncate">{user.name || "—"}</span>

            <span className="text-gray-500 text-xs truncate">{user.email}</span>

            <span className="font-semibold text-gray-700">
              {new Date(user.date).toLocaleDateString()}
            </span>

            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                user.blocked
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {user.blocked ? "Blocked" : "Active"}
            </span>

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
      </div>

      <div className="lg:hidden space-y-4">
        {filteredUsers.map((user, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{user.name || "—"}</h4>
                <p className="text-sm text-gray-500 break-all">{user.email}</p>
              </div>
              <span
                className={`inline-block px-2 py-1 rounded text-xs font-medium self-start ${
                  user.blocked
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {user.blocked ? "Blocked" : "Active"}
              </span>
            </div>

            <div className="text-sm text-gray-600 mb-4">
              <p>Joined: {new Date(user.date).toLocaleDateString()}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => getUserOrders(user._id)}
                className="flex-1 sm:flex-none bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
              >
                View Details
              </button>
              <button
                onClick={() => blockUser(user._id, user.blocked)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded text-sm transition-colors ${
                  user.blocked
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-yellow-500 text-white hover:bg-yellow-600"
                }`}
              >
                {user.blocked ? "Unblock" : "Block"}
              </button>
              <button
                onClick={() => deleteUser(user._id)}
                className="flex-1 sm:flex-none bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-lg mb-2">
            {searchTerm ? "No users found matching your search" : "No users found"}
          </div>
          {searchTerm && (
            <p className="text-sm">Try adjusting your search terms</p>
          )}
        </div>
      )}
    </div>
  )
}

export default Users