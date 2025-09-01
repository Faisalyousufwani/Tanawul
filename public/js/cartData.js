function getCart() {
    const cart = sessionStorage.getItem("cart");
    return cart ? JSON.parse(cart) : []
}
function clearCart(){
    sessionStorage.clear()
}
// storing cart items in cookie
function saveCart(cart) {
    sessionStorage.setItem("cart", JSON.stringify(cart));
}

function refresh() {
    window.location.reload(true)
    // location.href=location.href+'?t='+new Date().getTime()
}

function addToCart(id,resId){
    // id= JSON.parse(id)
    // resId=JSON.parse(resId)
    console.log(id,resId)
    const cart = getCart()
    // console.log("get cart",cart)
    let existingItem = cart.find(item => item.itemId === id)
    console.log("existing fired", existingItem)
    if(existingItem){
        existingItem.quantity++;
        saveCart(cart)
        send2()
        console.log("in existing",existingItem)
        return 1;
    }
    const item={
        itemId:id,
        quantity:1,
        resId:resId
    }
    cart.push(item)
    saveCart(cart)
    // displayCartNum(cartNum)
    console.log(cart)
    send2()
    // refresh()
}


function send2(){
const cartData=getCart()
// cartData.map((x)=>console.log("cart item"+JSON.stringify(x)))//need to stringfy else it shows [object object]
// console.log(cartData+"cartData")
const options={
    method:'POST',
    headers:{
        'Content-Type':'application/json'
    },
    body:JSON.stringify({cart:cartData})
}
fetch('/cart',options).then(response=>response.json()).then(data=>{console.log("success",data)}).catch(error=>console.log(error))
}


function addToCart2(productId) {
    productId = JSON.parse(productId)
    // console.log("product",product)
    const cart = getCart()
    console.log("get cart",cart)
    let existingItem = cart.find(item => item.itemId === productId)

    console.log("existing;", existingItem)
    if (existingItem) {
        // console.log("before",product.quantity)
        existingItem.quantity++
        
        saveCart(cart)
        send2()
        refresh()
        return 1;

    }

}

function removeFromCart2(productId) {
    productId = JSON.parse(productId)
    // console.log("product",product)
    const cart = getCart()
    // console.log("get cart",cart)
    let existingItem = cart.find(item => item.itemId === productId)

    console.log("existing;", existingItem)
    if (existingItem) {
        // console.log("before",product.quantity)
        existingItem.quantity--;
        let postDeletedCart = cart.filter(item => item.itemId !== existingItem.itemId)
        if (existingItem.quantity <= 0) {
            saveCart(postDeletedCart)
            send2()
            refresh()
            return 2;
        }
        console.log(existingItem.quantity)
        console.log("in existing")
        saveCart(cart)
        send2()
        refresh()
        return 1;

    }
}
function deleteCartItem(productId) {
    productId = JSON.parse(productId)
    const cart = getCart()
    let updatedCart = cart.filter(item => item.itemId !== productId)
    saveCart(updatedCart)
    send2()
    refresh()
    
}
// function cartNum(){
//     const cart=getCart()
//     const totalDiffrentItems=cart.length;
//     return totalDiffrentItems;
// }

// function displayCartNum(cartNum){
//     let num=cartNum()
//     document.getElementsByClassName("cart-number")[0].innerHTML=num
//     console.log("num",num)
// }
// window.onload(displayCartNum(cartNum))
