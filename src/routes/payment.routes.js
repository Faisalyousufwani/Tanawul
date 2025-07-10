import express from "express"
import { processPayment,verifyPayment } from "../controllers/paymentController.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { validationRegistration } from "../../config/order.validations.js"

const router=express.Router()

router.post('/process',validationRegistration,processPayment)
router.post('/verify',verifyPayment)
export default router