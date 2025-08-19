import mongoose from "mongoose"

const Schema = mongoose.Schema

const cartSchema = Schema({
    
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true
    },

    items : [{
        productId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Product',
            required : true
        },

        quantity : {
            type : Number,
            default : 1
        }
    }],

    coupon : {
        type : mongoose.Schema.Types.ObjectId,
        requried : false
    }
})
const Cart=mongoose.model("Cart",cartSchema)
export default Cart