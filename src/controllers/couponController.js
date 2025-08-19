import Coupon from "../models/couponModel.js"
import Cart from "../models/cart.model.js"
import { discountPrice } from "../utils/couponHelper.js"

export const getCoupon=async(req,res)=>{
    try {
        const { search, sortData, sortOrder } = req.query
        const condition = {}

        if (search) {
            condition.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { discountType: { $regex: search, $options: "i" } },
            ]
        }
        const sort = {}
        if (sortData) {
            if (sortOrder === "Ascending") {
                sort[sortData] = 1
            } else {
                sort[sortData] = -1
            }
        }
        const coupons = await Coupon.find(condition).sort(sort)
        res.render('admin/coupons', {
            admin: true,
            coupons: coupons,
            search: search,
            sortData: sortData,
            sortOrder: sortOrder
        })
    } catch (error) {
        console.log(error)
    }
}

export const getAddCoupon=async(req,res)=>{
     res.render('admin/add-coupon', {
        admin: true,
        err: req.flash('err')
    })
}

export const addCoupon=async(req,res)=>{
    try {
        const { name, description, startingDate, expiryDate, minimumAmount, discountType, discount } = req.body

        const exist = await Coupon.findOne({ name: name.toUpperCase() })
        if (exist) {
            req.flash('err', 'Coupon name already exist..')
            return res.redirect('/admin/add-coupon')
        }
        const coupon = new Coupon({
            name: name.toUpperCase(),
            description: description,
            startingDate: startingDate,
            expiryDate: expiryDate,
            minimumAmount: minimumAmount,
            discountType: discountType,
            discount: discount,
        })
        await coupon.save()
        res.redirect('/admin/coupons')
    } catch (error) {
        console.log(error)

    }
}

export const getEditCoupon=async(req,res)=>{
   try {
        const { id } = req.params
        const coupon = await Coupon.findOne({ _id: id })
        res.render('admin/edit-coupon', {
            admin: true,
            coupon: coupon
        })
    } catch (error) {
        console.log(error)

    }
}

export const editCoupon =async(req,res)=>{
    try {
            const { name, description, startingDate, expiryDate, minimumAmount, discountType, discount, id } = req.body
            await Coupon.updateOne({ _id: id }, {
                $set: {
                    name: name.toUpperCase(),
                    description: description,
                    startingDate: startingDate,
                    expiryDate: expiryDate,
                    minimumAmount: minimumAmount,
                    discountType: discountType,
                    discount: discount
                }
            })
            res.redirect('/admin/coupons')
        } catch (error) {
            console.log(error)
    
        }
}

export const cancelCoupon=async(req,res)=>{
     try {
            const { couponId } = req.body
            await Coupon.findOneAndUpdate({ _id: couponId }, {
                $set: {
                    status: false
                }
            })
            res.json({ cancelled: true })
        } catch (error) {
            console.log(error)
    
        }
}
export const applyCoupon=async(req,res)=>{
    try {
        // const { couponCode, total } = req.body
        const couponCode=req.body.couponCode
        const total=req.body.getTotal
        const {id}=req.user
        const coupon = await Coupon.find({ name: couponCode, status: true })
        // If coupon exists
        if (coupon && coupon.length > 0) {
            const now = new Date()
            // if coupon not expired 
            if (coupon[0].expiryDate >= now && coupon[0].startingDate <= now) {
                // Convert the user IDs in the "users" array to strings for comparison
                const userIds = coupon[0].users.map((userId) => String(userId));
                // Check if the desiredUserId is present in the array
                const userExist = userIds.includes(id);
                // If user already used the coupon
                if (userExist) {
                    res.json({ success: false, message: 'Coupon already used by the user' })
                } else {
                    // Checking minimum Amount
                    console.log(total+"total")
                    if (total < coupon[0].minimumAmount) {
                        res.json({ success: false, message: 'Minimums amount not reached' })
                    } else {
                        // Success
                        await Cart.updateOne({ userId: id }, {
                            $set: {
                                coupon: coupon[0]._id
                            }
                        })
                        const cart = await Cart.findOne({ userId: id })
                        let discounted
                        if (cart.coupon) {
                            discounted = await discountPrice(cart.coupon, total)
                        }
                        res.json({ success: true, message: "Available", discounted: discounted })
                    }
                }
            } else {
                res.json({ success: false, message: 'Invalid Coupon, out dated' })
            }
        } else {
            res.json({ success: false, message: 'Invalid Coupon' })
        }
    } catch (error) {
        console.log(error)

    }
}
