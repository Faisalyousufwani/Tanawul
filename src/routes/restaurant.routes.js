import express from "express"
import { getRestaurantItems,createRestaurant,uploadRestaurant, getRestaurantProductsList, getRestaurantOrderList } from "../controllers/restaurantController.js"
import upload from "../middlewares/multer.middleware.js"
import { authMiddleware,authRole } from "../middlewares/auth.middleware.js"
import { getHomeRestaurants,getRestaurantAdminHome ,restaurantSalesReport} from "../controllers/restaurantController.js"
import { getOffers,editOffer,getEditOffer,cancelOffer,addOffer,getAddOffer } from "../controllers/offerController.js"
import { getSalesReport } from "../controllers/orderController.js"
import { applyProductOffer,getAddProducts,removeProductOffer,addProducts,deleteProduct,editProduct,getEditProdut,restoreProduct,deleteImage } from "../controllers/productController.js"
import { changeOrderStatus,adminOrderProducts } from "../controllers/orderController.js"
const router=express.Router()


router.get("/admin",authMiddleware,getRestaurantAdminHome)
router.get("/new",createRestaurant)
router.post("/new",authMiddleware, upload.single('Restaurant[image]'),uploadRestaurant)
router.get("/all",getHomeRestaurants)

// router.get( '/orders', authMiddleware,authRole('venddor'), getAdminOrderlist )
router.get("/orders",authMiddleware,getRestaurantOrderList)
router.patch( '/change-order-status', authMiddleware,authRole('vendor'), changeOrderStatus )
router.get( '/order-products/:id', authMiddleware,authRole('vendor'), adminOrderProducts )

router.get( '/offers', authMiddleware,authRole('vendor'), getOffers )
router.get( '/add-offer', authMiddleware,authRole('vendor'), getAddOffer )
router.post( '/add-offer', authMiddleware,authRole('vendor'), addOffer )
router.get( '/edit-offer/:id', authMiddleware,authRole('vendor'), getEditOffer )
router.post( '/edit-offer', authMiddleware,authRole('vendor'), editOffer )
router.patch( '/cancel-offer', authMiddleware,authRole('vendor'), cancelOffer )

router.patch( '/apply-product-offer', authMiddleware,authRole('vendor'), applyProductOffer )
router.patch( '/remove-product-offer', authMiddleware,authRole('vendor'), removeProductOffer )




router.get( '/sales-report', authMiddleware,authRole('vendor'), restaurantSalesReport )




router.get("/products",authMiddleware,authRole('vendor'),getRestaurantProductsList)//get foods
// router.get( '/products', authMiddleware,authRole('vendor'), getProductsList )
router.get("/add-products",authMiddleware,authRole('vendor'),getAddProducts)
router.post( '/add-products', authMiddleware,authRole('vendor'), upload.single('image'), addProducts )
router.get( '/delete-product/:id', authMiddleware,authRole('vendor'), deleteProduct )
router.get( '/restore-product/:id', authMiddleware,authRole('vendor'), restoreProduct )
router.get( '/edit-product/:id', authMiddleware,authRole('vendor'), getEditProdut )
router.post( '/edit-product', authMiddleware,authRole('vendor'), upload.single('image'), editProduct )
router.get( '/delete-image', authMiddleware,authRole('vendor'), deleteImage )

router.get("/:id",getRestaurantItems)//res itms of each  res
export default router