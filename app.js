import express from "express"
import path from "path"
import ejsMate from "ejs-mate"
import cookieParser from "cookie-parser"
import cors from "cors"
import { configDotenv } from "dotenv"
import { fileURLToPath } from "url"
import session from "express-session"
import flash from "connect-flash"
import methodOverride from "method-override"



import navRouter from "./src/routes/nav.routes.js"
import menuRouter from "./src/routes/menu.routes.js"
import authRouter from "./src/routes/auth.routes.js"
import cartRouter from "./src/routes/cart.routes.js"
import profileRouter from "./src/routes/profile.routes.js"
import connectDB from "./src/db/db.connect.js"
import { localVariables } from "./src/middlewares/flash.messages.locals.middleware.js"
import { generalMiddleware ,authMiddleware, cartNum,authRole} from "./src/middlewares/auth.middleware.js"
import orderRouter from "./src/routes/order.routes.js"
import adminRouter from "./src/routes/admin.routes.js"
import restaurantRouter from "./src/routes/restaurant.admin.routes.js"
import RestaurantPublicRouter from "./src/routes/restaurant.public.routes.js"
import checkoutRouter from "./src/routes/checkout.routes.js"
import paymentRouter from "./src/routes/payment.routes.js"
import { validationRegistration } from "./config/order.validations.js"
configDotenv()
const app=express()

const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)


const port=process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(cookieParser())
app.use(express.static(path.join(__dirname,"public")))
app.use(session({//create session here used for flashing messages
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  }))

app.use(flash()) 

app.set('view engine',"ejs")
app.engine('ejs',ejsMate)
app.set("views",path.join(__dirname,"views"))

connectDB().then(()=>{
    console.log("connection successfull")
}).catch((err)=>{console.log("some error occurred while connected db",err.message)})
app.use("/",(req,res,next)=>{
    res.locals.customer=null;
    next()
})
app.use(generalMiddleware)
app.use(cartNum)
app.use("/",localVariables)

// app.use("/home",navRouter)
app.use("/",navRouter)
app.use("/menu",menuRouter)
app.use("/auth",authRouter)
app.use("/cart",cartRouter)
app.use("/checkout",authMiddleware,checkoutRouter)
app.use("/profile",authMiddleware,methodOverride('_method'), profileRouter)
app.use("/order",authMiddleware,methodOverride('_method'),orderRouter)
app.use("/public",authMiddleware,RestaurantPublicRouter)
app.use("/admin",authMiddleware,methodOverride('_method'),authRole('admin'),adminRouter)
app.use("/restaurant",authMiddleware,authRole('vendor','admin'),methodOverride('_method'),restaurantRouter)
app.use("/payment",authMiddleware,paymentRouter)
app.use("/",(req,res)=>{
    res.send("page not found")
})

app.listen(port,()=>{
    console.log(`listening to port ${port}`)
})