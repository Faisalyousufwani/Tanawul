import mongoose from "mongoose"
const Schema = mongoose.Schema

const categorySchema = Schema({
    category : {
        type : String,
        required : true
    },

    status : {
        type : Boolean,
        required : true,
        default : true
    },

    offer : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'Offer'
    }
})
const Category= mongoose.model("Category",categorySchema)
export default Category