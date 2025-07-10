import User from "../models/user.model.js";
import Profile from "../models/user.profile.model.js"

export const getProfile= async(req,res)=>{
  try {
      const customerId = req.user.id;
        const profileData=await Profile.findOne({userId:customerId}).populate("userId","-password -role")
        // console.log(profileData+"profileData")
    
     res.render("user/profile.ejs",{profileData})
  } catch (error) {
    
  }
   
}

export const editProfile= async(req,res)=>{
    const {id}=req.user
    console.log(id)
    const{personalInfo}=req.body
    try {
        // const user=await User.findById(id)
        const getProfile=await Profile.findOne({userId:id})
        console.log("getProfile"+ getProfile)
        if(!getProfile){
            console.log("profile not found create new")
         
            const newProfile=new Profile({
                userId:id,
                personalInfo:personalInfo
            })
            const newProfile1=await newProfile.save()
            // console.log(newProfile1)
            const oldUserDetails=await User.findOneAndDelete({userId:id})
            return res.redirect('/profile')
        }
        console.log("profile found need to edit")
        const updatedProfile=await Profile.findOneAndUpdate({userId:id},{personalInfo},{new:true})
        
    //    res.send(updatedProfile)
        res.redirect('/profile')

        
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}