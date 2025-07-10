import express from "express"
const router =express.Router()
import {  getCheckout, getCheckout2 } from "../controllers/checkoutController.js"

router.get("/", getCheckout)
//direct order checkout link
router.get("/:id",getCheckout2 );

export default router