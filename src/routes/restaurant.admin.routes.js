import express from "express"
import { getFoods,addFoods, addCuisines,restaurantAdmin, resOrders, resOrderDetail, changeStatus, cancelOrder, newOrders } from "../controllers/restaurantAdminController.js"

import upload from "../middlewares/multer.middleware.js"
import { AddFoodValidation } from "../../config/order.validations.js"
const router=express.Router()

router.get("/",restaurantAdmin)
router.get("/cuisines",getFoods)//get foods
router.get("/cuisines/add",addFoods)//add foods page
router.post("/cuisines/add",AddFoodValidation,upload.single('Restaurant[foods][imageLink]'),addCuisines)//add foods

router.get("/orders",resOrders)
router.get("/orders/new",newOrders)
//order detail
router.get("/order/:id",resOrderDetail)
router.put("/order/:id/status",changeStatus)//change order status
//order cancel
router.put("/order/:id/cancel",cancelOrder)

export default router