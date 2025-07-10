import jwt from "jsonwebtoken"
export const authMiddleware=(req,res,next)=>{
    const token=req.cookies.token
    if(!token ){
        // return res.status(401).json({
        //     message:"user unauthorised"
        // })
        // console.log(req)
        // req.session.redirectUrl=req.originalUrl
        req.flash("error","you need to login first");
        return res.redirect("/auth")
    }
    try{
        const decodedToken=jwt.verify(token,process.env.JWT_secret)
        req.user=decodedToken;//attaches the user payload to request object //whatever we stored in jwt while verifying that is email and _id  will be stored in req.user
       
        next()
    }
    catch(err){
        // res.status(401).json({
        //     message:"invalid token"
        // })
        req.flash("error","something went wrong")
        res.render("/")
    }
}

export const authRole=(...roles)=>{
  return (req,res,next)=>{
    if(!req.user|| !roles.includes(req.user.role)){
      return res.status(403).json({
        message:`User with role ${req.user ? req.user.role:'none'} is not authorized to access this resource`
      })
    }
    
    next()
  }
}

export const generalMiddleware=(req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_secret);
      res.locals.user = decoded
    } catch (err) {
      res.locals.user = false;
    }
  } else {
    res.locals.user = false;
  }
  next();
};

export const cartNum=(req,res,next)=>{
  const cart=req.cookies.cartItems;
  if(cart){
    // console.log("cart")
    res.locals.cartNumber=cart.length
    return next()
  }
  res.locals.cartNumber=0
  next()
}
