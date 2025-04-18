import express from "express"
const router=express.Router()

router.get('/',(req,res)=>{
    // res.send("root route")
    res.render("home.ejs")
})
router.get("/services",(req,res)=>{
    res.render("services.ejs")
})
router.get("/menu",(req,res)=>{
    res.render("menu.ejs")
})



export default router