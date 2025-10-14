import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';

const SubCategory = ({ token }) => {
  const [name, setName] = useState('');
  const [subCategories, setSubCategories] = useState([]);

  const fetchSubCategories = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/subcategory/list');
      if (response.data.success) {
        setSubCategories(response.data.subCategories);
      } else {
        toast.error(response.data.message);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('Failed to fetch sub-categories');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        backendUrl + '/api/subcategory/add',
        { name },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setName('');
        await fetchSubCategories();
      } else {
        toast.error(response.data.message);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleRemove = async (id) => {
    if (window.confirm('Are you sure you want to delete this sub-category?')) {
      try {
        const response = await axios.post(
          backendUrl + '/api/subcategory/remove',
          { id },
          { headers: { token } }
        );
        if (response.data.success) {
          toast.success(response.data.message);
          await fetchSubCategories();
        } else {
          toast.error(response.data.message);
        }
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        toast.error('An error occurred');
      }
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <h3 className="text-xl sm:text-2xl font-semibold mb-6">Sub-Category Management</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Form */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h4 className="font-semibold mb-4">Add New Sub-Category</h4>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Pendant, Earrings"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium self-start"
            >
              ADD
            </button>
          </form>
        </div>

        {/* List View */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h4 className="font-semibold mb-4">Existing Sub-Categories</h4>
          {subCategories.length > 0 ? (
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {subCategories.map((item) => (
                <li
                  key={item._id}
                  className="flex justify-between items-center p-2 border rounded hover:bg-gray-50"
                >
                  <span>{item.name}</span>
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No sub-categories found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubCategory;