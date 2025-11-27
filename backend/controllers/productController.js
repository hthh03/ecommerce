import {v2 as cloudinary} from 'cloudinary'
import productModel from '../models/productModel.js'

const addProduct = async (req, res) => {
    try {
        const {name, description, price, category, subCategory, sizes, bestseller} = req.body;

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1,image2,image3,image4].filter((item)=> item !== undefined)

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path,{resource_type:'image'})
                return result.secure_url
            })
        )

        const parsedSizes = JSON.parse(sizes);

        const productData = {
            name,
            description,
            category,
            price: Number(price),
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: parsedSizes,
            image: imagesUrl,
            isActive: true, 
            date: Date.now()
        }

        const product = new productModel(productData);
        await product.save()

        res.json({success: true, message:"Product Added"})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

const listProducts = async (req,res) => {
    try {
        const products = await productModel.find({ isActive: true });
        res.json({success:true,products})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

const listAllProductsAdmin = async (req,res) => {
    try {
        const products = await productModel.find({});
        res.json({success:true,products})
    } catch (error) { 
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

const removeProduct = async (req,res) => {
    try {
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true,message:"Product Removed"})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

const singleProduct = async (req,res) => {
    try{
        const {productId} = req.body
        const product = await productModel.findById(productId)
        res.json({success:true,product})

    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

const toggleProductStatus = async (req,res) => {
    try {
        const { productId, status } = req.body;
        await productModel.findByIdAndUpdate(productId, { isActive: status });
        res.json({success:true, message: `Product status updated to ${status ? 'Active' : 'Disabled'}`})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

const updateProduct = async (req, res) => {
    try {
        const { id, name, description, price, category, subCategory, bestseller, sizes, isActive } = req.body;
        const product = await productModel.findById(id);
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        const parsedSizes = JSON.parse(sizes);

        const updateData = {
            name,
            description, 
            price: Number(price),
            category,
            subCategory,
            bestseller: bestseller === "true" ? true : false,
            sizes: parsedSizes,
            isActive: isActive === 'true' ? true : false, 
            date: Date.now()
        };

        let imagesUrl = [...product.image]; 

        const image1 = req.files.image1 && req.files.image1[0];
        const image2 = req.files.image2 && req.files.image2[0];
        const image3 = req.files.image3 && req.files.image3[0];
        const image4 = req.files.image4 && req.files.image4[0];

        const newImages = [image1, image2, image3, image4];

        for (let i = 0; i < newImages.length; i++) {
            if (newImages[i]) {
                let result = await cloudinary.uploader.upload(newImages[i].path, {resource_type: 'image'});
                imagesUrl[i] = result.secure_url;
            }
        }

        updateData.image = imagesUrl;
        const updatedProduct = await productModel.findByIdAndUpdate(id, updateData, { new: true });

        res.json({ success: true, message: "Product updated successfully", product: updatedProduct });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    addProduct, 
    listProducts, 
    removeProduct, 
    singleProduct, 
    updateProduct,
    listAllProductsAdmin, 
    toggleProductStatus   
}