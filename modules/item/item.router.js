import { Router } from "express";
import * as item from './controller/item.js'
import { fileValidation, myMulter } from "../../services/multer.js";
import Auth from '../../middleware/auth.js'
const router = Router()

router.post('/',Auth,myMulter(fileValidation.image).array('images',5),item.addItem)

router.put('/:id',Auth,myMulter(fileValidation.image).array('images',5),item.updateItem)
router.get('/',item.getItems)
router.get('/:id',item.getItemById)



export default router