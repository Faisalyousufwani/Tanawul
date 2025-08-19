import mongoose from "mongoose"

const Schema = mongoose.Schema

const wishlistSchema = Schema({
    
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true
    },

    products :[{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'product',
        required : true
    }]
})
const WishList=mongoose.model("Wishtlist",wishlistSchema)
export default WishList