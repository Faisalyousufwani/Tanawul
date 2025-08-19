
import Restaurant from "../models/restaurant.js"
import Item from "../models/items.js"
import fs from "fs"
import User from "../models/user.model.js"
import Order from "../models/order.model.js"
import Profile from "../models/user.profile.model.js"
import cloudinary from "../../config/cloudinary.js"
import { cancelOrderService, changeStatusService, orderInfoService } from "../services/admin.order.Service.js"
import { validationResult } from "express-validator"


export const restaurantAdmin = async (req, res) => {
    //res admin page method 2
    const { id } = req.user
    const myRes = await Restaurant.find({ owner: id }).populate("foods")
    // console.log(restaurantCuisines+"admin cuisnes")
    // res.send(myRes)
    // res.render('res/restaurantAdmin.ejs',{restaurantAdmin:myRes})
    res.render("res/restaurantAdmin.ejs", {
        stats: {},
        recentOrders: [],
        title: 'Dashboard-Tanawul Admin',
        user: req.session.adminUser,
        restaurantAdmin: myRes
    })
}
export const addCuisines = async (req, res) => {
   
    const { id } = req.user
    const { foods } = req.body.Restaurant
    // const errors = validationResult(req)
    // console.log(errors)
    // if (!errors.isEmpty()) {
    //     let messages = " "
    //     // errors.array().forEach((err)=>{messages+err.msg})
    //     errors.array().forEach(err => { messages += err.msg + "," })
    //     req.flash("error", messages)
    //     return res.redirect("/restaurant")
    // }
    const filePath = req.file.path
    const result = await cloudinary.uploader.upload(filePath, {
        folder: "food images",
    })
    fs.unlinkSync(filePath)
    const resultLink = result.secure_url;
    const newCuisine = new Item({ name: foods.name, price: foods.price, category: foods.category, imageLink: resultLink })
    const cuisineId = await newCuisine.save()

    const updatedRes = await Restaurant.findOneAndUpdate({ owner: id }, { $addToSet: { foods: cuisineId } }, { new: true })
    req.flash('success', 'food added successfully')
    res.redirect("/restaurant/cuisines")
    // console.log(errors)
    // return res.send("hello")

    // }
    // return res.json({
    //     success:false,
    //     errors:errors
    // })


}
export const getFoods = async (req, res) => {
    //foods
    const { id } = req.user
    const cuisines = await Restaurant.findOne({ owner: id }).select('foods').populate("foods")
    res.render("res/resCuisines.ejs", {
        stats: {},
        recentOrders: [],
        title: 'Dashboard-Tanawul Admin',
        user: req.session.adminUser,
        cuisines
    })

}
export const addFoods = async (req, res) => {
    res.render("res/addCuisines.ejs", {
        stats: {},
        recentOrders: [],
        title: 'Dashboard-Tanawul Admin',
        user: req.session.adminUser,
    })
}

export const newOrders = async (req, res) => {
    const { id } = req.user
    const myRes = await Restaurant.findOne({ owner: id })
    // console.log(myRes.resId)
    const resId = myRes.resId
    const orders = await Order.find({ "userItem.resId": resId }).populate("userItem.itemId").sort({ orderDate: -1 });

    // res.send(orders)
    res.render("res/adminOrders.ejs", {
        stats: {},
        recentOrders: [],
        title: 'Dashboard-Tanawul Admin',
        user: req.session.adminUser,
        orderData: orders
    })
}

export const resOrders = async (req, res) => {
    //res orders
    const { id } = req.user
    const myRes = await Restaurant.findOne({ owner: id })
    // console.log(myRes.resId)
    const resId = myRes.resId
    const orders = await Order.find({ "userItem.resId": resId }).populate("userItem.itemId")

    // res.send(orders)
    res.render("res/adminOrders.ejs", {
        stats: {},
        recentOrders: [],
        title: 'Dashboard-Tanawul Admin',
        user: req.session.adminUser,
        orderData: orders
    })
}
export const resOrderDetail = async (req, res) => {
    const { id } = req.params
    const customerId = req.user.id; //need user id / or something to fetch profile details
    console.log(id, customerId)
    const { orderDetails, profileDetails } = await orderInfoService(id, customerId)
    console.log(orderDetails)
    res.render("admin/orderDetails.ejs", {
        stats: {},
        recentOrders: [],
        title: 'Dashboard-Tanawul Admin',
        user: req.session.adminUser,
        orderDetails, profileDetails
    })
}

export const changeStatus = async (req, res) => {
    try {
        const orderId = req.params.id
        const { status } = req.body
        const userId = req.user.id
        changeStatusService(orderId, status, userId)
    } catch (error) {
        console.log(error.message)
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

export const cancelOrder = async (req, res) => {
    const { id } = req.params
    cancelOrderService(id)
    res.redirect("/restaurant/orders")
}
