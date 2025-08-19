import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import Profile from "./user.profile.model.js";

const userSchema = new mongoose.Schema({
    name:{
        type:String
    },
    mobile: {
        type: Number
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowecase: true,
    },
    password: {
        type: String,
        required: true,
        minLength: [8, "password must be 8 characters long"],
    },
    role: {
        type: String,
        enum: ['customer', 'admin', 'vendor'],
        default: "customer",
    },
    profilePhoto: {
        type: String,//later add photo via multer server will send it to cloudinary and receive its link
        default: "ps://thttg-stockach.de/wp-content/uploads/2020/12/5f4d0f15338e20133dc69e95_dummy-profile-pic-300x300.png"
    },
    bio: {
        type: String,
        default: " "
    },
    nickname: {
        type: String,
        default: " "
    },
    address:[ {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address"
    }],
    isBlocked : {
        type : Boolean,
        default : false
    },

    joinedDate : {
        type : Date,
        default : Date.now
    },
    wallet : {
        type : Number,
        default : 0
    },

    walletHistory : [{
        date : {
            type : Date,
        },
        amount : {
            type : Number
        },
        message : {
            type : String
        }

    }],


}, { timestamps: true })

userSchema.pre("save", async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()

})
userSchema.methods.comparePassword = async function (userPassword) {
    return bcrypt.compare(userPassword, this.password)
}
userSchema.methods.generateJwt = function () {
    return jwt.sign({
        id: this._id, role: this.role
    },
        process.env.JWT_secret, { expiresIn: "1h" }
    )

}
userSchema.post('findOneAndDelete', async (user) => {
    if (user) {
        await Profile.deleteOne({ userId: user._id })
    }


})
// userSchema.post('findA',async(user)=>{
//     if(user){
//         await Order.deleteMany({customerId:user._id})
//     }


// })
const User = mongoose.model("User", userSchema)
export default User