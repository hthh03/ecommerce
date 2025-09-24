import {Routes,Route} from 'react-router-dom'
import Home from './pages/Home'
import Collection from './pages/Collection'
import About from './pages/About'
import Contact from './pages/Contact'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Login from './pages/Login'
import PlaceOrder from './pages/PlaceOrder'
import Orders from './pages/Orders'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import SearchBar from './components/SearchBar'
import Verify from './pages/Verify'
import Profile from './pages/Profile'
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
 // eslint-disable-next-line no-unused-vars
import { ToastContainer, toast } from 'react-toastify';

const App = () => {
  const backendUrl = "http://localhost:4000";
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <ToastContainer/>
      <NavBar />
      <SearchBar />
      <Routes>
       <Route path='/' element={<Home/>} />  
       <Route path='/collection' element={<Collection/>} />
       <Route path='/about' element={<About/>} />
       <Route path='/contact' element={<Contact/>} />
       <Route path='/product/:productId' element={<Product/>} />
       <Route path='/cart' element={<Cart/>} />
       <Route path='/login' element={<Login/>} />
       <Route path='/place-order' element={<PlaceOrder/>} />
       <Route path='/orders' element={<Orders/>} />
       <Route path='/verify' element={<Verify/>} />
       <Route path='/profile' element={<Profile/>} />
        <Route path="/forgot-password" element={<ForgotPassword backendUrl={backendUrl} />} />
        <Route path="/reset-password" element={<ResetPassword backendUrl={backendUrl} />} />
      </Routes>
      <Footer/>
    </div>
  )
}

export default App
