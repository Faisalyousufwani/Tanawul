import express from "express"
import mongoose from "mongoose"

const connectDB=async()=>{
    try {
        await mongoose.connect('mongodb://localhost:27017/tanawul')
    } catch (error) {
        console.log("something went wrong ",error.message)
    }
   
}
export default connectDB