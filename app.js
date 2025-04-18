import express from "express"
import path from "path"
import ejsMate from "ejs-mate"


import { fileURLToPath } from "url"

import navRouter from "./src/routes/nav.routes.js"


import connectDB from "./src/db/db.connect.js"

const app=express()
const PORT=5000
const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)




connectDB().then(()=>{
    console.log("connection successfull")
}).catch((err)=>{console.log("some error occurred while connected db",err.message)})



app.use(express.static(path.join(__dirname,"public")))
app.set('view engine',"ejs")
app.engine('ejs',ejsMate)
app.set("views",path.join(__dirname,"views"))

// app.use("/home",navRouter)
app.use("/",navRouter)







app.listen(PORT,()=>{
    console.log(`listening to port ${PORT}`)
})