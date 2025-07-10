import express from "express"
const router=express.Router()
import { admin, allCustomers, allOrders, approveRestaurant,cancelOrder,customerOrders,deleteCustomer,deleteOrder,deleteRestaurant, restaurantList } from "../controllers/adminController.js";
import { orderInfo } from "../controllers/orderController.js"

router.get("/",admin)
//order
//all orders
router.get("/order/all", allOrders);
router.get("/order/:id",orderInfo)
router.put("/order/:id/cancel",cancelOrder)
router.delete("/order/:id/delete",deleteOrder)

//customer
router.get("/customer/all",allCustomers)
//customer orders
//view order button
router.get("/customer/:id/orders",customerOrders)
router.delete("/customer/:id/delete",deleteCustomer)

//restaurant

router.delete("/restaurant/:resId",deleteRestaurant)
router.patch("/restaurant/:id",approveRestaurant)
router.get("/restaurant/list",restaurantList)

export default router