import express, { json } from "express";
import Order from "../models/user.orders.js";
import { placeOrder,userOrders, orderInfo } from "../controllers/orderController.js";
import { validationRegistration } from "../../config/order.validations.js";
const router = express.Router();

//order placing via cart
router.post("/",validationRegistration, placeOrder );
//order direct placing
// router.post("/:id",directOrder );
router.get("/", userOrders);
router.get("/:id",orderInfo)
router.put("/:id/cancel",async(req,res)=>{
  const{id}=req.params
  const user=req.user.id
  const order=await Order.findOne({_id:id,customerId:user})
  if(!order){
    req.flash("error","order not found")
    return res.redirect("/order")
  }
  if(order.status=="cancelled"){
    return res.send("already cancelled")
  }
  if(order.status=="shipped"){
    req.flash("error","order is shipped can't be cancelled")
    return res.redirect("/order")
  }
  order.status="cancelled"
  await order.save()
  req.flash("success","order cancelled")
  res.redirect("/order")
})





export default router;
