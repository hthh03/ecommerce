import express from 'express';
import { addSubCategory, listSubCategories, removeSubCategory } from '../controllers/subCategoryController.js';
import adminAuth from '../middleware/adminAuth.js';

const subCategoryRouter = express.Router();

subCategoryRouter.post('/add', adminAuth, addSubCategory);
subCategoryRouter.get('/list', listSubCategories); // Public access to list for filtering
subCategoryRouter.post('/remove', adminAuth, removeSubCategory);

export default subCategoryRouter;