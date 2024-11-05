import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import {appRouter} from './modules/index.router.js'
dotenv.config({ path: './config/.env' });
import * as order from './modules/order/controller/order.js'

const port = process.env.PORT
const BaseURL = process.env.BASE_URL
const app = express();
app.use(cookieParser());
app.use(cors({
  origin: 'https://bakery-e-comm.vercel.app/', // Frontend domain
  credentials: true,  // Allow credentials (cookies)
}));

app.post(`${BaseURL}/order/webhook`, express.raw({ type: 'application/json' }), order.webHook);
appRouter(app)






app.listen(port, () => {
  console.log(`server listening on port ${port}`)
})