import mongoose from "mongoose";
const paymentSchema=new mongoose.Schema({
    orderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order"
    },
    razorpayOrderId:{
        type:String,
    },
    razorpayPaymentId:{
        type:String,
    },
    razorpaySignature:{
        type:String
    },
    amount: {
    type: Number,
  },
  currency:{
    type:String,
    default:'INR'
  },
  status: {
    type: String,
    default:"success"
  },
  createdAt:{
    type:Date,
    default:Date.now
  },
})
const Payment=mongoose.model("Payment",paymentSchema)
export default Payment