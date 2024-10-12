import { Router } from "express";
import * as order from './controller/order.js'
import Auth from '../../middleware/auth.js'
const router = Router()

router.post('/',Auth,order.createOrder)



export default router