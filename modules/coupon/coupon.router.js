import { Router } from "express";
import Auth from '../../middleware/auth.js'
import * as coupon from './controller/coupon.js'
const router = Router({ mergeParams: true })

router.get('/', coupon.coupons)
router.post('/', Auth, coupon.createCoupon)
router.put('/:id', Auth, coupon.updateCoupon)
router.patch('/:id', Auth, coupon.deleteCoupon)



export default router