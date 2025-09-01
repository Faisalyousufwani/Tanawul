const switchBtn=document.getElementById("btn-one")

switchBtn.addEventListener("click",(event)=>{
    event.preventDefault()//prevents the form submissions which is refreshing and reloding 
    console.log("working")
    //btns
    let logIn2=document.getElementsByClassName("logIn2")[0]
    logIn2.classList.toggle("my-visible")
    switchBtn.classList.toggle("my-invisible")
    
   
    //divx
    let signIn=document.getElementsByClassName("signIn")[0]
    signIn.classList.toggle("my-invisible")
    // signIn.style.transform="translateX(-300px)"
    let signUP2=document.getElementsByClassName("signUp-2")[0]
    signUP2.classList.toggle("my-visible")
    //text
    let txt=document.getElementById("text1")
    txt.classList.toggle("my-invisible")
    txt.classList.add('my-overlay')
}) 
