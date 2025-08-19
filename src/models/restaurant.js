import mongoose from "mongoose";
const restaurantSchema= new mongoose.Schema({
    resId:{type:String},
    title:{
        type:String,
        required:[true,'title is required']
    },
    imageLink:{
        type:String,
        default:" ",

    },
    foods:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
        }
    ],
    time:{
        type:String
    },
    isOpen:{
        type:Boolean,
    },
    contact:{
        type:Number,
        
    },
    
    rating:{
        type:Number,
        default:1,
        min:1,
        max:5,
    }
    ,ratingCount:{
        type:String
    }
    ,
    location:{
        id:{ type:String},
        latitude:{type:String},
        latitudeDelta:{type:String},
        longitude:{type:String},
        longitudeDelta:{type:String},
        address:{type:String},
        title:{type:String}
    },
    isApproved:{
        type:Boolean,
        default:false,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }
},{timestamps:true})

const Restaurant= mongoose.model("Restaurant",restaurantSchema)
export default Restaurant