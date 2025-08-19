import Restaurant from "../models/restaurant.js";
import Address from "../models/savedAddress.js";
import Product from "../models/productModel.js";
import Cart from "../models/cart.model.js";
import User from "../models/user.model.js";
import Category from "../models/categoryModel.js"
import {updateQuantity,totalCartPrice} from "../utils/cartHelper.js"
import {USERS_PER_PAGE,ITEMS_PER_PAGE,ORDER_PER_PAGE,PRODUCT_PER_PAGE,CATEGORY_PER_PAGE,BANNER_PER_PAGE,SALES_PER_PAGE} from "../utils/paginationHelper.js"
import { discountPrice } from "../utils/couponHelper.js";
//banner schema pending

// const { search } = require('../routers/shopRouter')




    // Home page GET
export const    getHome = async( req, res ) => {
        try {
            // const banners = await bannerSchema.find({ status : true })
            const allRestaurants=await Restaurant.find().populate("foods")
             const restaurants=allRestaurants.filter((x)=>(x.isApproved==true))
            const products = await Product.find({ status : true })
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
            res.render( 'shop/home', {
                products : products,
                restaurants
                // banners : banners
            }) 
        } catch ( error ) {
            console.log( error);
        }
    }

    // Shop page GET
export const     getShop = async( req, res ) => {
        try {
           
           
    
            const { cat,brand ,search } = req.query
            let page = Number( req.query.page );
            if ( isNaN(page) || page < 1 ) {
            page = 1;
            }
            const condition = { status : true }
            if ( cat ){
                condition.category = cat
            }
            if(brand){
                condition.category=brand
            }
           
            if( search ) {
                condition.$or = [
                    { name : { $regex : search, $options : "i" }},
                    { description : { $regex : search, $options : "i" }},
                ]
            }
        
    
            const productCount = await Product.find(condition).countDocuments()
            const products = await Product.find( condition )
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
            .populate({
                path:'restaurant',
            })
            .skip( ( page - 1 ) * ITEMS_PER_PAGE ).limit( ITEMS_PER_PAGE )  // Pagination
             const brands = await Product.distinct( 'brand' )
            const category = await Category.find({ status: true }) 
            // const brands = await Product.distinct( 'brand' )
            const startingNo = (( page - 1) * ITEMS_PER_PAGE ) + 1
            const endingNo = startingNo + ITEMS_PER_PAGE
            // res.render("menu.ejs",{item:restaurants})
            // console.log(products)
            res.render( 'shop/menu', {
                item  : products,
                category : category,
                totalCount : productCount,
                brands:brands,
                currentPage : page,
                hasNextPage : page * ITEMS_PER_PAGE < productCount, // Checks is there is any product to show to next page
                hasPrevPage : page > 1,
                nextPage : page + 1,
                prevPage : page -1,
                lastPage : Math.ceil( productCount / ITEMS_PER_PAGE ),
                startingNo : startingNo,
                endingNo : endingNo,
                brand:brand,
                cat : cat,
               
                search : search
            })
              
        } catch ( error ) {
            // res.redirect('/500')
            console.log(error)

        }
    }

    // Single product GET
export const     getSingleProduct = async( req, res ) => {
        try {
            const product = await Product.find({ _id : req.params.id, status : true })
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
            const related = await Product.find({ status : true })
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
            .limit( 4 )
            res.render( 'shop/single-product', {
                product : product,
                related : related
            })
        } catch ( error ) {
            res.redirect('/500')

        }

    }

export const     getCheckout = async( req, res ) => {
        try {
            const { id } = req.user
            const cartAmount = await totalCartPrice( id )
            const cart = await Cart.findOne({ userId : id })
            const userDetails = await User.findOne({ _id : id })
            let discounted
            if( cart && cart.coupon && cartAmount && cartAmount.length > 0 ) {
                discounted = await discountPrice( cart.coupon, cartAmount[0].total )
            }
            const address = await User.findOne({ _id : id }).populate( 'address' )
            // console.log("address"+userDetails)
            const addresses = address?.address
            res.render( 'shop/checkout', {
                cartAmount : cartAmount,
                address : addresses,
                discounted : discounted,
                user : userDetails
            })
        } catch ( error ) {
            // res.redirect('/500')
            console.log(error)

        }
    }

export const    getCheckoutAddAddress = async( req, res ) => {
        res.render( 'shop/checkout-address' )
    }
export const     checkoutAddAddress = async ( req, res ) => {
        try{
            const{id}=req.user
            const address = new Address({
                fullName:req.body.fullName,
                mobile:req.body.mobile,
                landmark:req.body.landmark,
                street:req.body.street,
                village:req.body.village,
                city:req.body.city,
                pincode:req.body.pincode,
                state:req.body.state,
                country:req.body.country,
                userId : req.session.user
            })
            const result = await address.save()
            await User.updateOne({ _id : id }, {
                 $push : { address : result._id}
            })
            res.redirect( '/checkout' )
        } catch ( error ) {
            res.redirect('/500')

        }
    }

export const     searchSuggestion = async ( req, res ) => {
        try {
            
            const { searchField } = req.query
            const suggestions = await Product.find({status : true, $or : [
                { name : { $regex : searchField, $options : "i" }},
                { description : { $regex : searchField, $options : "i" }}
                ]
            },{name : 1}) 
            res.json({ suggestions : suggestions , success : true }) 
        } catch (error) {
            res.redirect('/500')

        }
        
    }  

