import flash from "connect-flash"

export const localVariables=(req,res,next)=>{
    res.locals.error=req.flash("error")
    res.locals.success=req.flash("success")
    
    next()
}  