import Restaurant from "../models/restaurant.js"
import Item from "../models/items.js"
import User from "../models/user.model.js"
import cloudinary from "../../config/cloudinary.js"

import path from "path"
import fs from "fs"
import { v4 as uuidv4 } from 'uuid'

export const uploadRestaurant = async (req, res) => {
    try {
        
        const userId = req.user.id

        console.log(userId + "userId")
        const { title, location, isOpen, rating, ratingCount, time, contact } = req.body.Restaurant
        const owner = await User.findById(userId)
        if (owner.role == 'vendor') {
            req.flash("error", "you have already added your restaurant")
            return res.redirect("/")
        }
        //    console.log(foods)
        if (!title || !location || !contact) {
            return res.status(500).json({
                success: false,
                message: "please provide title and location"
            })
        }
        // console.log(req.file)
        const filePath = req.file.path
        const result = await cloudinary.uploader.upload(filePath, {
            folder: "res images",
        })
        fs.unlinkSync(filePath)
        const resultLinks = {
            url: result.secure_url,
            public_id: result.public_id
        }

        // getResLinks(resultLinks)

        const newRes = new Restaurant({
            resId: uuidv4(), title, time, isOpen, rating, ratingCount, "location.address": location, contact, imageLink: resultLinks.url, owner: owner
        })
        // console.log(newRes+"newRes")

        await newRes.save()
        // console.log(resultLinks.url)
        req.flash("success", "successfully registered")
        // res.status(201).json({
        //     success:true,
        //     message:"new restaurant added"
        // })
        res.redirect("/")

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

export const editRestaurant = async () => {
    //admin route
    try {
        const { id } = req.params

        const { Restaurant } = req.body
        const restaurant = await Restaurant.findOne({ resId: id })
        if (!restaurant) {
            req.flash("error", "restaurant not found")
            return res.redirect("/restaurant/admin")

        }

    } catch (error) {

    }
}
export const createRestaurant = async (req, res) => {
    res.render("res/addRestaurant.ejs")
}





