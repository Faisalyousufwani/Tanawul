import mongoose from "mongoose";
const itemSchema= new mongoose.Schema({
    category:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,

    },
    price:{
        type:Number,
        required:true,
    },
    imageLink:{
        type:String,
        required:true,

    }
})

const Item= mongoose.model("Item",itemSchema)
export default Item