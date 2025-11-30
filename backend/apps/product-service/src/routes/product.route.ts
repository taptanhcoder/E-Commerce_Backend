import {Router} from "express"
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from "../controllers/product.controller.js";


const router: Router = Router();


router.post("/",createProduct);
router.put("/:id",updateProduct);
router.delete("/:id",deleteProduct);
router.get("/",getProduct);
router.get("/",getProducts);


export default router
