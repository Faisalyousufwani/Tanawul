import express from "express"

import { doUserSignup,doUserLogin,doUserLogout,  verifyOtp} from "../controllers/authController.js"
import { SendOtpValidation } from "../services/send.otp.Service.js"
import User from "../models/user.model.js"
import { signUpValidation } from "../../config/order.validations.js"
const router = express()

router.get("/", (req, res) => {
    res.render("auth/register")
})
// router.post("/signup", signup)
router.post("/login", doUserLogin)
router.get("/logout", doUserLogout)
router.post("/sentOtp", async (req, res) => {
    const { email } = req.body
    const result=SendOtpValidation(email)
    console.log(result+"result")
    res.json({
        message: "otp sent"
    })
})
router.post("/verify", verifyOtp)
router.post("/signup",signUpValidation,doUserSignup)
router.get("/forget-password",async(req,res)=>{
    res.render("auth/forget-password")
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
    } catch (error) {
    }
})
export default router