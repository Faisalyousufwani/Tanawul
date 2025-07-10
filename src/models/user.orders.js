import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  userItem: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
      },
      quantity: {
        type: Number,
        requried: true,

      },
      resId:{
        type:String,
        required:true,
      }
    },
  ],

  address: {
    type: Object,
    requried: true,
  },
  customer:{
    type:Object,
    required:true,
  }
,
  paymentType: {
    type: String,
    default: "cod",
  },
  status: {
    type: String,
    enum:['order Placed','processing','shipped','delivered','cancelled',],
    default: "order Placed",
  },
  paymentStatus:{
    type:String,
    enum:['paid','pending','failed'],
    default:"pending"
  },
  orderDate: {
    type: Date,
    default: Date.now(),
  },
  TotalPrice: {
    type: String,
    required: true,
  },
  currency:{
    type:String,
    default:'INR'
  },
  razorpayOrderId:{
    type:String,
    // required:true removed for cash only delivery
  }, 
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
