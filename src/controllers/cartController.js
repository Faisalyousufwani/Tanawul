import Cart from "../models/cart.model.js";
import Product from "../models/productModel.js";
import Coupon from "../models/couponModel.js";
import {updateQuantity,totalCartPrice} from "../utils/cartHelper.js"
import { discountPrice } from "../utils/couponHelper.js";
import { json } from "express";




export const    getCart = async( req, res ) => {
        try {
            const{id}=req.user 
             let discounted
            const productCount = await updateQuantity( id)
            if( productCount === 1 ){
                req.session.productCount--
            }
            const updatedCart = await Cart.findOne({ userId : id }).populate({
                path : 'items.productId',
                populate : [{
                    path : 'category',
                    populate : {
                        path : 'offer'
                    },
                },
                    {
                    path : 'offer'
                    }
                ]
            });
            // console.log("cart"+JSON.stringify(updatedCart,null,2))
            // if(!updatedCart){
            //     return res.send("cart is emmpty")
            // }
            // console.log(updatedCart);
            
            const totalPrice = await totalCartPrice( id )

            if( updatedCart && updatedCart.items > 0 ){
                console.log(updatedCart.items.length);
                req.session.productCount = updatedCart.items.length
                updatedCart.items.forEach(( items ) => {
                
                    if( items.productId.offer && items.productId.offer.startingDate <= new Date() && items.productId.offer.expiryDate >= new Date() ) {
                        items.productId.price = (items.productId.price * ( 1 - ( items.productId.offer.percentage / 100 ))).toFixed(0)
                    }else if ( items.productId.category.offer && items.productId.category.offer.startingDate <= new Date() && items.productId.category.offer.expiryDate >= new Date() ) {
                        items.productId.price = (items.productId.price * ( 1 - ( items.productId.category.offer.percentage / 100 ))).toFixed(0)
                    }
                    
                    return items
                })
            } 
            
            if( updatedCart && updatedCart.coupon && totalPrice && totalPrice.length > 0 ) {
                discounted = await discountPrice( updatedCart.coupon, totalPrice[0].total )
            }
            
            const availableCoupons = await Coupon.find({ status : true , startingDate : { $lte : new Date() }, expiryDate : { $gte : new Date() } })
            console.log("total"+JSON.stringify(totalPrice,null,2))
            res.render( 'shop/cart', {
                cartItems : updatedCart,
                totalAmount : totalPrice,
                availableCoupons : availableCoupons,
                discounted : discounted

            });
        } catch ( error ) {
            // res.redirect('/500')
            console.log(error)

        }
    }

export const     addToCart = async ( req, res ) => {
        try {
            
            // checking is user logged In
            if( req.user ){
                // If logged in
                const {id} = req.user;
                const{productId} = req.body

                // Getting stock quantity
                const Quantity = await Product.findOne({ _id : productId }, { quantity : 1 });
                // Checking if cart is exist
                const cart = await Cart.findOne({ userId : id });
                const stockQuantity = Quantity.quantity
                if( stockQuantity > 0 ){
                    // If cart exist
                    if( cart ) {

                        // if Product exists in cart
                        const exist = cart.items.find( item => item.productId == productId );
                        if( exist ) {
                            // Checking stock quantity with cart quantity
                            const availableQuantity = stockQuantity - exist.quantity
                            if( availableQuantity > 0 ) {
                                // quantity increases
                                await Cart.updateOne( { userId : id, 'items.productId' : productId },
                                { $inc : { 'items.$.quantity': 1 }}
                                );
                                //total price of cart
                                const totalPrice = await totalCartPrice(id )

                                let discounted
                                if( cart.coupon && totalPrice && totalPrice.length > 0 ) {
                                    discounted = await discountPrice( cart.coupon, totalPrice[0].total )
                                }

                                res.status( 200 ).json({ success : true, message : 'Added to cart' ,login : true, totalPrice : totalPrice, discounted : discounted });
                            } else {
                                //If cart quantity and availabe quantity are same
                                res.json({ message : "Oops! It seems you've reached the maximum quantity of products available for purchase.",
                                login : true , outOfStock : true })
                            }
                            
                        // if product not exists in cart, adding new object to items array
                        } else {
                            await Cart.updateOne( { userId : id },
                                { $push : { items : { productId : productId } } }
                                );
                                // increasing product count in session
                                req.session.productCount++
                                res.status( 200 ).json({  success : true, 
                                                    message : 'Added to cart',
                                                    newItem : true,
                                                    login : true });
                        }
                    // If cart not exist !!!
                    } else {
                        // Creating new cart for user
                        const newCart = new Cart({
                            userId: req.user.id,
                            items : [{ productId : productId }]
                        });
                        await newCart.save();
                        req.session.productCount++
                        res.status( 200 ).json({
                            success : 'Added to cart',
                            login : true,
                            newItem : true
                        });
                    }
                // If product stock is empty
                } else {
                    res.json({ error : true, message : 'Out of stock', login : true, outOfStock : true });
                }
            // If user not logged in 
            } else {
                res.json({ login : false });
            }
            
        } catch ( error ) {
            res.redirect('/500')

        }
    }

export const     decCart = async ( req, res ) => {
        try {
            const{id}=req.user 
            const { productId } = req.body;
           
            
            const updatedCart = await Cart.findOneAndUpdate(
                {
                  userId: id,
                  'items': { $elemMatch: { productId: productId, quantity: { $gte: 2 } } }
                },
                { $inc: { 'items.$.quantity': -1 } },
                { new: true }
              );


            if( updatedCart) {
            const totalPrice = await totalCartPrice( id )
            const cart = await Cart.findOne({ userId : id})

            
            let discounted
            if( cart.coupon && totalPrice && totalPrice.length > 0 ) {
                discounted = await discountPrice( cart.coupon, totalPrice[0].total )
            }
            res.status( 200 ).json({ success : true, message : 'cart item decreased', totalPrice : totalPrice, discounted : discounted });
        } else {
            res.json({ success : false , message : 'Cannot decrease the quantity'})
        }
        } catch ( error ) {
            res.redirect('/500')

        }
    }

export const     removeCartItem = async ( req, res ) => {
        try {

            const { itemId } = req.body
            const{id}=req.user 
            await Cart.updateOne({ userId : id, 'items._id': itemId },
                { $pull : { items : { _id : itemId }}})
                req.session.productCount--
                if( req.session.productCount === 0 ){
                    await Cart.deleteOne({ userId : id})
                }
                const totalPrice = await totalCartPrice(id)
                const cart = await Cart.findOne({ userId : id})
                let discounted
                if( cart && cart.coupon && totalPrice && totalPrice.length > 0 ) {
                    discounted = await discountPrice( cart.coupon, totalPrice[0].total )
                }
                res.status( 200 ).json({ success : true, message : 'Item removed', removeItem : true, totalPrice : totalPrice, discounted : discounted })
        } catch ( error ) {
            // res.redirect('/500')
            console.log(error)

        }
    }
