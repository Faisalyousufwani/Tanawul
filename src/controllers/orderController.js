import Order from "../models/user.orders.js";
import Item from "../models/items.js";
import User from "../models/user.model.js";
import Profile from "../models/user.profile.model.js";
import { createProfile, cartTotal, saveAddressDb } from "../services/order.Service.js";
import { validationResult } from "express-validator";
import { getPincodeInfo } from "../services/order.Service.js";
import fs from "fs"

export const placeOrder = async (req, res) => {
  const errors = validationResult(req)
  //  console.log(errors)
  if (!errors.isEmpty()) {
    let messages = ""
    // errors.array().forEach((err)=>{messages+err.msg})
    errors.array().forEach(err => { messages += err.msg + "," })
    req.flash("error", messages)
    return res.redirect("/checkout")
  }
  const customerId = req.user.id;
  const items = req.cookies.cartItems;

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


  createProfile(customerId, Customer)
  const totalPrice = await cartTotal(items)

  try {
    if (!Address) {
      req.flash("error", "All fields are required");
      return res.redirect("/cart/checkout");
    }
    const newOrder = new Order({
      customerId: customerId,
      userItem: items,
      address: Address,
      customer: Customer,
      TotalPrice: totalPrice,

    });
    const result = await newOrder.save();
    req.flash("success", "order placed successfully");
    res.clearCookie("cartItems");
    res.redirect("/order");
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};



export const userOrders = async (req, res) => {
  try {
    const customerId = req.user.id;
    const userData = await User.findById(customerId);
    const orders = await Order.find({ customerId: customerId })
      .sort({ createdAt: -1 })
      .populate("customerId", "-_id email")
      .populate("userItem.itemId")
      .populate("userItem", "-_id ");
    // res.send(orders)
    res.render("user/order.ejs", {
      orderData: orders,
      user: userData,

    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const orderInfo = async (req, res) => {
  const { id } = req.params
  const customerId = req.user.id;
  //add a middlware checking whether userId of the user(login user ) is in order(the person ordered the item should only see order details)
  console.log(id)
  const orderDetails = await Order.findById(id).populate("userItem.itemId")
  const profileDetails = await Profile.findOne({ userId: customerId }).populate("userId")
  console.log(orderDetails)
  res.render("user/orderDetails.ejs", { orderDetails, profileDetails })
}

export const checkLocation = async (req, res) => {
  const { pincode } = req.body
  const locationData = await getPincodeInfo(pincode)
  const rawData = fs.readFileSync("./config/pincodes.json");
  const data = JSON.parse(rawData);

  function isDeliverable(pincode) {
  return pinCodes.includes(pincode);
}

if (isDeliverable(pincodeToCheck)) {
  console.log(`Yes, pincode ${pincodeToCheck} is deliverable in Anantnag.`);
} else {
  console.log(`Sorry, pincode ${pincodeToCheck} is NOT deliverable in Anantnag.`);
}
  // Get the array of pincodes
  const pinCodes = data.pin_codes;
  console.log(pinCodes)
  res.send(locationData)
}