
import fs from "fs"
import Restaurant from "../models/restaurant.js"
import User from "../models/user.model.js"
import Order from "../models/order.model.js"
import cloudinary from "../../config/cloudinary.js"
import Product from "../models/productModel.js"
import { getRestaurantDashboard, getRestaurantRevenue, } from "../utils/resDashboardHelper.js"
import Offer from "../models/offerModel.js"
import { PRODUCT_PER_PAGE, ORDER_PER_PAGE,SALES_PER_PAGE } from "../utils/paginationHelper.js"



export const restaurantSalesReport = async (req,res) => {
    const { id } = req.user
    const owner = await Restaurant.findOne({ owner: id })
    const product = await Product.find({ restaurant: owner._id })
    const condition = { "product.productId": owner.foods }
    const { from, to, seeAll, sortData, sortOrder } = req.query
    let page = Number(req.query.page);
    if (isNaN(page) || page < 1) {
        page = 1;
    }
    const conditions = { "product.productId": owner.foods }
    if (from && to) {
        conditions.date = {
            $gte: from,
            $lte: to
        }
    } else if (from) {
        conditions.date = {
            $gte: from
        }
    } else if (to) {
        conditions.date = {
            $lte: to
        }
    }
    const sort = {}
    if (sortData) {
        if (sortOrder === "Ascending") {
            sort[sortData] = 1
        } else {
            sort[sortData] = -1
        }
    } else {
        sort['date'] = -1
    }


    const orderCount = await Order.countDocuments(conditions)
    const limit = seeAll === "seeAll" ? orderCount : SALES_PER_PAGE;
    const orders = await Order.find(conditions)
        .sort(sort).skip((page - 1) * ORDER_PER_PAGE).limit(limit)
    res.render('res/admin/sales-report', {
        admin: true,
        orders: orders,
        from: from,
        to: to,
        seeAll: seeAll,
        currentPage: page,
        hasNextPage: page * SALES_PER_PAGE < orderCount,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: Math.ceil(orderCount / SALES_PER_PAGE),
        sortData: sortData,
        sortOrder: sortOrder
    })
}
export const getRestaurantList = async (req, res) => {
    const { search, sortData, sortOrder } = req.query
    let page = Number(req.query.page);
    if (isNaN(page) || page < 1) {
        page = 1;
    }
    const sort = {}
    const condition = {}
    if (sortData) {
        if (sortOrder === "Ascending") {
            sort[sortData] = 1
        } else {
            sort[sortData] = -1
        }
    }
    if (search) {
        condition.$or = [
            { name: { $regex: search, $options: "i" } },
            { brand: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ]
    }
    try {
        const restaurantCount = await Restaurant.find(condition).countDocuments()
        const allRestaurants = await Restaurant.find(condition).populate({ path: "foods" }).populate("owner")
            .sort(sort)
            .skip((page - 1) * PRODUCT_PER_PAGE).limit(PRODUCT_PER_PAGE)
        res.render("admin/restaurantList.ejs", {

            admin: true,
            currentPage: page,
            hasNextPage: page * PRODUCT_PER_PAGE < restaurantCount,
            hasPrevPage: page > 1,
            nextPage: page + 1,
            prevPage: page - 1,
            lastPage: Math.ceil(restaurantCount / PRODUCT_PER_PAGE),
            search: search,
            sortData: sortData,
            sortOrder: sortOrder,
            restaurants: allRestaurants
        })
    } catch (error) {
        console.log(error)
    }
}

export const blockRestaurant = async (req, res) => {
    try {
        await Restaurant.updateOne({ _id: req.params.id }, { $set: { isApproved: false } })
        res.redirect("/admin/restaurant-list")
    } catch (error) {
        console.log(error)
    }
}
export const approveRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ _id: req.params.id }).populate("owner")
        await Restaurant.updateOne({ _id: req.params.id }, { $set: { isApproved: true } })
        await User.findByIdAndUpdate(restaurant.owner._id, { $set: { role: 'vendor' } }, { new: true })
        res.redirect("/admin/restaurant-list")
    } catch (error) {
        console.log(error)
    }
}


export const getRestaurantOrderList = async (req, res) => {
    try {
        const { id } = req.user
        const owner = await Restaurant.findOne({ owner: id })
        const product = await Product.find({ restaurant: owner._id })
        // const resOrders=getOrdersOfRestaurant(owner._id)
        const { sortData, sortOrder } = req.query
        const condition = { "product.productId": owner.foods }
        let page = Number(req.query.page);
        if (isNaN(page) || page < 1) {
            page = 1;
        }
        const sort = {}
        if (sortData) {
            if (sortOrder === "Ascending") {
                sort[sortData] = 1
            } else {
                sort[sortData] = -1
            }
        } else {
            sort['date'] = -1
        }
        const ordersCount = await Order.find(condition).countDocuments()
        const orders = await Order.find(condition)
            .sort(sort).skip((page - 1) * ORDER_PER_PAGE).limit(ORDER_PER_PAGE)
            .populate('userId').populate('product.productId').populate('address')
        res.render('res/admin/orders', {
            orders: orders,
            admin: true,
            currentPage: page,
            hasNextPage: page * ORDER_PER_PAGE < ordersCount,
            hasPrevPage: page > 1,
            nextPage: page + 1,
            prevPage: page - 1,
            lastPage: Math.ceil(ordersCount / ORDER_PER_PAGE),
            sortData: sortData,
            sortOrder: sortOrder
        })
    } catch (error) {
        console.log(error)

    }
}





