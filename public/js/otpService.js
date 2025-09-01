document.addEventListener("DOMContentLoaded",function(){
        let savedSection1={}
        let savedSection2={}
        let sendOtp=document.getElementById('sendOtp')
    sendOtp.addEventListener("click",function(event){
        event.preventDefault()
        const section1=document.querySelector("#section1");
        const inputs=section1.querySelectorAll("input")
        const data={}
        inputs.forEach(input=>{data[input.name]=input.value})
        savedSection1=data;
        fetch("/auth/sentOtp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(savedSection1)}).then((res)=>res.json()).then((result)=>document.getElementById("outputMessage").innerText=result.message).catch((err)=>console.log(err))
    })
    document.getElementById("verifyOtp").addEventListener("click",(event)=>{
        event.preventDefault()
        //  const input=document.getElementById("otp").value
         const section2=document.querySelector("#section2");
        const inputs2=section2.querySelectorAll("input")
        const data2={}
        inputs2.forEach(input=>{data2[input.name]=input.value})
        savedSection2=data2;
        // console.log(input)
        fetch("/auth/verify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(savedSection2)}).then((res)=>res.json()).then((result)=>document.getElementById("outputMessage").innerText=result.message).catch((err)=>console.log(err))
    })
    })
  