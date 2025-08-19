import Order from "../models/order.model.js";
import Product from "../models/productModel.js";
import Cart from "../models/cart.model.js";
import User from "../models/user.model.js";
import Coupon from "../models/couponModel.js";
import {updateQuantity,totalCartPrice} from "../utils/cartHelper.js"
import {USERS_PER_PAGE,ITEMS_PER_PAGE,ORDER_PER_PAGE,PRODUCT_PER_PAGE,CATEGORY_PER_PAGE,BANNER_PER_PAGE,SALES_PER_PAGE} from "../utils/paginationHelper.js"
import { discountPrice } from "../utils/couponHelper.js";
import { razorpayPayment } from "../utils/paymentHelper.js";
import crypto from "crypto"





const { RAZORPAY_KEY_SECRET } = process.env


export const placeOrder = async ( req, res ) => {
        try {
            console.log("hit")
            const { id } = req.user
            const products =  await totalCartPrice( id )
            console.log("products"+products)
            const { paymentMethod, addressId, walletAmount } = req.body
            console.log(paymentMethod)
            let walletBalance
            if( walletAmount ){
                walletBalance = Number( walletAmount )
            }

            const productItems = products[0].items
            const cartProducts = productItems.map( ( items ) => ({
                productId : items.productId,
                quantity : items.quantity,
                price : ( items.totalPrice / items.quantity )
            }))
            const cart = await Cart.findOne({ userId : id})
            const totalAmount = await totalCartPrice( id )
            let discounted
            if( cart && cart.coupon && totalAmount && totalAmount.length > 0 ) {
                discounted = await discountPrice( cart.coupon, totalAmount[0].total )
                await Coupon.updateOne({ _id : cart.coupon},{
                    $push : {
                        users : id
                    }
                })
            }
            const totalPrice = discounted && discounted.discountedTotal ? discounted.discountedTotal : totalAmount[0].total
            let walletUsed, amountPayable
            if( walletAmount ) {
                if( totalPrice > walletBalance ) {
                    amountPayable = totalPrice - walletBalance
                    walletUsed = walletBalance
                } else if( walletBalance > totalPrice ) {
                    amountPayable = 0
                    walletUsed = totalPrice
                }
            } else {
                amountPayable = totalPrice
            }


            let orderStatus
            paymentMethod === 'COD' ? orderStatus = 'Confirmed' : orderStatus = 'Pending';
            if( amountPayable === 0) { orderStatus = 'Confirmed' }
            const order = new Order({
                userId : id,
                products : cartProducts,
                totalPrice : totalPrice,
                paymentMethod : paymentMethod,
                orderStatus : orderStatus,
                address : addressId,
                walletUsed : walletUsed,
                amountPayable : amountPayable
            })
            const ordered = await order.save()
            // Decreasing quantity
            for( const items of cartProducts ){
                const { productId, quantity } = items
                await Product.updateOne({_id : productId},
                    { $inc : { quantity :  -quantity  }})
                } 
            // Deleting cart
            await Cart.deleteOne({ userId : id })
            req.session.productCount = 0
            if(  paymentMethod === 'COD' || amountPayable === 0 ){
                // COD
                    if( walletAmount ) {
                        await User.updateOne({ _id :id }, {
                            $inc : {
                                wallet : -walletUsed
                            },
                            $push : {
                                walletHistory : {
                                    date : Date.now(),
                                    amount : -walletUsed,
                                    message : 'Used for purachse'
                                }
                            }
                        })
                    }
                    console.log("----end")
                    return res.json({ success : true})
            } else if( paymentMethod === 'razorpay'){
                // Razorpay 
                const payment = await razorpayPayment( ordered._id, amountPayable )
                console.log(payment)
                res.json({ payment : payment , success : false  })
            }
        } catch ( error ) {
            // res.redirect('/500')
            console.log(error)

        }
    }

