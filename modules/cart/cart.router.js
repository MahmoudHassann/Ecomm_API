import { Router } from "express";
import * as cart from './controller/cart.js'
import Auth from '../../middleware/auth.js'
const router = Router()

router.post('/',Auth,cart.addToCart)
router.get('/',Auth,cart.getCartItems)
router.delete('/',Auth,cart.deleteItemCart)




export default router