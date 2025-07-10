import Item from "../models/items.js"

export const getCart= async (req,res)=>{
    try{
        // console.log("cart get")
    const items=req.cookies.cartItems
    // console.log(items)
    if(!items ){ 
                req.flash("error","cart is empty add some items")
                return res.redirect("/menu")
            }
    if(items.length==0){ 
        req.flash("error","cart is empty add some items")
        return res.redirect("/menu")
    }
    
    // console.log(items+"items")
    const output=await Promise.all(items.map (async function (item){
        const dbMatch=await Item.findById(item.itemId)
        console.log(dbMatch+"dbmatch")
        const enrichedMatch=dbMatch.toObject()//removes the meta data of mongoose document
        // console.log(dbMatch)
        return { ...enrichedMatch, quantity:item.quantity};
    })
    )
    const output2=output.reduce(function(acc,curr){
        acc += (curr.price*curr.quantity);  
        return acc
    },0)
    res.locals.cartNumber=output.length
    res.render("cart.ejs",{items:output,totalPrice:output2})
}
catch(err){
    res.status(500).json({
        message:err.message
    })
}
}

export const getCartData=(req,res)=>{
    const items=req.body.cart
    // console.log(JSON.stringify(items)+"items")

    if(req.cookies.cartItems){
        const updatedItems=[...items]
        // console.log(updatedItems)
         res.cookie("cartItems",updatedItems, { maxAge: 43200000, httpOnly: true })
         return res.status(200).json({
            success:true,
            message:"added data"
         })
    }
    res.cookie("cartItems",items, { maxAge: 43200000, httpOnly: true })
   
    res.status(200).json({
            success:true,
            message:"added data"
         })
}

