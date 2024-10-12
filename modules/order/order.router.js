import { Router } from "express";
import * as order from './controller/order.js'
import Auth from '../../middleware/auth.js'
const router = Router()

router.post('/',Auth,order.createOrder)
router.post('/webhook',Auth,express.raw({type: 'application/json'}),order.webHook)



export default router