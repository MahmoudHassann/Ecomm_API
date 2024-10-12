import { Router } from "express";
import * as subcategory from './controller/subcategory.js'
import { fileValidation, myMulter } from "../../services/multer.js";
import Auth from '../../middleware/auth.js'
const  router = Router({mergeParams:true})

router.post('/',Auth,myMulter(fileValidation.image).single('image'),subcategory.addsubCategory)

router.put('/:id',Auth,myMulter(fileValidation.image).single('image'),subcategory.updatesubCategory)
router.delete('/:id',subcategory.deleteSubcategory)

router.get('/',subcategory.getAllsubCategories)
router.get('/:id',subcategory.getsubCategoryById)



export default router