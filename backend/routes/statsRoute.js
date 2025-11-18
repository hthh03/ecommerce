import express from 'express';
import { getSummary, getTopProduct, getTopCustomer } from '../controllers/statsController.js';
import adminAuth from '../middleware/adminAuth.js'; //

const statsRouter = express.Router();

statsRouter.get('/summary', adminAuth, getSummary);
statsRouter.get('/top-product', adminAuth, getTopProduct);
statsRouter.get('/top-customer', adminAuth, getTopCustomer);

export default statsRouter;