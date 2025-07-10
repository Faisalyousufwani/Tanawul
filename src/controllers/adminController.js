
import Restaurant from "../models/restaurant.js"
import User from "../models/user.model.js"
import Profile from "../models/user.profile.model.js"
import Order from "../models/user.orders.js"
import { cancelOrderService, orderInfoService } from "../services/admin.order.Service.js"
export const admin = (req, res) => {
  res.render("admin/dashboard.ejs", {
    stats: {},
    recentOrders: [],
    title: 'Dashboard-Tanawul Admin',
    user: req.session.adminUser

  })
}
export const allOrders = async (req, res) => {
  const allOrders = await Order.find().populate("userItem.itemId");
  console.log(allOrders)
  res.render("admin/orders.ejs", {
    stats: {},
    recentOrders: [],
    title: 'Dashboard-Tanawul Admin',
    user: req.session.adminUser,
    orderData: allOrders
  })
}
export const orderInfo = async (req, res) => {
  //seperate orderinfo for restaurant and admin without orderInfoService
  const { id } = req.params
  const customerId = req.user.id;
  const{orderDetails,profileDetails}=orderInfoService(id, customerId)
  res.render("admin/orderDetails.ejs", {
    stats: {},
    recentOrders: [],
    title: 'Dashboard-Tanawul Admin',
    user: req.session.adminUser,
    orderDetails, profileDetails
  })
}
export const cancelOrder = async (req, res) => {
  //seperate cancel for restaurant and admin
  const { id } = req.params
  // const order=await Order.findById(id)
  // if(!order){
  //   req.flash("error","order not found")
  //   return res.redirect("/admin/order/all")
  // }
  // if(order.status=="cancelled"){
  //   return res.send("already cancelled")
  // }
  // if(order.status=="shipped"){
  //   return res.send("order is shipped can't be cancelled")
  // }
  // order.status="cancelled"
  // await order.save()
  cancelOrderService(id)
  res.redirect("/admin/order/all")

}
export const deleteOrder = async (req, res) => {
  const { id } = req.params
  const order = await Order.findByIdAndDelete(id)
  req.flash("success", "order deleted successfully")
  res.redirect("/admin/order/all")


}
export const approveRestaurant = async (req, res) => {
  const { id } = req.params
  // const restaurant=await Restaurant.findOneAndUpdate({resId:id},{$set:{isApproved:true,}},{new:true}).populate("owner")
  const restaurant = await Restaurant.findOne({ resId: id }).populate("owner")
  const UpdatedRestaurant = await Restaurant.findOneAndUpdate({ resId: id }, { $set: { isApproved: true, } }, { new: true })
  const user = await User.findByIdAndUpdate(restaurant.owner._id, { $set: { role: 'vendor' } }, { new: true })
  res.redirect("/admin/restaurant/list")

}
export const restaurantList=async(req,res)=>{
    const allRestaurants=await Restaurant.find().populate({path:"foods"} ).populate("owner")
    // const filterAllRestaurants=allRestaurants.filter((x)=>x.isApproved==false)
    // return res.send(allRestaurants)
    // res.render("res/restaurantList.ejs",{allRestaurants})
    res.render("res/restaurantList.ejs",{ 
            stats: {},
            recentOrders: [],
            title: 'Dashboard-Tanawul Admin',
            user: req.session.adminUser,
            allRestaurants
        })
}
export const deleteRestaurant = async (req, res) => {
  //admin route
  const { resId } = req.params;
  console.log(resId)
  const delRes = await Restaurant.deleteOne({ resId: resId })
  //post delete its foods

  res.redirect("/admin/restaurant/list")
}

export const allCustomers=async(req,res)=>{
      const users=await User.find({role:'customer'})
        // const customerList=await Profile.find().populate("userId","-password")
        // console.log(AllUserProfiles )
        // res.send(customerList)
         res.render("admin/customerList.ejs",{ 
            stats: {},
            recentOrders: [],
            title: 'Dashboard-Tanawul Admin',
            user: req.session.adminUser,
                customerList:users
        })
}
export const customerOrders=async(req,res)=>{
        try {
    const {id} = req.params;

    const userData = await User.findById(id);
    const orders = await Order.find({ customerId: id })
      .sort({ createdAt: -1 })
      .populate("customerId", "-_id email")
      .populate("userItem.itemId")
      .populate("userItem", "-_id ");
    res.render("admin/orders.ejs",{ 
            stats: {},
            recentOrders: [],
            title: 'Dashboard-Tanawul Admin',
            user: req.session.adminUser,
           orderData:orders
        })
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
}
export const deleteCustomer=async(req,res)=>{
  const{id}=req.params
  try {
    const user=await User.findByIdAndDelete(id)
    //delete orders
    res.redirect("/admin/customer/all")

  } catch (error) {
    
  }
}
