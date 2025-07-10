import express from "express"
import  upload  from "../middlewares/file.multer.middleware.js"
import { editProfile, getProfile } from "../controllers/profileController.js"
const router= express()

router.get("/",getProfile)
router.put("/edit",editProfile)

export default router