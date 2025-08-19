import mongoose from "mongoose"

const Schema = mongoose.Schema

const offerSchema = Schema({
    name : {
        type : String,
        required : true
    },

    startingDate : {
        type : Date,
        required : true
    },

    expiryDate : {
        type : Date,
        required : true
    },

    percentage : {
        type : Number,
        required : true
    },
    status : {
        type : Boolean, 
        default : true
    }

})

const Offer = mongoose.model("Offer",offerSchema)
export default Offer