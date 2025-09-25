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
    setPrice(product.price)
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
    <div>
      {!editMode ? (
        // Product List View with Subcategory Filter
        <div>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Product Management</h1>
            <div className="text-sm text-gray-600">
              Total Products: {list.length} | Showing: {filteredList.length}
            </div>
          </div>

          {/* Subcategory Filter Tabs */}
          <div className="flex gap-2 mb-4 border-b pb-4">
            {subCategories.map((subCat) => (
              <button
                key={subCat}
                onClick={() => filterBySubCategory(subCat)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedSubCategory === subCat
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {subCat} ({getProductCount(subCat)})
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {/* List Table Title */}
            <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-3 px-4 border bg-gray-100 text-sm font-semibold rounded-lg">
              <span>Image</span>
              <span>Name</span>
              <span>Category</span>
              <span>Price</span>
              <span className="text-center">Actions</span>
            </div>

            {/* Product List */}
            {filteredList.length > 0 ? (
              filteredList.map((item, index) => (
                <div className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-3 px-4 border text-sm hover:bg-gray-50 rounded-lg transition-colors" key={index}>
                  <img className="w-12 h-12 object-cover rounded" src={item.image[0]} alt={item.name}/>
                  <div>
                    <p className="font-medium">{item.name}</p>
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
        </div>
      ) : (
        // Edit Form View
        <div>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold">Edit Product: {selectedProduct.name}</h2>
            <div className="flex gap-2">
              <button 
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                ← Back to List
              </button>
            </div>
          </div>

          <form onSubmit={onUpdateHandler} className='flex flex-col w-full items-start gap-4 bg-white p-6 rounded-lg border'>
            <div className="w-full">
              <p className='mb-3 font-medium'>Product Images (Optional - Click to change)</p>
              <div className='flex gap-3'>
                <label htmlFor='image1' className="cursor-pointer">
                  <img className='w-20 h-20 object-cover border-2 border-dashed border-gray-300 rounded hover:border-blue-400 transition-colors' src={!image1 ? (selectedProduct.image[0] || assets.upload_area) : URL.createObjectURL(image1)} alt=''/>
                  <input onChange={(e)=>setImage1(e.target.files[0])} type='file' id='image1' hidden accept="image/*" />
                </label>
                <label htmlFor='image2' className="cursor-pointer">
                  <img className='w-20 h-20 object-cover border-2 border-dashed border-gray-300 rounded hover:border-blue-400 transition-colors' src={!image2 ? (selectedProduct.image[1] || assets.upload_area) : URL.createObjectURL(image2)} alt=''/>
                  <input onChange={(e)=>setImage2(e.target.files[0])} type='file' id='image2' hidden accept="image/*" />
                </label>
                <label htmlFor='image3' className="cursor-pointer">
                  <img className='w-20 h-20 object-cover border-2 border-dashed border-gray-300 rounded hover:border-blue-400 transition-colors' src={!image3 ? (selectedProduct.image[2] || assets.upload_area) : URL.createObjectURL(image3)} alt=''/>
                  <input onChange={(e)=>setImage3(e.target.files[0])} type='file' id='image3' hidden accept="image/*" />
                </label>
                <label htmlFor='image4' className="cursor-pointer">
                  <img className='w-20 h-20 object-cover border-2 border-dashed border-gray-300 rounded hover:border-blue-400 transition-colors' src={!image4 ? (selectedProduct.image[3] || assets.upload_area) : URL.createObjectURL(image4)} alt=''/>
                  <input onChange={(e)=>setImage4(e.target.files[0])} type='file' id='image4' hidden accept="image/*" />
                </label>
              </div>
            </div>

            <div className='w-full'>
              <p className='mb-2 font-medium'>Product Name</p>
              <input onChange={(e)=>setName(e.target.value)} value={name} className='w-full max-w-[500px] px-3 py-2 border rounded focus:outline-none focus:border-blue-500' type='text' placeholder='Type here' required/>
            </div>

            <div className='w-full'>
              <p className='mb-2 font-medium'>Product Description</p>
              <textarea onChange={(e)=>setDescription(e.target.value)} value={description} className='w-full max-w-[500px] px-3 py-2 border rounded focus:outline-none focus:border-blue-500' rows="4" placeholder='Write content here' required/>
            </div>

            <div className='flex flex-col sm:flex-row gap-4 w-full'>
              <div>
                <p className='mb-2 font-medium'>Category</p>
                <select onChange={(e)=>setCategory(e.target.value)} value={category} className='w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500'>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
                </select>
              </div>

              <div>
                <p className='mb-2 font-medium'>Sub Category</p>
                <select onChange={(e)=>setSubCategory(e.target.value)} value={subCategory} className='w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500'>
                  <option value="Ring">Ring</option> 
                  <option value="Necklace">Necklace</option>
                  <option value="Bracelet">Bracelet</option>
                </select>
              </div>

              <div>
                <p className='mb-2 font-medium'>Price ({currency})</p>
                <input onChange={(e)=>setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px] border rounded focus:outline-none focus:border-blue-500' type='number' placeholder='25' min="0"/>
              </div>
            </div>

            <div>
              <p className='mb-2 font-medium'>Available Sizes</p>
              <div className='flex gap-2'>
                {["S", "M", "L", "XL", "XXL"].map((size) => (
                  <div key={size} onClick={() => 
                    setSizes(prev => prev.includes(size) 
                      ? prev.filter(item => item !== size) 
                      : [...prev, size]
                    )
                  }>
                    <p className={`${sizes.includes(size) ? "bg-blue-500 text-white" : "bg-slate-200 text-gray-700"} px-3 py-2 cursor-pointer rounded transition-colors hover:bg-blue-400`}>
                      {size}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <input 
                onChange={() => setBestseller(prev => !prev)} 
                checked={bestseller} 
                type='checkbox' 
                id='bestseller'
                className="w-4 h-4"
              />
              <label className='cursor-pointer font-medium' htmlFor='bestseller'>Mark as Bestseller</label>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button type="submit" className='px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium'>
                UPDATE PRODUCT
              </button>
              <button type="button" onClick={cancelEdit} className='px-6 py-3 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors font-medium'>
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