export const getHomeRestaurants = async (req, res) => {
    //homepage
    try {
        const allRestaurants = await Restaurant.find().populate("foods")
        const restaurants = allRestaurants.filter((x) => (x.isApproved == true))
        //  console.log(restaurants)
        res.render("res/restaurants.ejs", { restaurants })
    } catch (error) {
        console.log(error.message)
    }
}

export const uploadRestaurant = async (req, res) => {
    try {
        const userId = req.user.id
        if (!userId) {
            req.flash("error", "please login first")
            return res.redirect("/")
        }
        // console.log(userId + "userId")
        const { title, location, time, contact } = req.body.Restaurant
        const owner = await User.findById(userId)
        if (owner.role == 'vendor') {
            req.flash("error", "you have already added your restaurant")
            return res.redirect("/")
        }
        //    console.log(foods)
        if (!title || !location || !contact) {
            req.flash("error", "please provide title and location")
            return res.redirect("/restaurant/new")
        }
        const filePath = req.file.path
        const result = await cloudinary.uploader.upload(filePath, {
            folder: "res images",
        })
        fs.unlinkSync(filePath)
        const resultLinks = {
            url: result.secure_url,
            public_id: result.public_id
        }
        const newRes = new Restaurant({
         title, time, "location.address": location, contact, imageLink: resultLinks.url, owner: owner
        })
        // console.log(newRes+"newRes")
        await newRes.save()
        // console.log(resultLinks.url)
        req.flash("success", "successfully registered")
        res.redirect("/")
    } catch (error) {
        console.log(error)
        req.flash("error", "server error ")
    }
}
export const createRestaurant = async (req, res) => {
    res.render("res/addRestaurant.ejs")
}

//get single restaurant items
export const getRestaurantItems = async (req, res) => {
    try {
        const { id } = req.params
        const restaurant = await Restaurant.findOne({ _id: id })
        const products=await Product.find({restaurant:restaurant._id})
         .populate({
                        path : 'offer',
                        match :  { startingDate : { $lte : new Date() }, expiryDate : { $gte : new Date() }}
                    })
                    .populate({
                        path : 'category',
                        populate : {
                            path : 'offer',
                            match : { startingDate : { $lte : new Date() }, expiryDate : { $gte : new Date() }}
                        }
                    })
        res.render("res/restaurantItems", { products: products })
    } catch (error) {
        console.log(error)
    }


}







export const getRestaurantAdminHome = async (req, res) => {
    const { id } = req.user
    try {
       
        const today = new Date();
        today.setHours(0, 0, 0, 0)
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentMonthStartDate = new Date(currentYear, currentMonth, 1, 0, 0, 0);
        const previousMonthStartDate = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0);
        const previousMonthEndDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
 
        const{incomeToday,ordersToShip,productCount,completedOrders}=await getRestaurantDashboard(id,today,now)
        const{monthlyRevenue,totalRevenue}=await getRestaurantRevenue(id,currentMonthStartDate, now)
        const admin = await User.findOne({ _id: id })
       

       
        // console.log(admin) 
        res.render('res/admin/dashboard', {
            admin: admin,
            todayIncome: incomeToday,
            totalRevenue: totalRevenue,
            revenueCurrentMonth: monthlyRevenue,
            ordersToShip: ordersToShip,
            completedOrders: completedOrders,
            productCount: productCount,
          
        })
    } catch (error) {
        // res.redirect('/500')
        console.log(error)

    }

}
export const getRestaurantProductsList = async (req, res) => {
    try {
   
        const { id } = req.user
        const vendor = await User.findOne({ _id: id })
    
        const restaurant = await Restaurant.findOne({ owner: vendor._id })
        
        const { search, sortData, sortOrder } = req.query
        let page = Number(req.query.page);
        if (isNaN(page) || page < 1) {
            page = 1;
        }
        const sort = {}
        const condition = { restaurant: restaurant._id }
        if (sortData) {
            if (sortOrder === "Ascending") {
                sort[sortData] = 1
            } else {
                sort[sortData] = -1
            }
        }
        if (search) {
            condition.$or = [
                { name: { $regex: search, $options: "i" } },
                { brand: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ]
        }
        const availableOffers = await Offer.find({ status: true, expiryDate: { $gte: new Date() } })
        const productsCount = await Product.find(condition).countDocuments()
        const products = await Product.find(condition).populate('category').populate('offer')
            .sort(sort)
        // .skip(( page - 1 ) * PRODUCT_PER_PAGE ).limit( PRODUCT_PER_PAGE )
        res.render('res/admin/products', {
            admin: req.session.admin,
            products: products,
            currentPage: page,
            hasNextPage: page * PRODUCT_PER_PAGE < productsCount,
            hasPrevPage: page > 1,
            nextPage: page + 1,
            prevPage: page - 1,
            lastPage: Math.ceil(productsCount / PRODUCT_PER_PAGE),
            search: search,
            sortData: sortData,
            sortOrder: sortOrder,
            availableOffers: availableOffers
        })
    } catch (error) {

        console.log(error)

    }

}







