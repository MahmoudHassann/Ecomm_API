import authRouter from "./auth/auth.router.js"
import categoryRouter from "./category/category.router.js"
import subCategoryRouter from "./subcategory/subcategory.router.js"
import brandRouter from "./brand/brand.router.js"
import itemRouter from "./item/item.router.js"
import cartRouter from "./cart/cart.router.js"
import orderRouter from "./order/order.router.js"
import couponRouter from "./coupon/coupon.router.js"
import { globalErrorHandling } from '../services/errorhandling.js';
import connectDB from '../db/mongoose.js'
import express from "express"



export const appRouter = (app) => {

    app.use(express.json())

    const BaseURL = process.env.BASE_URL

    app.use(`${BaseURL}/auth`, authRouter)
    app.use(`${BaseURL}/subCategory`, subCategoryRouter)
    app.use(`${BaseURL}/category`, categoryRouter)
    app.use(`${BaseURL}/brand`, brandRouter)
    app.use(`${BaseURL}/item`, itemRouter)
    app.use(`${BaseURL}/cart`, cartRouter)
    app.use(`${BaseURL}/order`, orderRouter)
    app.use(`${BaseURL}/coupon`, couponRouter)

    app.use('*', (req, res) => {
        return res.json({ message: "In-Valid Routing" })
    })

    app.use(globalErrorHandling)
    connectDB()

}
