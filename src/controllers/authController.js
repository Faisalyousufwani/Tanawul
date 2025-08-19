import User from "../models/user.model.js"
import Otp from "../models/user.otp.js";
// import { signup } from "../services/user.register.Service.js";
import { validationResult } from "express-validator";

export const doUserSignup = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        // return res.send(errors)
        let messages = " "
        // errors.array().forEach((err)=>{messages+err.msg})
        errors.array().forEach(err => { messages += err.msg + "," })
        req.flash("error", messages)
        return res.redirect("/auth")
    }
    const { email, password } = req.body
    // console.log(otp+"otp")
    const checkOtp = await Otp.findOne({ email })
    // console.log(checkOtp)
    if (!checkOtp.verified) {
        req.flash("error", "verify your otp first")
        return res.redirect('/auth')
    }
    const role = 'customer'
    try {
        const user = await User.findOne({ email })
        if (user) {
            req.flash("error", "user already exists")
            return res.redirect("/auth")//redirect to same route from which request was send
        }
        const newUser = new User({ email, password, role })
        await newUser.save()
        // console.log(newUser)

        const token = newUser.generateJwt()
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 3600000//1 hr
        })
        console.log(token)
        req.flash("success", "signUp successfull , Order now!!")
        return res.redirect("/")
    } catch (error) {
        res.status(500).json({
            message: "something went wrong",
            error: error.message
        })
    }

}

export const doUserLogin = async (req, res) => {
    const { password, email } = req.body
    try {
        const user = await User.findOne({ email })
        if (!user) {
            req.flash("error", "please enter valid credntials")
            return res.redirect("/auth")
        }
        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            req.flash("error", "please enter valid credentials")
            return res.redirect("/auth")
        }
        const token = user.generateJwt()
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 3600000//1 hr
        })
        // console.log(token)
        req.flash("success", " login success  welcome to Tanawul!")
        res.redirect("/")//generalMiddleware will run again on homepage and will check if token cookie is true or false accordingly
        // res.render("home.ejs")  
        // res.render("home.ejs")//flash not visible on render
    }
    catch (err) {
        res.status(500).json({
            message: "something went wrong",
            error: err.message
        })
    }

}

export const doUserLogout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,       // required if the cookie was set with secure: true
        sameSite: 'Strict', // match this to how it was set
    });
    req.flash("success", "logged out successfully ")
    res.redirect("/")
    //   res.status(200).json({ message: 'Logged out successfully' });

}
export const verifyOtp = async (req, res) => {
    const { otp } = req.body
    const record = await Otp.findOne({ otp });
    if (!record) {
        return res.status(400).json({ message: 'Invalid OTP' });
    }
    if (record.expiresAt < new Date()) {
        return res.status(400).json({ message: 'OTP expired' });
    }
    if (record.verified) {
        return res.status(400).json({ message: 'OTP already used' });
    }
    record.verified = true;
    await record.save();
    res.json({
        message: "success"
    })
}