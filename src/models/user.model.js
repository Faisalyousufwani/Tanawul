import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import Profile from "./user.profile.model.js";

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        lowecase:true,
    },
    password:{
        type:String,
        required:true,
        minLength:[8,"password must be 8 characters long"],
    },
    role:{
        type:String,
        enum:['customer','admin','vendor'],
        default:"customer",
    }


},{timestamps:true})
 
userSchema.pre("save",async function(next){
    if(!this.isModified('password')) return next();
    this.password=await bcrypt.hash(this.password,10)
    next()
    
})
userSchema.methods.comparePassword=async function(userPassword){
    return  bcrypt.compare(userPassword,this.password)
}
userSchema.methods.generateJwt=function(){
    return jwt.sign({
        id:this._id,role:this.role},
        process.env.JWT_secret,{expiresIn:"1h"}
    )

}
userSchema.post('findOneAndDelete',async(user)=>{
    if(user){
        await Profile.deleteOne({userId:user._id})
    }

    
})
// userSchema.post('findA',async(user)=>{
//     if(user){
//         await Order.deleteMany({customerId:user._id})
//     }

    
// })
const User=mongoose.model("User",userSchema)
export default User