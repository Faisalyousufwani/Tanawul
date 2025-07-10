import mongoose from "mongoose";
import Address from "./savedAddress.js"
const profileSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    profilePhoto:{
        type:String,//later add photo via multer server will send it to cloudinary and receive its link
        default:"https://tg-stockach.de/wp-content/uploads/2020/12/5f4d0f15338e20133dc69e95_dummy-profile-pic-300x300.png"
    },
    personalInfo:{
        firstName:{
            type:String,
            required:true,
        }
        ,
        lastName:{
            type:String,
    
        },
        contact:{
            type:Number,
            required:true,
            minLength:10['enter a valid number'],
            
        },
        bio:{
            type:String,
            default:" "
        },
        nickname:{
            type:String,
            default:" "
        }
    },
    savedAddresses:{
        type:mongoose.Schema.Types.ObjectId,
        ref:Address
    }
   
})

const Profile=mongoose.model("Profile",profileSchema)

export default Profile