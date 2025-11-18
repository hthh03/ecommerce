import { useState, useEffect } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const Add = ({ token }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const [image1, setImage1] = useState(false)
  const [image2, setImage2] = useState(false)
  const [image3, setImage3] = useState(false)
  const [image4, setImage4] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('Men')
  const [subCategory, setSubCategory] = useState('Ring')
  const [subCategoryList, setSubCategoryList] = useState([]); 
  const [bestseller, setBestseller] = useState(false)
  const [sizes, setSizes] = useState([{ size: '', stock: '' }]);

    // Hàm xử lý thay đổi trong các ô input của size/stock
    const handleSizeChange = (index, event) => {
        const values = [...sizes];
        values[index][event.target.name] = event.target.value;
        setSizes(values);
    };

    // Hàm thêm một cặp trường size/stock mới
    const addSizeField = () => {
        // Sử dụng chuỗi rỗng '' thay vì ' ' để dữ liệu sạch hơn
        setSizes([...sizes, { size: '', stock: '' }]); 
    };

    // Hàm xóa một cặp trường size/stock
    const removeSizeField = (index) => {
        const values = [...sizes];
        values.splice(index, 1);
        setSizes(values);
    };

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('category', category)
      formData.append('subCategory', subCategory)
      formData.append('bestseller', bestseller.toString())
      formData.append('sizes', JSON.stringify(sizes));

      image1 && formData.append('image1', image1)
      image2 && formData.append('image2', image2)
      image3 && formData.append('image3', image3)
      image4 && formData.append('image4', image4)

      const response = await axios.post(
        backendUrl + '/api/product/add',
        formData,
        { headers: { token } }
      )

      if (response.data.success) {
        toast.success(response.data.message)
        setName('')
        setDescription('')
        setPrice('')
        setCategory('Men')
        setSubCategory('Ring')
        setBestseller(false)
        setSizes([])
        setImage1(false)
        setImage2(false)
        setImage3(false)
        setImage4(false)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }
  
   // Hàm fetch sub-categories
  const fetchSubCategories = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/subcategory/list');
      if (response.data.success) {
        setSubCategoryList(response.data.subCategories);
        if (response.data.subCategories.length > 0) {
           setSubCategory(response.data.subCategories[0].name); // Set giá trị mặc định
        }
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Failed to load sub-categories");
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, []);

  return (
    <form
      onSubmit={onSubmitHandler}
      className='flex flex-col w-full items-start gap-4 bg-white p-6 rounded-lg border'
    >
      <div className='w-full'>
        <p className='mb-3 font-medium'>Product Images</p>
        <div className='flex gap-3'>
          {[1, 2, 3, 4].map((num) => {
            const img = eval(`image${num}`)
            const setImg = eval(`setImage${num}`)
            return (
              <label key={num} htmlFor={`image${num}`} className='cursor-pointer'>
                <img
                  className='w-20 h-20 object-cover border-2 border-dashed border-gray-300 rounded hover:border-blue-400 transition-colors'
                  src={!img ? assets.upload_area : URL.createObjectURL(img)}
                  alt=''
                />
                <input
                  onChange={(e) => setImg(e.target.files[0])}
                  type='file'
                  id={`image${num}`}
                  hidden
                  accept='image/*'
                />
              </label>
            )
          })}
        </div>
      </div>

      <div className='w-full'>
        <p className='mb-2 font-medium'>Product Name</p>
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          className='w-full max-w-[500px] px-3 py-2 border rounded focus:outline-none focus:border-blue-500'
          type='text'
          placeholder='Type here'
          required
        />
      </div>

      <div className='w-full'>
        <p className='mb-2 font-medium'>Product Description</p>
        <textarea
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          className='w-full max-w-[500px] px-3 py-2 border rounded focus:outline-none focus:border-blue-500'
          rows='4'
          placeholder='Write content here'
          required
        />
      </div>

      <div className='flex flex-col sm:flex-row gap-4 w-full'>
        <div>
          <p className='mb-2 font-medium'>Category</p>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className='w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500'
          >
            <option value='Men'>Men</option>
            <option value='Women'>Women</option>
            <option value='Kids'>Kids</option>
          </select>
        </div>

         <div>
        <p className='mb-2 font-medium'>Sub Category</p>
        <select
          onChange={(e) => setSubCategory(e.target.value)}
          value={subCategory}
          className='w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500'
          required
        >
          {subCategoryList.length === 0 && <option disabled>Loading...</option>}
          {subCategoryList.map((item) => (
            <option key={item._id} value={item.name}>{item.name}</option>
          ))}
        </select>
      </div>

        <div>
          <p className='mb-2 font-medium'>Price ($)</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className='w-full px-3 py-2 sm:w-[120px] border rounded focus:outline-none focus:border-blue-500'
            type='number'
            step='0.01' 
            placeholder='25.99'
            min='0'
            required
          />
        </div>
      </div>

     <div className="w-full">
                <p className='mb-2 font-medium'>Available Sizes & Stock</p>
                {sizes.map((sizeField, index) => (
                    <div key={index} className="flex items-center gap-3 mb-2">
                        <input
                            type="text"
                            name="size"
                            placeholder="Size (e.g., 16 or 40cm)"
                            value={sizeField.size}
                            // SỬA LỖI Ở ĐÂY: Gắn hàm vào sự kiện onChange
                            onChange={event => handleSizeChange(index, event)}
                            className="w-full max-w-[240px] px-3 py-2 border rounded"
                            required
                        />
                        <input
                            type="number"
                            name="stock"
                            placeholder="Stock quantity"
                            value={sizeField.stock}
                            // SỬA LỖI Ở ĐÂY: Gắn hàm vào sự kiện onChange
                            onChange={event => handleSizeChange(index, event)}
                            className="w-full max-w-[240px] px-3 py-2 border rounded"
                            required
                            min="0"
                        />
                        {/* SỬA LỖI Ở ĐÂY: Gắn hàm vào sự kiện onClick */}
                        <button type="button" onClick={() => removeSizeField(index)} className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                            -
                        </button>
                    </div>
                ))}
                {/* SỬA LỖI Ở ĐÂY: Gắn hàm vào sự kiện onClick */}
                <button type="button" onClick={addSizeField} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    + Add Size
                </button>
            </div>

      <div className='flex items-center gap-2'>
        <input
          onChange={() => setBestseller((prev) => !prev)}
          checked={bestseller}
          type='checkbox'
          id='bestseller'
          className='w-4 h-4'
        />
        <label className='cursor-pointer font-medium' htmlFor='bestseller'>
          Mark as Bestseller
        </label>
      </div>

      <div className='flex gap-3 mt-4'>
        <button
          type='submit'
          className='px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium'
        >
          ADD PRODUCT
        </button>
        <button
          type='reset'
          onClick={() => {
            setName('')
            setDescription('')
            setPrice('')
            setCategory('Men')
            setSubCategory('Ring')
            setBestseller(false)
            setSizes([])
            setImage1(false)
            setImage2(false)
            setImage3(false)
            setImage4(false)
          }}
          className='px-6 py-3 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors font-medium'
        >
          RESET
        </button>
      </div>
    </form>
  )
}

export default Add
