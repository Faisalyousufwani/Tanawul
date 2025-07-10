import flash from "connect-flash"

export const localVariables=(req,res,next)=>{
    res.locals.error=req.flash("error")
    res.locals.success=req.flash("success")
    // res.locals.isLogedIn=!!req.user
    //if user is loged in it will store true or false 
    // res.locals.isAuthenticated=false
    // console.log(res.locals.isAuthenticated)
    // res.locals.user=req.user
    // console.log(user)

    // console.log(res.locals.success)
    next()
}  