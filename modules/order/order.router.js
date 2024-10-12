import { Router } from "express";
import * as order from './controller/order.js'
import Auth from '../../middleware/auth.js'
import express from 'express';

const router = Router()

router.post('/',Auth,order.createOrder)
router.post('/webhook',order.webHook)



export default router