import express from "express"
import Item from "../models/items.js"
import User from "../models/user.model.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
const router = express.Router({ mergeParams: true })
import Restaurant from "../models/restaurant.js"

router.get("/all", async (req, res) => {
    res.redirect("/menu")
   
})
router.get("/:category", async (req, res) => {
    const { category } = req.params
    const allRestaurants = await Restaurant.find({isApproved:true}).populate({path:"foods", match:{ category: category }});

    res.render("menu.ejs", { item: allRestaurants })
})
// router.get("/item/:id", async (req, res) => {
//     const { id } = req.params
//     const item = await Item.findById(id)
//     console.log(id)
//     res.render("desc.ejs", { item })
// })



export default router