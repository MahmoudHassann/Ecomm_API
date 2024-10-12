import * as authController from "./controller/auth.js"
import { Router } from "express";
import Auth from '../../middleware/auth.js'

const router = Router()

router.post("/signup", authController.signup)
router.post("/refresh-token", authController.refreshToken)
router.get("/confirmEmail/:token", authController.confirmEmail)
router.post("/signin", authController.signin)
router.post("/logout",Auth, authController.logout)
router.post("/logoutall",Auth, authController.logoutAll)

export default router