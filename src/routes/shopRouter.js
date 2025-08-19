import express from "express"
import Coupon from "../models/couponModel.js"
// import { ApCoupon } from "../controllers/couponController.js"
import {addToWishList,getWishList,removeItem} from "../controllers/wishlistController.js"
import {getCart,addToCart,decCart,removeCartItem} from "../controllers/cartController.js"
import {placeOrder,getConfirmOrder,razorpayVerifyPayment} from "../controllers/orderController.js"
import {getCheckout,getCheckoutAddAddress,checkoutAddAddress,getHome,getShop,getSingleProduct,searchSuggestion} from "../controllers/shopController.js"
import { authMiddleware,authRole } from "../middlewares/auth.middleware.js";
import exp from "constants"
import { applyCoupon } from "../controllers/couponController.js"



const router = express.Router();

// Routers
router.get( '/', getHome )

router.get( '/shop', getShop )
router.get( '/products/:id', getSingleProduct)
router.get( '/search-suggestion', searchSuggestion )

router.get( '/cart',authMiddleware,  getCart )
router.post( '/add-to-cart',authMiddleware, addToCart )
router.post( '/decrease-cart',authMiddleware, decCart )
router.patch( '/removeCartItem',authMiddleware,  removeCartItem )

router.post( '/add-to-wishlist',authMiddleware,  addToWishList )
router.get ( '/wishlist',authMiddleware, getWishList )
router.put( '/remove-wishlist-item',authMiddleware,  removeItem )

router.get( '/checkout',authMiddleware,  getCheckout )
router.get( '/add-checkout-address',authMiddleware,  getCheckoutAddAddress)
router.post( '/add-checkout-address', authMiddleware, checkoutAddAddress)

router.post( '/place-order',authMiddleware,  placeOrder )
router.get( '/confirm-order', authMiddleware, getConfirmOrder)

router.post( '/apply-coupon',  authMiddleware,  applyCoupon)

router.post( '/verify-payment',authMiddleware,  razorpayVerifyPayment)


export default router