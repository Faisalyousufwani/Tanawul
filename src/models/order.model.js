
import mongoose from "mongoose"

const Schema = mongoose.Schema

const orderSchema = Schema({

    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },

    products : [{
        productId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Product',
            required : true
        },
        quantity : {
            type : Number,
            required : true
        },
        price : {
            type : Number,
            required : true
        }
    }],

    totalPrice : {
        type : Number,
        required : true
    },

    paymentMethod : {
        type : String,
        required : true
    },

    walletUsed : {
        type : Number,
        required : false
    },

    amountPayable : {
        type : Number,
        required : false
    },

    orderStatus : {
        type : String,
        default : 'Pending'
    },

    address : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Address',
        required : true
    },

    date : {
        type : Date,
        default : Date.now
    },


})
const Order=mongoose.model("Order",orderSchema)
export default Order