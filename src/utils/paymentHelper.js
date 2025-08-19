
import Razorpay from "razorpay";

import { configDotenv } from "dotenv";
// Razorpay
configDotenv('../../.env')

var instance = new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });


export const razorpayPayment = async ( orderId, totalPrice ) => {
        const id = ""+orderId
        const order = await instance.orders.create({
            amount: totalPrice*100,
            currency: "INR",
            receipt: id
        })
          return order
    }

