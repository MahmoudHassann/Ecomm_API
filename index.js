import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import cookieParser from 'cookie-parser'
import {appRouter} from './modules/index.router.js'
dotenv.config({ path: './config/.env' });

const port = process.env.PORT
const app = express();
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:4200', // Frontend domain
  credentials: true,  // Allow credentials (cookies)
}));

appRouter(app)



// Session configuration
app.use(session({
  name: process.env.SESSION_COOKIE_NAME,
  secret: process.env.SUPER_SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URL,
    ttl: 60 * 60 * 24, // 1 day in seconds,
    touchAfter: 24 * 3600, // time period in seconds
    autoRemove: 'native' // Enable automatic removal of expired sessions
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day in milliseconds
    sameSite: 'strict'
  },
  rolling: true,
}));



app.listen(port, () => {
  console.log(`server listening on port ${port}`)
})