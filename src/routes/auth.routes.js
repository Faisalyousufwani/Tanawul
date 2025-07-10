import express from "express"

import { login, logout,  verifyOtp,  signup } from "../controllers/authController.js"
import { SendOtpValidation } from "../services/send.otp.Service.js"
import User from "../models/user.model.js"
import { signUpValidation } from "../../config/order.validations.js"


const router = express()

router.get("/", (req, res) => {
    res.render("register.ejs")
})
// router.post("/signup", signup)
router.post("/login", login)
router.get("/logout", logout)
//otp

router.post("/sentOtp", async (req, res) => {
    const { email } = req.body
    // const user=await User.findOne({email:email})
    // if(user){
    //     // console.log(user)
    //     // req.flash("error","user already exists")
    //     // return res.redirect("/auth")
    //     return res.json({
    //         message:"user already registered"
    //     })
    // }
    // console.log(email)
    const result=SendOtpValidation(email)
    console.log(result+"result")
    // req.flash("success","otp sent check your email")
    // res.redirect("/auth")
    res.json({
        message: "otp sent"
    })

})
router.post("/verify", verifyOtp)
router.post("/signup",signUpValidation,signup)
router.get("/forget-password",async(req,res)=>{
    res.render("forget-password")
})
router.post("/forget-password",async(req,res)=>{
    const {email,password,otp}=req.body
    try {
        
        const user=await User.findOne({email})
       
        if(!user){
            console.log("no user found")
            return res.json({
                message:"user does not exist"
        })
        }
        // verifyOtp(email,otp) //verified otp with sent otp
        user.password=password;
        await user.save()
        req.flash("success","password changed successfully login now!")
        res.redirect("/auth")
        // res.json({
        //     message:"successfully updated the password"
        // })
        
       
    } catch (error) {
        
    }
})
export default router