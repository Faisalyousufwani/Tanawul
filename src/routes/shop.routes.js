import express from "express"
import {addToWishList,getWishList,removeItem} from "../controllers/wishlistController.js"
import {getCart,addToCart,decCart,removeCartItem} from "../controllers/cartController.js"
import {getConfirmOrder, verifyPayment,getConfirmOrder2,placeOrder} from "../controllers/orderController.js"
import {getCheckout,getCheckoutAddAddress,checkoutAddAddress,getHome,getShop,getSingleProduct,searchSuggestion} from "../controllers/shopController.js"
import { authMiddleware } from "../middlewares/auth.middleware.js";

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
router.get( '/confirm-order/:razorpayOrderId', authMiddleware, getConfirmOrder2)
router.get( '/confirm-order/', authMiddleware, getConfirmOrder)
router.post( '/apply-coupon',  authMiddleware,  applyCoupon)

router.post( '/verify-payment',authMiddleware,  verifyPayment)


export default router