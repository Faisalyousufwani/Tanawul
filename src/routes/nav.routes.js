import express from "express"
import Item from "../models/items.js"
import Restaurant from "../models/restaurant.js"
import { checkLocation } from "../controllers/orderController.js"

const router=express.Router()

router.get('/',async(req,res)=>{
   const allRestaurants=await Restaurant.find().populate("foods")
        const restaurants=allRestaurants.filter((x)=>(x.isApproved==true))
    res.render("home.ejs",{restaurants})
})
router.get("/partner",(req,res)=>{
    res.send("page under maintenace")
})
router.get("/menu",async(req,res)=>{
    const allRestaurants=await Restaurant.find().populate("foods")
        const restaurants=allRestaurants.filter((x)=>(x.isApproved==true))
    // const allItems=await Item.find()
    // res.send(restaurants)
    res.render("menu.ejs",{item:restaurants})
    // res.render("menu.ejs")
})
router.get("/contact",(req,res)=>{
    res.render("contact.ejs")
})
router.post("/location/",(req,res)=>{
   
    const{userLocation}=req.body;
    try{
        if(!userLocation){
            req.flash("error","please enter a valid location")
            return res.redirect("/")
        }
        if(userLocation!="anantnag"){
          
            req.flash("error","sorry your area is not serviceable ")
            return res.redirect("/")
        }
        req.flash("success","yay! we are ready to serve you  see avialable restaurants")
            res.redirect("/menu")
    }
    catch(err){
        res.status(500).json({
            error:err.message,
            message:"something went wrong from server side"
        })
    }
})

router.post("/location/check", checkLocation)


export default router