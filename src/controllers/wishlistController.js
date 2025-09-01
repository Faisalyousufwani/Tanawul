import mongoose from "mongoose"
import WishList from "../models/wishlistModel.js"

export const    addToWishList =async ( req, res ) => {
        try {
            const { productId } = req.body
            const { id } = req.user
            const wishlist = await WishList.findOne( { userId : id })
            if( wishlist  ) {
                const exist = wishlist .products.find( item => item == productId )
                if( exist ){
                    // res.json({ message : "Product already exist"})
                    // const remove=await wishlist.products
                    //can remove if already exists
                    const result=await WishList.updateOne({userId:id},{$pull:{products:new mongoose.Types.ObjectId(productId)}})
                    return res.json({message:"product removed from wishList successfully",success:true,removed:true})
                } else {
                    await WishList.updateOne({ userId : id},{
                        $push : {
                            products : productId
                        }
                    })
                    res.json({ success : true, message : 'Added to WishList'})
                } 
            } else {
                const newWishList = new WishList({
                    userId : id,
                    products : [productId]
                }) 
                await newWishList.save()
                res.status(200).json({success : true ,message : "Added to WishList"})
            }
        } catch (error) {
           console.log(error)

        }
    }

export const     getWishList = async( req, res ) => {
        try {
            const { id } = req.user
            const list = await WishList.find({ userId : id}).populate('products')
            res.render( 'user/WishList' ,{
                list : list
            })
        } catch (error) {
            console.log(error)
        }
    }

export const     removeItem = async ( req, res ) => {
        try {
            const { productId } = req.body
            const { id } = req.user
            await WishList.findOneAndUpdate({ userId : id },{
                $pull : {
                    products : productId
                }
            })
            const wallet = await WishList.findOne({ userId : id })
            if ( wallet.products.length === 0 ) {
                await WishList.deleteOne({ userId : id })
                return res.json({ success : true, listDelete : true})
            }
            res.json({ success : true})
        } catch (error) {
            res.redirect('/500')

        }
    }


