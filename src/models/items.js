import mongoose from "mongoose";
const itemSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    imageLink:{
        type:String,
        default:""

    }
})

const Item= mongoose.model("Item",itemSchema)
export default Item