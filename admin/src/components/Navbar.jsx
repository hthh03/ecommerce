import {assets} from '../assets/assets'

const Navbar = ({setToken}) => {
  return (
    <div className='flex items-center py-2 px-[4%] justify-between'>
      <img className='w-[max(15%,100px)]' src={assets.logo} alt=''/>
      <button onClick={() => setToken("")}  className=" text-white p-2 sm:p-3 rounded-full flex items-center justify-center">
      <img src={assets.logout_icon} alt="logout" className="w-5 h-5 sm:w-6 sm:h-6"/>
    </button>
    </div>
  )
}

export default Navbar