export const    razorpayVerifyPayment =async( req, res ) => {
        const { response , order } = req.body
        const { id } = req.user
        let hmac = crypto.createHmac( 'sha256', RAZORPAY_KEY_SECRET )
        hmac.update( response.razorpay_order_id + '|' + response.razorpay_payment_id )
        hmac = hmac.digest( 'hex' )
        if( hmac === response.razorpay_signature ){
            await Order.updateOne({_id : order.receipt},{
                $set : { orderStatus : 'Confirmed'}
            })
            const orders = await Order.findOne({ _id : order.receipt })
            if ( orders.walletUsed ) {
                await User.updateOne({ _id : id},{
                    $inc : {
                        wallet : -orders.walletUsed
                    },
                    $push : {
                        walletHistory : {
                            date : Date.now(),
                            amount : -orders.walletUsed,
                            message : 'Used for purachse'
                        }
                    }
                })
            }
            
            res.json({paid : true})
        } else {
            res.json({paid : false})
        }
    }

export const    getConfirmOrder = async( req, res ) => {
        try{
            const { id } = req.user
            await totalCartPrice( id )
            const orders = await Order.find({ userId : id }).sort({ date : -1 }).limit( 1 ).populate( 'products.productId' ).populate( 'address' )
            if( orders.orderStatus === "Pending"){
                await Order.updateOne({ _id : orders._id },{
                    $set : {
                        orderStatus : "Confirmed"
                    }
                })
            }
            const lastOrder = await Order.find({ userId : id }).sort({ date : -1 }).limit( 1 ).populate( 'products.productId' ).populate( 'address' )
            res.render( 'shop/confirm-order', {
                order : lastOrder,
                products : lastOrder[0].products,
            })
        }catch( error ){
            res.redirect('/500')

        }
    }

export const     getAdminOrderlist=  async( req, res ) => {
        try{
            const { sortData, sortOrder } = req.query
            let page = Number(req.query.page);
            if (isNaN(page) || page < 1) {
            page = 1;
            }
            const sort = {}
            if( sortData ) {
                if( sortOrder === "Ascending" ){
                    sort[sortData] = 1
                } else {
                    sort[sortData] = -1
                }
            } else {
                sort['date'] = -1
            }
            const ordersCount = await Order.find().countDocuments()
            const orders = await Order.find()
                .sort(sort).skip(( page - 1 ) * ORDER_PER_PAGE ).limit( ORDER_PER_PAGE )
                .populate( 'userId' ).populate( 'products.productId' ).populate( 'address' )
            res.render( 'admin/orders', {
                orders : orders,
                admin : true,
                currentPage : page,
                hasNextPage : page * ORDER_PER_PAGE < ordersCount,
                hasPrevPage : page > 1,
                nextPage : page + 1,
                prevPage : page -1,
                lastPage : Math.ceil( ordersCount / ORDER_PER_PAGE ),
                sortData : sortData,
                sortOrder : sortOrder
            })
        }catch( error ){
           console.log(error)

        }
    }

export const    changeOrderStatus = async ( req, res ) => {
       try {
            const { status, orderId } = req.body
            if( status === 'Cancelled'){
                // If order cancelled. The product quantity increases back
                const order = await Order.findOne({ _id : orderId })
                for( let products of order.products ){
                    await Product.updateOne({ _id : products.productId },{
                        $inc : { quantity : products.quantity }
                    })
                }
                // sets the orders status
                    await Order.findOneAndUpdate({ _id : orderId },
                        { $set : { orderStatus : status }}) 
                } else {
                    // sets the order status
                    await Order.findOneAndUpdate({ _id : orderId },
                        { $set : { orderStatus : status }}) 
                }
            const newStatus = await Order.findOne({ _id : orderId })
            res.status( 200 ).json({ success : true, status : newStatus.orderStatus })
       } catch ( error ) {
        res.redirect('/500')

       }
    }

export const    getOrders = async( req, res ) => {
        try {
           const { id } = req.user
            const orders = await Order.find({ userId : id }).sort({ date : -1 })
            .populate( 'products.productId' ).populate( 'address' )
            const userDetails = await User.findOne({ _id : id }) 
            res.render( 'user/orders', {
                orders : orders,
                user : userDetails,
                now : new Date()
            })
        } catch ( error ) {
            // res.redirect('/500')
            console.log(error)

        }
    }

