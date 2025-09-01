// document.getElementById("checkout").addEventListener("click",send)
// function send(){
// const cartData=JSON.parse(localStorage.getItem("cart"))||[]
// console.log(cartData)
// const options={
//     method:'POST',
//     headers:{
//         'Content-Type':'application/json'
//     },
//     body:JSON.stringify({cart:cartData})
// }
// fetch('/cart/checkout',options).then(response=>response.json()).then(data=>{
//     if(data.redirectUrl){
//         window.location.href=data.redirectUrl
//     }
//     console.log("success",data)}).catch(error=>console.log(error))
// }

