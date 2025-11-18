import express from 'express'
import {
    listProducts, 
    addProduct, 
    removeProduct, 
    singleProduct, 
    updateProduct,
    listAllProductsAdmin, // <-- Đã import
    toggleProductStatus   // <-- Đã import
} from '../controllers/productController.js'
import upload from '../middleware/multer.js'
import adminAuth from '../middleware/adminAuth.js'

const productRouter = express.Router();

// Các route của Admin (yêu cầu adminAuth)
productRouter.post('/add', adminAuth,
    upload.fields([{name:'image1',maxCount:1},
                    {name:'image2',maxCount:1},
                    {name:'image3',maxCount:1},
                    {name:'image4',maxCount:1}
    ]),addProduct);
    
productRouter.post('/update', adminAuth, upload.fields([
        {name: 'image1', maxCount: 1},
        {name: 'image2', maxCount: 1}, 
        {name: 'image3', maxCount: 1},
        {name: 'image4', maxCount: 1}
    ]), updateProduct);

productRouter.post('/remove', adminAuth, removeProduct);

productRouter.post('/admin-list', adminAuth, listAllProductsAdmin);

productRouter.post('/toggle-status', adminAuth, toggleProductStatus);


// Các route Công khai (cho khách hàng)
productRouter.post('/single',singleProduct);
productRouter.get('/list',listProducts);


export default productRouter