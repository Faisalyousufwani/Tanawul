import WishList from "../models/wishlistModel.js"

export const    addToWishList =async ( req, res ) => {
        try {
            const { productId } = req.body
            const { id } = req.user
            const WishList = await WishList.findOne( { userId : id })
            if( WishList ) {
                const exist = WishList.products.find( item => item == productId )
                if( exist ){
                    res.json({ message : "Product already exist"})
                } else {
                    await WishList.updateOne({ userId : user},{
                        $push : {
                            products : productId
                        }
                    })
                    res.json({ success : true, message : 'Added to WishList'})
                } 
            } else {
                const newWishList = new WishList({
                    userId : user,
                    products : [productId]
                }) 
                await newWishList.save()
                res.status(200).json({success : true ,message : "Added to WishList"})
            }
        } catch (error) {
            res.redirect('/500')

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
            res.redirect('/500')

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
                await WishList.deleteOne({ userId : user })
                return res.json({ success : true, listDelete : true})
            }
            res.json({ success : true})
        } catch (error) {
            res.redirect('/500')

        }
    }


