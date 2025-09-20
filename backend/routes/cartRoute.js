import express from 'express'
import {addTocart, getUserCart, updateCart} from '../controllers/cartController.js'

const cartRouter = express.Router()

cartRouter.post('/get', authUser, getUserCart)
cartRouter.post('/add', authUser, addTocart)
cartRouter.post('/update', authUser, updateCart)

export default cartRouter