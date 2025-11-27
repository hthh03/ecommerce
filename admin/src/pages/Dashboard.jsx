import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from "react-toastify"

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow border flex items-center gap-4">
    <div className="text-3xl p-3 bg-gray-100 rounded-full">{icon}</div>
    <div>
      <h4 className="text-sm font-medium text-gray-500 uppercase">{title}</h4>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
)

const Dashboard = ({ token }) => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0
  })
  const [topProduct, setTopProduct] = useState(null)
  const [topCustomer, setTopCustomer] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    if (!token) return
    setLoading(true)
    try {
      const statsResponse = await axios.get(backendUrl + '/api/stats/summary', { headers: { token } })
      
      if (statsResponse.data.success) {
        setStats({
          totalOrders: statsResponse.data.totalOrders,
          totalRevenue: statsResponse.data.totalRevenue,
          totalUsers: statsResponse.data.totalUsers,
        })
      } else {
        toast.error("Failed to fetch summary data")
      }

      const topProductResponse = await axios.get(backendUrl + '/api/stats/top-product', { headers: { token } })
      
      if (topProductResponse.data.success) {
        setTopProduct(topProductResponse.data.product)
      }

      const topCustomerResponse = await axios.get(backendUrl + '/api/stats/top-customer', { headers: { token } })
      
      if (topCustomerResponse.data.success) {
        setTopCustomer(topCustomerResponse.data.customer)
      }

    } catch (error) {
      toast.error("Error loading dashboard data")
      console.error(error)
      setStats({ totalOrders: 'N/A', totalRevenue: 'N/A', totalUsers: 'N/A' })
      setTopProduct({ name: 'Sample Product', quantity: 'N/A', image: 'https://via.placeholder.com/100' })
      setTopCustomer({ name: 'Sample Customer', email: 'sample@test.com', totalSpent: 'N/A' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [token])

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading dashboard...</div>
  }

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-semibold mb-6">Dashboard Overview</h2>
      
      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={`${currency}${stats.totalRevenue.toLocaleString()}`}
          icon="💰" 
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders}
          icon="📦" 
        />
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers}
          icon="👥" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h4 className="font-semibold mb-4 text-gray-800">🏆 Best Selling Product</h4>
          {topProduct ? (
            <div className="flex items-center gap-4">
              <img src={topProduct.image} alt={topProduct.name} className="w-16 h-16 object-cover rounded-lg" />
              <div>
                <p className="text-lg font-medium">{topProduct.name}</p>
                <p className="text-gray-600">Sold: {topProduct.quantity} units</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No product data available.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h4 className="font-semibold mb-4 text-gray-800">🥇 Top Customer</h4>
          {topCustomer ? (
            <div>
              <p className="text-lg font-medium">{topCustomer.name}</p>
              <p className="text-sm text-gray-600">{topCustomer.email}</p>
              <p className="text-green-600 font-semibold mt-1">
                Total Spent: {currency}{topCustomer.totalSpent.toLocaleString()}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No customer data available.</p>
          )}
        </div>
      </div>
      
    </div>
  )
}

export default Dashboard