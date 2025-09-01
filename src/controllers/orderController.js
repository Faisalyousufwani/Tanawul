import Order from "../models/order.model.js";
import Product from "../models/productModel.js";
import Cart from "../models/cart.model.js";
import User from "../models/user.model.js";
import Coupon from "../models/couponModel.js";
import {  ORDER_PER_PAGE, SALES_PER_PAGE } from "../utils/paginationHelper.js"
import { discountPrice } from "../utils/couponHelper.js";
import { checkLocation } from "../utils/delivery.js";
import crypto from "crypto"
const { RAZORPAY_KEY_SECRET, RAZORPAY_KEY_ID } = process.env
import Razorpay from "razorpay";
import Address from "../models/savedAddress.js";

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});



export const placeOrder = async (req, res) => {
    const { paymentMethod, addressId, walletAmount } = req.body;

    const pincode=await Address.findById(addressId).select("pincode")
    const checkPincode= await checkLocation(pincode.pincode)
    
    if(!checkPincode){
        return res.json({message:"please enter a valid pincode , pincode may be out of delivery",address:false})
    }
    const userId = req.user.id 

    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart || !cart.items.length) {
        return res.status(400).json({ error: "Cart is empty" });
    }

    // Step 1: calculate cart total (for coupon on full cart)
    let cartTotal = 0;
    for (const cartItem of cart.items) {
        const product = cartItem.productId;
        if (!product || product.quantity < cartItem.quantity) continue;
        cartTotal += product.price * cartItem.quantity;
    }

    let discountedCartTotal = cartTotal;
    if (cart.coupon) {
        discountedCartTotal = (await discountPrice(cart.coupon, cartTotal)).discountedTotal;
        console.log(discountedCartTotal+"ddddd")
    }

    let couponDoc = cart.coupon ? await Coupon.findById(cart.coupon) : null;

    let walletBalance = walletAmount ? Number(walletAmount) : 0;
    let walletLeft = walletBalance;
    const createdOrders = [];
    let totalUsedFromWallet = 0;
    let grandTotal = 0;

    // Step 2: allocate discountedCartTotal across products (proportionally)
    for (const cartItem of cart.items) {
        const product = cartItem.productId;
        if (!product || product.quantity < cartItem.quantity) continue;

        const productTotal = product.price * cartItem.quantity;

        // proportionate discount share
        const proportion = productTotal / cartTotal;
        let discountedTotal = Math.round(discountedCartTotal * proportion);

        // wallet use per product
        let walletUsed = 0;
        let payable = discountedTotal;

        if (walletLeft > 0) {
            if (walletLeft >= discountedTotal) {
                walletUsed = discountedTotal;
                payable = 0;
                walletLeft -= discountedTotal;
            } else {
                walletUsed = walletLeft;
                payable = discountedTotal - walletLeft;
                walletLeft = 0;
            }
            totalUsedFromWallet += walletUsed;
        }

        grandTotal += payable;

        const order = new Order({
            userId,
            product: {
                productId: product._id,
                quantity: cartItem.quantity,
                price: product.price,
            },
            totalPrice: discountedTotal,
            coupon: cart.coupon || null,
            // no manual subtraction! use discountedTotal directly
            discount: 0,
            walletUsed,
            amountPayable: payable,
            paymentMethod,
            address: addressId,
            orderStatus: (payable === 0 || paymentMethod === "COD") ? "Confirmed" : "Pending",
        });

        await order.save();
        createdOrders.push(order);

        // decrement stock
        await Product.updateOne(
            { _id: product._id, quantity: { $gte: cartItem.quantity } },
            { $inc: { quantity: -cartItem.quantity } }
        );
    }
// Step 5: clear cart
    await Cart.deleteOne({ userId });
    req.session.productCount = 0;

    // Step 6: deduct wallet if used  
    if (totalUsedFromWallet > 0) {
        await User.updateOne(
            { _id: userId },
            {
                $inc: { wallet: -totalUsedFromWallet },
                $push: {
                    walletHistory: {
                        date: Date.now(),
                        amount: -totalUsedFromWallet,
                        message: "Used for purchase",
                    },
                },
            }
        );
    }

    // Step 7: COD case  
    if (paymentMethod === "COD" || createdOrders.every(o => o.amountPayable === 0)) {
        return res.json({ success: true, orders: createdOrders });
    }

    // Step 8: Razorpay case (ONE order for all products)  
    if (paymentMethod === "razorpay") {
        const razorpayOrder = await razorpayInstance.orders.create({
            amount: grandTotal * 100, // paise  
            currency: "INR",
            receipt: `multi_${Date.now()}`,
        });

        await Order.updateMany(
            { _id: { $in: createdOrders.map(o => o._id) } },
            { $set: { razorpayOrderId: razorpayOrder.id } }
        );
        return res.json({
            success: false,
            razorpayOrder,
            orders: createdOrders,
        });
    }
};




