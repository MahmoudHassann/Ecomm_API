import { Router } from "express";
import * as brand from './controller/brand.js'
import { fileValidation, myMulter } from "../../services/multer.js";
import Auth from '../../middleware/auth.js'
const router = Router()

router.post('/',Auth,myMulter(fileValidation.image).single('image'),brand.addBrand)

router.put('/:id',Auth,myMulter(fileValidation.image).single('image'),brand.updateBrand)
router.get('/',brand.getBrands)



export default router