import express from "express"
import { createRestaurant,uploadRestaurant} from "../controllers/restaurantController.js"
import Restaurant from "../models/restaurant.js"
import upload from "../middlewares/multer.middleware.js"
const router=express.Router()
router.get("/restaurant/new",createRestaurant)
router.post("/restaurant/new",upload.single('Restaurant[image]'),uploadRestaurant)

router.get("/all",async(req,res)=>{
    //homepage
    try {
         const allRestaurants=await Restaurant.find().populate("foods")
        const restaurants=allRestaurants.filter((x)=>(x.isApproved==true))
        //  console.log(restaurants)
    res.render("res/restaurants.ejs",{restaurants})
    } catch (error) {
        console.log(error.message)
    }
})
router.get("/:id",async(req,res)=>{
try {
    const {id}=req.params
    const resData=await Restaurant.findOne({resId:id}).populate("foods")
    res.render("res/restaurant.ejs",{resData})
} catch (error) {
    res.status(500).json({
        message:error.message
    })
}  
})
export default router