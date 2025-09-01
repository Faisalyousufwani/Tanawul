// const plus1=document.getElementsByClassName("kutta")[0]

// function getCart(){
//     const cart=localStorage.getItem("cart");
//     return cart?JSON.parse(cart):[]
// }

// plus1.addEventListener('click',(e)=>{
//     console.log("lts go..")
//     console.log(e.target,"target")
//     const cart=getCart()
//     cart.quantity++
//     // incr.push(ite)
//     fetch('/cart',{//cart post route for receiving data from client side cart local storage
//         method:'POST',
//         headers:{'Content-Type':'application/json'},
//         body:JSON.stringify({items:cart})
//     }).then(res=>{
//         window.location.href="/cart/second"// redirect to ejs cart page
//     })
// })