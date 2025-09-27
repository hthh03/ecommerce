import { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'
import { backendUrl, currency } from '../App'

const ProductManager = ({token}) => {
  const [list, setList] = useState([])
  const [filteredList, setFilteredList] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [selectedSubCategory, setSelectedSubCategory] = useState("All")

  // Edit form states
  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("Men")
  const [subCategory, setSubCategory] = useState("Ring")
  const [bestseller, setBestseller] = useState(false)
  const [sizes, setSizes] = useState([])

  const subCategories = ["All", "Ring", "Necklace", "Bracelet"]

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
         setList(response.data.products) 
         setFilteredList(response.data.products)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const removeProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await axios.post(backendUrl + '/api/product/remove', {id}, {headers:{token}})
        if (response.data.success) {
          toast.success(response.data.message)
          await fetchList()
        } else {
          toast.error(response.data.message)
        }
      } catch (error) {
        console.log(error)
        toast.error(error.message)
      }
    }
  }

  const filterBySubCategory = (subCat) => {
    setSelectedSubCategory(subCat)
    if (subCat === "All") {
      setFilteredList(list)
    } else {
      setFilteredList(list.filter(item => item.subCategory === subCat))
    }
  }

  const selectProductForEdit = (product) => {
    setSelectedProduct(product)
    setEditMode(true)
    
    // Populate form with product data
    setName(product.name)
    setDescription(product.description)
    setPrice(product.price.toString())
    setCategory(product.category)
    setSubCategory(product.subCategory)
    setBestseller(product.bestseller)
    setSizes(product.sizes)
    
    // Reset images
    setImage1(false)
    setImage2(false)
    setImage3(false)
    setImage4(false)
  }

  const onUpdateHandler = async (e) => {
    e.preventDefault()

    try {
      const formData = new FormData()

      formData.append("id", selectedProduct._id)
      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", price)
      formData.append("category", category)
      formData.append("subCategory", subCategory)
      formData.append("bestseller", bestseller.toString())
      formData.append("sizes", JSON.stringify(sizes))

      image1 && formData.append("image1", image1)
      image2 && formData.append("image2", image2)
      image3 && formData.append("image3", image3)
      image4 && formData.append("image4", image4)

      const response = await axios.post(backendUrl + "/api/product/update", formData, {headers:{token}})

      if (response.data.success) { 
        toast.success(response.data.message)
        setEditMode(false)
        setSelectedProduct(null)
        await fetchList()
        // Reapply filter after update
        filterBySubCategory(selectedSubCategory)
      } else {
        toast.error(response.data.message)
      } 
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const cancelEdit = () => {
    setEditMode(false)
    setSelectedProduct(null)
    setName("")
    setDescription("")
    setPrice("")
    setCategory("Men")
    setSubCategory("Ring")
    setBestseller(false)
    setSizes([])
    setImage1(false)
    setImage2(false)
    setImage3(false)
    setImage4(false)
  }

  useEffect(() => {
    fetchList()
  }, [])

  useEffect(() => {
    filterBySubCategory(selectedSubCategory)
  }, [list])

  // Get product count by subcategory
  const getProductCount = (subCat) => {
    if (subCat === "All") return list.length
    return list.filter(item => item.subCategory === subCat).length
  }

  return (
    <div className="p-4 sm:p-6">
      {!editMode ? (
        // Product List View with Subcategory Filter
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-bold">Product Management</h1>
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
              <span className="hidden sm:inline">Total Products: {list.length} | </span>
              <span>Showing: {filteredList.length}</span>
            </div>
          </div>

          {/* Subcategory Filter Tabs */}
          <div className="mb-6 border-b pb-4">
            <div className="flex flex-wrap gap-2">
              {subCategories.map((subCat) => (
                <button
                  key={subCat}
                  onClick={() => filterBySubCategory(subCat)}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    selectedSubCategory === subCat
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="sm:hidden">{subCat}</span>
                  <span className="hidden sm:inline">{subCat} ({getProductCount(subCat)})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:flex flex-col gap-2">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-3 px-4 border bg-gray-100 text-sm font-semibold rounded-lg">
              <span>Image</span>
              <span>Name</span>
              <span>Category</span>
              <span>Price</span>
              <span className="text-center">Actions</span>
            </div>

            {/* Table Body */}
            {filteredList.length > 0 ? (
              filteredList.map((item, index) => (
                <div className="grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-3 px-4 border text-sm hover:bg-gray-50 rounded-lg transition-colors" key={index}>
                  <img className="w-12 h-12 object-cover rounded" src={item.image[0]} alt={item.name}/>
                  <div>
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.subCategory}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{item.category}</span>
                  <span className="font-semibold text-green-600">{currency}{item.price}</span>
                  <div className="flex gap-2 justify-center">
                    <button 
                      onClick={() => selectProductForEdit(item)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => removeProduct(item._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No products found in "{selectedSubCategory}" category</p>
              </div>
            )}
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-4">
            {filteredList.length > 0 ? (
              filteredList.map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow">
                  {/* Card Header */}
                  <div className="flex gap-4 mb-4">
                    <img className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0" src={item.image[0]} alt={item.name}/>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-1 truncate">{item.name}</h3>
                      <p className="text-xs text-gray-500 mb-2">{item.subCategory}</p>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{item.category}</span>
                        <span className="font-semibold text-green-600 text-sm">{currency}{item.price}</span>
                        {item.bestseller && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Bestseller</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="mb-4 text-xs text-gray-600">
                    <p className="line-clamp-2">{item.description}</p>
                    {item.sizes && item.sizes.length > 0 && (
                      <p className="mt-1">Sizes: {item.sizes.join(', ')}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => selectProductForEdit(item)}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      Edit Product
                    </button>
                    <button 
                      onClick={() => removeProduct(item._id)}
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-lg mb-2">No products found</div>
                <p className="text-sm">No products in "{selectedSubCategory}" category</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Edit Form View
        <div>
          {/* Edit Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold">Edit Product</h2>
              <p className="text-sm text-gray-600 mt-1 truncate">{selectedProduct.name}</p>
            </div>
            <button 
              onClick={cancelEdit}
              className="self-start sm:self-center px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
            >
              ← Back to List
            </button>
          </div>

          {/* Edit Form */}
          <form onSubmit={onUpdateHandler} className='flex flex-col w-full items-start gap-4 sm:gap-6 bg-white p-4 sm:p-6 rounded-lg border'>
            {/* Product Images */}
            <div className="w-full">
              <p className='mb-3 font-medium text-sm sm:text-base'>Product Images (Optional - Click to change)</p>
              <div className='grid grid-cols-2 sm:flex gap-3'>
                <label htmlFor='image1' className="cursor-pointer">
                  <img className='w-16 h-16 sm:w-20 sm:h-20 object-cover border-2 border-dashed border-gray-300 rounded hover:border-blue-400 transition-colors' src={!image1 ? (selectedProduct.image[0] || assets.upload_area) : URL.createObjectURL(image1)} alt=''/>
                  <input onChange={(e)=>setImage1(e.target.files[0])} type='file' id='image1' hidden accept="image/*" />
                </label>
                <label htmlFor='image2' className="cursor-pointer">
                  <img className='w-16 h-16 sm:w-20 sm:h-20 object-cover border-2 border-dashed border-gray-300 rounded hover:border-blue-400 transition-colors' src={!image2 ? (selectedProduct.image[1] || assets.upload_area) : URL.createObjectURL(image2)} alt=''/>
                  <input onChange={(e)=>setImage2(e.target.files[0])} type='file' id='image2' hidden accept="image/*" />
                </label>
                <label htmlFor='image3' className="cursor-pointer">
                  <img className='w-16 h-16 sm:w-20 sm:h-20 object-cover border-2 border-dashed border-gray-300 rounded hover:border-blue-400 transition-colors' src={!image3 ? (selectedProduct.image[2] || assets.upload_area) : URL.createObjectURL(image3)} alt=''/>
                  <input onChange={(e)=>setImage3(e.target.files[0])} type='file' id='image3' hidden accept="image/*" />
                </label>
                <label htmlFor='image4' className="cursor-pointer">
                  <img className='w-16 h-16 sm:w-20 sm:h-20 object-cover border-2 border-dashed border-gray-300 rounded hover:border-blue-400 transition-colors' src={!image4 ? (selectedProduct.image[3] || assets.upload_area) : URL.createObjectURL(image4)} alt=''/>
                  <input onChange={(e)=>setImage4(e.target.files[0])} type='file' id='image4' hidden accept="image/*" />
                </label>
              </div>
            </div>

            {/* Product Name */}
            <div className='w-full'>
              <p className='mb-2 font-medium text-sm sm:text-base'>Product Name</p>
              <input 
                onChange={(e)=>setName(e.target.value)} 
                value={name} 
                className='w-full max-w-full sm:max-w-[500px] px-3 py-2 border rounded focus:outline-none focus:border-blue-500 text-sm' 
                type='text' 
                placeholder='Type here' 
                required
              />
            </div>

            {/* Product Description */}
            <div className='w-full'>
              <p className='mb-2 font-medium text-sm sm:text-base'>Product Description</p>
              <textarea 
                onChange={(e)=>setDescription(e.target.value)} 
                value={description} 
                className='w-full max-w-full sm:max-w-[500px] px-3 py-2 border rounded focus:outline-none focus:border-blue-500 text-sm' 
                rows="4" 
                placeholder='Write content here' 
                required
              />
            </div>

            {/* Category, SubCategory, Price */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full'>
              <div>
                <p className='mb-2 font-medium text-sm sm:text-base'>Category</p>
                <select 
                  onChange={(e)=>setCategory(e.target.value)} 
                  value={category} 
                  className='w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 text-sm'
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
                </select>
              </div>

              <div>
                <p className='mb-2 font-medium text-sm sm:text-base'>Sub Category</p>
                <select 
                  onChange={(e)=>setSubCategory(e.target.value)} 
                  value={subCategory} 
                  className='w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 text-sm'
                >
                  <option value="Ring">Ring</option> 
                  <option value="Necklace">Necklace</option>
                  <option value="Bracelet">Bracelet</option>
                </select>
              </div>

              <div>
                <p className='mb-2 font-medium text-sm sm:text-base'>Price ({currency})</p>
                <input 
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setPrice(value);
                    }
                  }}
                  onBlur={(e) => {
                    const numValue = parseFloat(e.target.value);
                    if (!isNaN(numValue) && numValue >= 0) {
                      setPrice(numValue.toFixed(2));
                    } else if (e.target.value === '') {
                      setPrice('');
                    }
                  }}
                  value={price} 
                  className='w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 text-sm' 
                  type='text'
                  inputMode='decimal'
                  placeholder='25.99'
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Sizes */}
            <div className="w-full">
              <p className='mb-2 font-medium text-sm sm:text-base'>Available Sizes</p>
              <input
                type="text"
                value={sizes.join(",")}
                onChange={(e) => setSizes(e.target.value.split(",").map(s => s.trim()).filter(s => s !== ''))}
                className='w-full max-w-full sm:max-w-[500px] px-3 py-2 border rounded focus:outline-none focus:border-blue-500 text-sm'
                placeholder="Enter sizes separated by comma (e.g. 16,17,18,19 or 40cm,45cm)"
              />
              <p className="text-xs text-gray-500 mt-1">Example: Ring → 16,17,18,19 | Necklace → 40cm,45cm</p>
            </div>

            {/* Bestseller Checkbox */}
            <div className='flex items-center gap-2'>
              <input 
                onChange={() => setBestseller(prev => !prev)} 
                checked={bestseller} 
                type='checkbox' 
                id='bestseller'
                className="w-4 h-4"
              />
              <label className='cursor-pointer font-medium text-sm sm:text-base' htmlFor='bestseller'>
                Mark as Bestseller
              </label>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full sm:w-auto">
              <button 
                type="submit" 
                className='px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium text-sm sm:text-base'
              >
                UPDATE PRODUCT
              </button>
              <button 
                type="button" 
                onClick={cancelEdit} 
                className='px-6 py-3 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors font-medium text-sm sm:text-base'
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default ProductManager