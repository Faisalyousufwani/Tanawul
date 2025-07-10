import express from "express"
const router =express.Router({mergeParams:true})
import { getCart, getCartData } from "../controllers/cartController.js"

router.post("/",getCartData)
router.get("/", getCart)


export default router