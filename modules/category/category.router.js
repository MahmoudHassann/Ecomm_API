import { Router } from "express";
import * as category from './controller/category.js'
import { fileValidation, myMulter } from "../../services/multer.js";
import Auth from '../../middleware/auth.js'
import subCategoryRouter from '../subcategory/subcategory.router.js'
const router = Router()

router.use('/:categoryId/subCategory',subCategoryRouter)
router.post('/',Auth,myMulter(fileValidation.image).single('image'),category.addCategory)

router.put('/:id',Auth,myMulter(fileValidation.image).single('image'),category.updateCategory)

router.get('/',category.getAllCategories)
router.get('/:id',category.getCategoryById)


export default router