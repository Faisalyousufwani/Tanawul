 import express from "express"
import {getUserProfile,editProfile,getAddAddress,getEditAddress,removeAddress,addToWallet,getWalletHistory,razorpayVerifyPayment,getAddress,addAddress,editAddress}from "../controllers/userController.js"
import {getOrders,userCancelOrder,userOrderProducts,returnOrder} from "../controllers/orderController.js"

const router=express.Router()
 router.get( '/profile',  getUserProfile )
 router.put( '/edit-profile',  editProfile )

 router.get( '/address',  getAddress )
 router.get( '/add-address',  getAddAddress )
 router.post( '/add-address',  addAddress)
 router.get( '/edit-address/:id',  getEditAddress )
 router.post( '/edit-address',  editAddress )  
 router.patch( '/remove-address/:id',  removeAddress )
 
 router.get( '/orders',   getOrders )  
 router.patch( '/cancel-order',   userCancelOrder )  
 router.get( '/view-order-products/:id',   userOrderProducts )  

 router.get( '/wallet',  getWalletHistory )
 router.post( '/add-to-wallet',  addToWallet )
 router.post( '/verify-payment',  razorpayVerifyPayment )

router.patch( '/return-order',   returnOrder )

export default router