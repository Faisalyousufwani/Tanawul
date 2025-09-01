
import Razorpay from "razorpay";
import { configDotenv } from "dotenv";
configDotenv('../.env')
export const createRazorpayInstance=()=>{
return new Razorpay(
    {
        key_id:process.env.RAZORPAY_KEY_ID,
        key_secret:process.env.RAZORPAY_KEY_SECRET
    }
)
}