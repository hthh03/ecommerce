import { useState } from 'react'
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
  const [bestseller, setBestseller] = useState(false)
  const [sizes, setSizes] = useState([])

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
      formData.append('sizes', JSON.stringify(sizes))

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
          >
            <option value='Ring'>Ring</option>
            <option value='Necklace'>Necklace</option>
            <option value='Bracelet'>Bracelet</option>
          </select>
        </div>

        <div>
          <p className='mb-2 font-medium'>Price ($)</p>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            className='w-full px-3 py-2 sm:w-[120px] border rounded focus:outline-none focus:border-blue-500'
            type='number'
            placeholder='25'
            min='0'
          />
        </div>
      </div>

     <div>
        <p className='mb-2 font-medium'>Available Sizes</p>
        <input
          type="text"
          value={sizes.join(",")}
          onChange={(e) =>
            setSizes(e.target.value.split(",").map(s => s.trim()))
          }
          className='w-full max-w-[500px] px-3 py-2 border rounded focus:outline-none focus:border-blue-500'
          placeholder="Enter sizes separated by comma (e.g. 16,17,18,19 or 40cm,45cm)"
        />
        <p className="text-xs text-gray-500 mt-1">
          Example: Ring → 16,17,18,19 | Necklace → 40cm,45cm
        </p>
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
