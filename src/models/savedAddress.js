import mongoose from "mongoose";
const addressSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    contact:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true,
    },
    city:{
        type:String,
        required:true,
    },
    pincode:{
        type:Number,
        minLength:6,
        required:true,

    },
    street:{
        type:String,
        required:true,
    },
    houseNumber:{
        type:String,
        required:true,
    },
    country:{
        type:String,
        default:"india"
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    isDefault:{
        type:Boolean,
        
    }

})

const Address= mongoose.model("Address",addressSchema)
export default Address