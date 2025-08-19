import mongoose from "mongoose"

const Schema = mongoose.Schema

const productSchema = Schema({

    name : {
        type : String,
        required : true
    },

    description : {
        type : String,
        // required : true
    },

    brand : {
        type : String, 
        // required : true
    },

    category : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Category', 
        required : true
    },

    quantity : {
        type : Number,
        required : true
    },

    price : {
        type : Number,
        required : true
    },

    image : {
        type : String,
        default:""
    }, 

    status : {
        type : Boolean,
        default : true
    },

    offer : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Offer'
    },
    restaurant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Restaurant'
    }

    
})
const Product = mongoose.model("Product",productSchema)
export default Product