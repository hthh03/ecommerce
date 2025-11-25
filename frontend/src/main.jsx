import {BrowserRouter} from 'react-router-dom'
import { createRoot } from 'react-dom/client';
import './index.css'
import App from './App'
import ShopContextProvider from './context/ShopContext';
import { GoogleOAuthProvider } from '@react-oauth/google'

const clientId = "27418372800-gsk48q18dc0f7orgev1o3s1rm8l45pp9";

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={clientId}> 
    <BrowserRouter> 
      <ShopContextProvider>
        <App />
      </ShopContextProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>, 
)
