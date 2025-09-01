import express from "express"
import {getAdminHome,getUserList} from "../controllers/adminController.js"
import {getProductsList,getAddProducts,addProducts,deleteProduct,restoreProduct,getEditProdut,editProduct} from "../controllers/productController.js"
import {getCategory,addCategory,getEditCategory,editCategory,listCategory,unlistCategory,applyCategoryOffer,removeCategoryOffer} from "../controllers/categoryController.js"
import {getAdminOrderlist,changeOrderStatus,adminOrderProducts,getSalesReport} from "../controllers/orderController.js"
import {getCoupon,editCoupon,getAddCoupon,addCoupon,getEditCoupon,cancelCoupon} from "../controllers/couponController.js"
import { authMiddleware,authRole } from "../middlewares/auth.middleware.js"
import { getRestaurantList,approveRestaurant,blockRestaurant } from "../controllers/restaurantController.js"

import upload from "../middlewares/multer.middleware.js"

const router = express.Router()

// Routes 


// router.get( '/logout', authMiddleware )

router.get("/restaurant-list",authMiddleware,authRole('admin'),getRestaurantList)
router.get("/restaurant/approve/:id",authMiddleware,authRole('admin'),approveRestaurant)
router.get("/restaurant/block/:id",authMiddleware,authRole('admin'),blockRestaurant)

router.get( '/', authMiddleware,authRole('admin'), getAdminHome )

router.get( '/userList', authMiddleware,authRole('admin'), getUserList )



router.get( '/category', authMiddleware,authRole('admin'), getCategory )
router.post( '/add-category', authMiddleware,authRole('admin'), addCategory )
router.get( '/edit-category/:id', authMiddleware,authRole('admin'), getEditCategory )
router.post( '/edit-category', authMiddleware,authRole('admin'), editCategory )
router.get( '/list-category/:id', authMiddleware,authRole('admin'), listCategory )
router.get( '/unlist-category/:id', authMiddleware,authRole('admin'), unlistCategory )

router.get( '/products', authMiddleware,authRole('admin'), getProductsList )
router.get( '/add-products', authMiddleware,authRole('admin'), getAddProducts )
router.post( '/add-products', authMiddleware,authRole('admin'), upload.array('image',4), addProducts )
router.get( '/delete-product/:id', authMiddleware,authRole('admin'), deleteProduct )
router.get( '/restore-product/:id', authMiddleware,authRole('admin'), restoreProduct )
router.get( '/edit-product/:id', authMiddleware,authRole('admin'), getEditProdut )
router.post( '/edit-product', authMiddleware,authRole('admin'), upload.array('image',4), editProduct )



router.get( '/orders', authMiddleware,authRole('admin'), getAdminOrderlist )
router.patch( '/change-order-status', authMiddleware,authRole('admin'), changeOrderStatus )
router.get( '/order-products/:id', authMiddleware,authRole('admin'), adminOrderProducts )

router.get( '/coupons', authMiddleware,authRole('admin'), getCoupon )
router.get( '/add-coupon', authMiddleware,authRole('admin'), getAddCoupon )
router.post( '/add-coupon', authMiddleware,authRole('admin'), addCoupon )
router.get( '/edit-coupon/:id' ,authMiddleware,authRole('admin'), getEditCoupon )
router.post( '/edit-coupon', authMiddleware,authRole('admin'), editCoupon )
router.patch( '/cancel-coupon', authMiddleware,authRole('admin'), cancelCoupon )


router.patch( '/apply-category-offer', authMiddleware,authRole('admin'),  applyCategoryOffer )
router.patch( '/remove-category-offer', authMiddleware,authRole('admin'),  removeCategoryOffer )

router.get( '/sales-report', authMiddleware,authRole('admin'), getSalesReport )



export default router