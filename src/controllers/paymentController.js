import { createRazorpayInstance } from "../../config/razorpay.config.js"
import { config, configDotenv } from "dotenv"
import { cartTotal } from "../services/order.Service.js"
import Order from "../models/user.orders.js"
import crypto from "node:crypto"
import Payment from "../models/payment.js"
import AddressModel from "../models/savedAddress.js"
import Item from "../models/items.js"
import { saveAddressDb, createProfile } from "../services/order.Service.js"
import { validationResult } from "express-validator"

configDotenv("../.env")
export const processPayment = async (req, res) => {
  try {
    const customerId = req.user.id
    const errors = validationResult(req)
    const items = req.cookies.cartItems;

    if (!errors.isEmpty()) {
     

      return res.status(400).json({
        success: false,
        errors: errors.array()
      })
    }
    if (!items) {
      return res.json({
        success: false,
        message: "please add some items first"
      })
    }
    if (items.length == 0) {
      return res.json({
        success: false,
        message: "please add some items first"
      })
    }
    const totalPrice = await cartTotal(items) * 100;

    const { firstname, lastname, contact, email, streetAddress, house, city, state, pincode, saveAddress, defaultProfile, quantity } = req.body;
    const Customer = {
      firstname,
      lastname,
      contact,
      email
    }
    const Address = {
      streetAddress,
      house,
      city,
      state,
      pincode,
    }

    if (defaultProfile == "yes") {
      const isDefaultAdd = await AddressModel.findOne({ email: email })
      console.log("isdefault" + isDefaultAdd)
      if (!isDefaultAdd || isDefaultAdd.isDefault == false) {
        const isDefault = true;
        saveAddressDb(Customer, Address, customerId, isDefault)
      }
    }
    // if(saveAddress=="yes"){
    //    const isAddress=await AddressModel.findOne({})
    //     const isDefault=false;
    //     saveAddressDb(Customer,Address,customerId,isDefault)
    //   }

    createProfile(customerId, Customer)


    const options = {
      amount: totalPrice,
      currency: 'INR',
      receipt: `receipt_${Math.random().toString(36).substring(7)}`,
      payment_capture: 1
    }
    const instance = createRazorpayInstance()
    const razorpayOrder = await instance.orders.create(options)
    // console.log(razorpayOrder)
    const newOrder = new Order({
      customerId: customerId,
      userItem: items,
      address: Address,
      customer: Customer,
      TotalPrice: totalPrice,
      razorpayOrderId: razorpayOrder.id
    });
    // newOrder.razorpayOrderId=razorpayOrder.id;
    await newOrder.save()
    res.clearCookie("cartItems");
    // const result = await newOrder.save();
    return res.status(200).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    })
  }


  catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}
export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
  const secret = process.env.RAZORPAY_KEY_SECRET
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id)
  const generatedSignature = hmac.digest("hex")
  if (generatedSignature === razorpay_signature) {
    //updating order details in db
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id })
    // console.log("order verify"+order)
    order.paymentStatus = "paid";
    await order.save()
    //create payment record
    await Payment.create({
      orderId: order._id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      amount: order.amount,
      currency: order.currency,
    })
    // res.send()

    req.flash("success", `order placed successfully thanks for using tanawul`)
    // res.render("success",{paymentId:razorpayPaymentId})
    res.redirect("/order")
  }
  else {
    res.send("payment verification failed")
  }

}
