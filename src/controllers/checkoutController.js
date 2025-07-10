import Item from "../models/items.js"
import Address from "../models/savedAddress.js"


export const getCheckout = async (req, res) => {
    try {
        const user = req.user.id
        const items = req.cookies.cartItems
        if (!items) {
            req.flash("error", "cart is empty add some items")
            return res.redirect("/menu")
        }
        if (items.length == 0) {
            req.flash("error", "cart is empty add some items")
            return res.redirect("/menu")
        }
        const savedAddressProfile = await Address.findOne({ user: user, isDefault: true })
        const output = await Promise.all(items.map(async function (item) {
            const dbMatch = await Item.findById(item.itemId)
            const enrichedMatch = dbMatch.toObject()//removes the meta data of mongoose document
            return { ...enrichedMatch, quantity: item.quantity };
        })
        )
        const output2 = output.reduce(function (acc, curr) {
            acc += (curr.price * curr.quantity);
            return acc
        }, 0)
        res.locals.cartNumber = output.length
        res.render("checkout.ejs", { items: output, totalPrice: output2, AddressProfile: savedAddressProfile,errors:0 })
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        }
        )
    }

}

export const getCheckout2 = async (req, res) => {
    const { id } = req.params;
    const orderItem = await Item.findById(id);
    const totalPrice = orderItem.price
    return res.render("checkoutOrder.ejs", { item: orderItem, totalPrice: totalPrice });
}