export const    userCancelOrder =  async ( req, res ) => {
        try {
            const { orderId, status } = req.body
            const { id } = req.user
            const order = await Order.findOne({ _id : orderId })
            for( let products of order.products ){
                await Product.updateOne({ _id : products.productId }, {
                    $inc : { quantity : products.quantity }
                })
            }
            if( order.orderStatus !== "Pending" && order.paymentMethod === 'razorpay' ) {
                await User.updateOne({ _id : id },{
                    $inc : {
                        wallet : order.totalPrice
                    },
                    $push : {
                        walletHistory : {
                            date : Date.now(),
                            amount : order.walletUsed,
                            message : "Deposited while canecelled order"
                        }
                    }
                })
            } else if( order.orderStatus !== "Pending" && order.paymentMethod === 'COD' ) {
                if( order.walletUsed && order.walletUsed > 0 ) {
                    await User.updateOne({ _id :id },{
                        $inc : {
                            wallet : order.walletUsed
                        },
                        $push : {
                            walletHistory : {
                                date : Date.now(),
                                amount : order.walletUsed,
                                message : "Deposited while cancelled order"
                            }
                        }
                    })
                }
            }
            await Order.findOneAndUpdate({ _id : orderId },
                { $set : { orderStatus : status }}) 
            const newStatus = await Order.findOne({ _id : orderId })
            res.status( 200 ).json({ success : true, status : newStatus.orderStatus })
        } catch ( error ) {
            res.redirect('/500')

        }
    }

export const    userOrderProducts = async ( req, res ) => {
        try {
            const { id } = req.params
            const order = await Order.findOne({ _id : id }).populate( 'products.productId' ).populate( 'address' )
            res.render( 'user/order-products', {
                order : order,
                products : order.products,
            })
        } catch ( error ) {
            res.redirect('/500')

        }
    }

export const    adminOrderProducts = async ( req, res ) => {
        try {
            const { id } = req.params
            const order = await Order.findOne({ _id : id }).populate( 'products.productId' ).populate( 'address' )
            res.render( 'admin/order-products', {
                order : order,
                products : order.products,
                admin : true
            })
        } catch ( error ) {
            res.redirect('/500')

        }
    }

export const    getSalesReport = async ( req, res ) => {
        const { from, to, seeAll, sortData, sortOrder } = req.query
        let page = Number(req.query.page);
            if (isNaN(page) || page < 1) {
            page = 1;
            }
        const conditions = {}
        if( from && to){
            conditions.date = {
                $gte : from,
                $lte : to
            }
        } else if ( from ) {
            conditions.date = {
                $gte : from
            }
        } else if ( to ){
            conditions.date = {
                $lte : to
            }
        }
        const sort = {}
        if( sortData ) {
            if( sortOrder === "Ascending" ){
                sort[sortData] = 1
            } else {
                sort[sortData] = -1
            }
        } else {
            sort['date'] = -1
        }
        const orderCount = await Order.countDocuments()
        const limit = seeAll === "seeAll" ? orderCount : SALES_PER_PAGE ;
        const orders = await Order.find( conditions )
        .sort( sort ).skip(( page - 1 ) * ORDER_PER_PAGE ).limit(limit)
        res.render( 'admin/sales-report', {
            admin : true,
            orders : orders,
            from : from,
            to : to, 
            seeAll : seeAll,
            currentPage : page,
            hasNextPage : page * SALES_PER_PAGE < orderCount,
            hasPrevPage : page > 1,
            nextPage : page + 1,
            prevPage : page -1,
            lastPage : Math.ceil( orderCount / SALES_PER_PAGE ),
            sortData : sortData,
            sortOrder : sortOrder
        })  
    }

export const    returnOrder = async( req, res ) => {
        const { orderId } = req.body
        const { id } = req.user
        const order = await Order.findOne({ _id : orderId })
        for ( let products of order.products ) {
            await Product.updateOne({ _id : products.productId }, {
                $inc : {
                    quantity : products.quantity
                }
            })
        }
        await Order.updateOne({ _id : orderId },{
            $set : {
                orderStatus : "Returned"
            }
        })
        await User.updateOne({ _id : id }, {
            $inc : {
                wallet : order.totalPrice
            },
            $push : {
                walletHistory : {
                    date : new Date(),
                    amount : order.totalPrice,
                    message : "Deposit on order return"
                }
            }
        })
        res.json({ success : true })
    } 

