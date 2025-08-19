import express from "express"
import { get404,get500 } from "../controllers/errorController.js"
const router=express.Router()
router.get('/404',get404)
router.get('/500',get500)
export default router