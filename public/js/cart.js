
// function getCart() {
//     const cart = localStorage.getItem("cart");
//     return cart ? JSON.parse(cart) : []
// }
// function saveCart(cart) {
//     localStorage.setItem("cart", JSON.stringify(cart));
// }
// function addToCart(product) {
//     product = JSON.parse(product)
//     // console.log(product)
//     const cart = getCart()
//     console.log("get cart")
//     let existingItem = cart.find(item => item.id === product._id)
//     console.log("existing;", existingItem)
//     if (existingItem) {
//         existingItem.quantity++;
//         console.log(existingItem.quantity)
//         console.log("in existing")
//         saveCart(cart)
//         // alert(existingItem.name+" "+"added to cart")
//         return 1;

//     }
//     const cartElement = {
//         id: product._id,
//         image: product.imageLink,
//         name: product.name,
//         price: product.price,
//         quantity: 1
//     }

//     cart.push(cartElement)
//     // console.log(cart)
//     saveCart(cart)
//     displayCartNum(cartNum)
//     console.log("added to cart")
//     // alert(cartElement.name+" "+"added to cart")
// }

// function removeFromCart(product) {
//     product = JSON.parse(product)
//     console.log("in func")
//     // const itemIndex=cart.findIndex(item=>item.id===product.id)

//     console.log(product)
//     let cart = getCart()
//     cart = cart.filter((item) => item.id !== product._id)
//     saveCart(cart)
// }
// function displayCart() {
//     let items = localStorage.getItem("cart")
//     console.log("localStorage", items)
//     // let items=encodeURIComponent(items1.id)
//     // if(items==[] || items=="[]"){
//     //     const info="cart is empty"
//     //     window.location.href=`/cart?data=cart is empty`
//     //     return 0;
//     // }
//     // if(items.length==0){
//     //     return window.location.href=`/cartE`
//     // }
//     window.location.href = `/cart?data=${items}`
//     console.log("localStorage", items)

// }
// function addToCart2(productId) {
//     productId = JSON.parse(productId)
//     // console.log("product",product)
//     const cart = getCart()
//     // console.log("get cart",cart)
//     let existingItem = cart.find(item => item.id === productId)

//     console.log("existing;", existingItem)
//     if (existingItem) {
//         // console.log("before",product.quantity)
//         existingItem.quantity++
//         console.log(existingItem.quantity)
//         console.log("in existing")
//         saveCart(cart)
//         displayCart()
//         return 1;

//     }

// }
// function removeFromCart2(productId) {
//     productId = JSON.parse(productId)
//     // console.log("product",product)
//     const cart = getCart()
//     // console.log("get cart",cart)
//     let existingItem = cart.find(item => item.id === productId)

//     console.log("existing;", existingItem)
//     if (existingItem) {
//         // console.log("before",product.quantity)
//         existingItem.quantity--;
//         let postDeletedCart = cart.filter(item => item.id !== existingItem.id)
//         if (existingItem.quantity <= 0) {
//             saveCart(postDeletedCart)
//             displayCart()
//             return 2;
//         }
//         console.log(existingItem.quantity)
//         console.log("in existing")
//         saveCart(cart)
//         displayCart()
//         return 1;

//     }
// }
// function deleteCartItem(productId) {
//     productId = JSON.parse(productId)
//     const cart = getCart()
//     let updatedCart = cart.filter(item => item.id !== productId)
//     saveCart(updatedCart)
//     displayCart()
    
// }
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

// // history.pushState(null,"","/rider")
// window.addEventListener('popstate', function (e) {
//     alert("button is pressed")
// })
// if (window.location.href === "http://localhost:5000/cart?data=[]") {
//     window.history.pushState(null, "", location.href)//pushing a dummy state
//     window.history.pushState(null, "", location.href)//pushing a dummy state


//     window.addEventListener("popstate" , function () {
//         console.log('working')

//         window.location.replace("/")
//     })
// }
