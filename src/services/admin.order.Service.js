// import Order from "../models/user.orders.js"
import Profile from "../models/user.profile.model.js"
export const cancelOrderService = async (id) => {
  //for both admin and resOwner

  // const user=req.user.id
  const order = await Order.findById(id)
  if (!order) {
    req.flash("error", "order not found")
    return res.redirect("/admin/order")
  }
  if (order.status == "cancelled") {
    return res.send("already cancelled")
  }
  if (order.status == "shipped") {
    return res.send("order is shipped can't be cancelled")
  }
  order.status = "cancelled"
  await order.save()

}
export const changeStatusService = async (orderId, status, userId) => {
  try {

    const validStatuses = ["order placed", "shipped", "delivered", "cancelled"]
    if (!validStatuses.indcludes(status)) {
      return res.status(400).json({
        message: "invalid status value"
      })
    }
    const order = await Order.findById(orderId)
    order.status = status
    await order.save()
    req.flash("success", "changed status")

  } catch (error) {
    console.log(error.message)
  }
}

export const orderInfoService = async (id, customerId) => {

  const orderDetails = await Order.findById(id).populate("userItem.itemId")
  const profileDetails = await Profile.findOne({ userId: customerId }).populate("userId")
  return {orderDetails,profileDetails}
}