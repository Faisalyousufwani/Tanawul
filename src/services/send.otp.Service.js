import nodemailer, { createTransport, } from "nodemailer"
import dotenv, { configDotenv } from "dotenv"
import Otp from "../models/user.otp.js"

dotenv.config({ path: "../../.env" })
export const SendOtpValidation=(to)=>{
    let OTP="";
    const transporter = createTransport({
    // host: "smtp.ethereal.email",
    service: "gmail",
    //   port: 587,
    //   secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.USER_MAIL,
        pass: process.env.PASS,
    },
})
const otpGenerate = () => {
    let digits = "01234567890"
    let otp = ''
    let otpLength = digits.length
    for (let i = 0; i < 6; i++) {
        otp += digits[Math.floor(Math.random() * otpLength)]
    }
    OTP=otp
}
otpGenerate()
const expiresAt = new Date(Date.now() + 5 * 60 * 1000);//5 mins expiry
const mailOptions = {

    to: to,
    subject: "no-reply",
    text: "your one time password is:" + OTP,
}
transporter.sendMail(mailOptions, async(err, info) => {
    if (err) {
        console.log("error" + err);
        // throw new Error("can't send the Otp")
    }
    else {
        console.log("email sent")
        await Otp.deleteMany({email:to})//deletes existing otps before moving to create new otp in database
        const newOtp= new Otp({email:to,otp:OTP,expiresAt:expiresAt})
        await newOtp.save()
    
    }
})

}

// console.log(process.env.USER_MAIL)