export const verifyPayment = async (req, res) => {
    try {
        const { response } = req.body;
        // response = { razorpay_payment_id, razorpay_order_id, razorpay_signature }

        // 1️Generate HMAC
        let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
        hmac.update(response.razorpay_order_id + "|" + response.razorpay_payment_id);
        hmac = hmac.digest("hex");

        if (hmac !== response.razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        // 2 Find all orders linked to this Razorpay order
        const orders = await Order.find({ razorpayOrderId: response.razorpay_order_id });

        if (!orders.length) {
            return res.status(404).json({ success: false, message: "Orders not found" });
        }

        // Update status of all orders
        await Order.updateMany(
            { razorpayOrderId: response.razorpay_order_id },
            { $set: { orderStatus: "Confirmed" } }
        );

        res.json({ success: true, message: "Payment verified", orders });
    } catch (err) {
        console.error("Verify error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const razorpayVerifyPayment = async (req, res) => {
    try {
        const { response, order } = req.body

        const { id } = req.user
        let hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
        hmac.update(response.razorpay_order_id + '|' + response.razorpay_payment_id)
        hmac = hmac.digest('hex')
        if (hmac === response.razorpay_signature) {
            await Order.updateOne({ _id: order.receipt }, {
                $set: { orderStatus: 'Confirmed' }
            })
            const orders = await Order.findOne({ _id: order.receipt })
            console.log(orders + "orders")
            if (orders.walletUsed) {
                await User.updateOne({ _id: id }, {
                    $inc: {
                        wallet: -orders.walletUsed
                    },
                    $push: {
                        walletHistory: {
                            date: Date.now(),
                            amount: -orders.walletUsed,
                            message: 'Used for purachse'
                        }
                    }
                })
            }

            res.json({ paid: true })
        } else {
            res.json({ paid: false })
        }
    } catch (error) {
        console.log(error)
    }

}

export const getConfirmOrder = async (req, res) => {
    try {
        const { id } = req.user
        // await totalCartPrice(id)
        const orders = await Order.find({ userId: id }).sort({ date: -1 }).limit(1).populate('product.productId').populate('address')
        if (orders.orderStatus === "Pending") {
            await Order.updateOne({ _id: orders._id }, {
                $set: {
                    orderStatus: "Confirmed"
                }
            })
        }
        const lastOrder = await Order.find({ userId: id }).sort({ date: -1 }).limit(1).populate('product.productId').populate('address')
        res.render('shop/cod-confirm-order', {
            order: lastOrder,
            product: lastOrder[0].product,
        })
    } catch (error) {
        // res.redirect('/500')
        console.log(error)

    }
}

// Order confirmation page
export const getConfirmOrder2 = async (req, res) => {
    try {
        const { razorpayOrderId } = req.params;

        const orders = await Order.find({ razorpayOrderId })
            .populate("product.productId")
            .populate("address");

        if (!orders.length) {
            return res.status(404).send("No orders found for this payment");
        }

        // If using EJS
        res.render("shop/confirm-order", { orders });



    } catch (err) {
        console.error("Order confirmation error:", err);
        res.status(500).send("Server error");
    }
}



export const getAdminOrderlist = async (req, res) => {
    try {
        const { sortData, sortOrder } = req.query
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
        const ordersCount = await Order.find().countDocuments()
        const orders = await Order.find()
            .sort(sort).skip((page - 1) * ORDER_PER_PAGE).limit(ORDER_PER_PAGE)
            .populate('userId').populate('product.productId').populate('address')
        res.render('admin/orders', {
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

export const changeOrderStatus = async (req, res) => {
    try {

        const { status, orderId } = req.body
        if (status === 'Cancelled') {
            // If order cancelled. The product quantity increases back
            const order = await Order.findOne({ _id: orderId })

            await Product.updateOne({ _id: order.product.productId }, {
                $inc: { quantity: order.product.quantity }
            })

            // sets the orders status
            await Order.findOneAndUpdate({ _id: orderId },
                { $set: { orderStatus: status } })
        } else {
            // sets the order status
            await Order.findOneAndUpdate({ _id: orderId },
                { $set: { orderStatus: status } })
        }
        const newStatus = await Order.findOne({ _id: orderId })
        res.status(200).json({ success: true, status: newStatus.orderStatus })
    } catch (error) {
        res.redirect('/500')

    }
}

export const getOrders = async (req, res) => {
    try {
        const { id } = req.user
        const orders = await Order.find({ userId: id }).sort({ date: -1 })
            .populate('product.productId').populate('address')
        const userDetails = await User.findOne({ _id: id })
        res.render('user/orders', {
            orders: orders,
            user: userDetails,
            now: new Date()
        })
    } catch (error) {
        // res.redirect('/500')
        console.log(error)

    }
}

export const userCancelOrder = async (req, res) => {
    try {
        console.log("hit")
        const { orderId, status } = req.body
        const { id } = req.user
        const order = await Order.findOne({ _id: orderId })

        await Product.updateOne({ _id: order.product.productId }, {
            $inc: { quantity: order.product.quantity }
        })

        if (order.orderStatus !== "Pending" && order.paymentMethod === 'razorpay') {
            await User.updateOne({ _id: id }, {
                $inc: {
                    wallet: order.totalPrice
                },
                $push: {
                    walletHistory: {
                        date: Date.now(),
                        amount: order.walletUsed,
                        message: "Deposited while canecelled order"
                    }
                }
            })
        } else if (order.orderStatus !== "Pending" && order.paymentMethod === 'COD') {
            if (order.walletUsed && order.walletUsed > 0) {
                await User.updateOne({ _id: id }, {
                    $inc: {
                        wallet: order.walletUsed
                    },
                    $push: {
                        walletHistory: {
                            date: Date.now(),
                            amount: order.walletUsed,
                            message: "Deposited while cancelled order"
                        }
                    }
                })
            }
        }
        await Order.findOneAndUpdate({ _id: orderId },
            { $set: { orderStatus: status } })
        const newStatus = await Order.findOne({ _id: orderId })
        res.status(200).json({ success: true, status: newStatus.orderStatus })
    } catch (error) {
        res.redirect('/500')

    }
}

export const userOrderProducts = async (req, res) => {
    try {
        const { id } = req.params
        const order = await Order.findOne({ _id: id }).populate('product.productId').populate('address')
        res.render('user/order-products', {
            order: order,
            product: order.product,
        })
    } catch (error) {
        res.redirect('/500')

    }
}

export const adminOrderProducts = async (req, res) => {
    try {
        const { id } = req.params
        const order = await Order.findOne({ _id: id }).populate('product.productId').populate('address')
        if (req.user.role === 'vendor') {
            return res.render('res/admin/order-products', {
                order: order,
                product: order.product,
                admin: true
            })
        }
        res.render('admin/order-products', {
            order: order,
            product: order.product,
            admin: true
        })
    } catch (error) {
        res.redirect('/500')

    }
}

export const getSalesReport = async (req, res) => {
    const { from, to, seeAll, sortData, sortOrder } = req.query
    let page = Number(req.query.page);
    if (isNaN(page) || page < 1) {
        page = 1;
    }
    const conditions = {}
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


    const orderCount = await Order.countDocuments()
    const limit = seeAll === "seeAll" ? orderCount : SALES_PER_PAGE;
    const orders = await Order.find(conditions)
        .sort(sort).skip((page - 1) * ORDER_PER_PAGE).limit(limit)
    res.render('admin/sales-report', {
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

export const returnOrder = async (req, res) => {
    const { orderId } = req.body
    const { id } = req.user
    const order = await Order.findOne({ _id: orderId })

    await Product.updateOne({ _id: order.product.productId }, {
        $inc: {
            quantity: order.product.quantity
        }
    })

    await Order.updateOne({ _id: orderId }, {
        $set: {
            orderStatus: "Returned"
        }
    })
    await User.updateOne({ _id: id }, {
        $inc: {
            wallet: order.totalPrice
        },
        $push: {
            walletHistory: {
                date: new Date(),
                amount: order.totalPrice,
                message: "Deposit on order return"
            }
        }
    })
    res.json({ success: true })
}

