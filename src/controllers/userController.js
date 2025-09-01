import * as cryto from "crypto"
import User from "../models/user.model.js"
import Address from "../models/savedAddress.js"
import { razorpayPayment } from "../utils/paymentHelper.js"
import fs from "fs"
export const checkLocation = async (req, res) => {
    const { pincode } = req.body
    
    const rawData = fs.readFileSync("./config/pincodes.json");
    const data = JSON.parse(rawData);
    const pinCodes = data.pin_codes;
    function isDeliverable(pincode) {
        return pinCodes.includes(pincode);
    }


    if (isDeliverable(pincode)) {
        
        return res.send({ message: `Yes, pincode ${pincode} is deliverable in Anantnag.`, success: true })
    } else {
        //   console.log(`Sorry, pincode ${pincodeToCheck} is NOT deliverable in Anantnag.`);
        res.send({ message: "sorry we are not availabe in your area", success: false })
    }
    
}

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user.id })
        res.render('user/profile', {
            user: user
        })
    } catch (error) {
        console.log(error)


    }
}

export const getAddAddress = (req, res) => {
    res.render('user/add-address')
}

export const addAddress = async (req, res) => {
    try {
        const address = new Address({
            fullName: req.body.fullName,
            mobile: req.body.mobile,
            landmark: req.body.landmark,
            street: req.body.street,
            village: req.body.village,
            city: req.body.city,
            pincode: req.body.pincode,
            state: req.body.state,
            country: req.body.country,
            userId: req.user.id
        })
        const result = await address.save()
        await User.updateOne({ _id: req.user.id }, {
            $push: { address: result._id }
        })
        res.redirect('/user/address')
    } catch (error) {
        res.redirect('/500')

    }
}

export const getAddress = async (req, res) => {
    try {
        const user = await User.find({ _id: req.user.id }).populate({
            path: 'address',
            model: 'Address',
            match: { status: true }
        })
        res.render('user/address', {
            user: user[0],
            address: user[0].address
        })
    } catch (error) {
        // res.redirect('/500')
        console.log(error)

    }
}

export const removeAddress = async (req, res) => {
    try {
        const addressId = req.params.id
        await Address.updateOne({ _id: addressId }, {
            $set: { status: false }
        })
        await User.updateOne({ _id: req.user.id }, {
            $pull: { address: addressId }
        })
        res.status(200).json({ success: true })
    } catch (error) {
        res.redirect('/500')

    }
}

export const getEditAddress = async (req, res) => {
    try {
        const addressId = req.params.id
        const address = await Address.findOne({ _id: addressId })
        res.render('user/edit-address', { address: address })
    } catch (error) {
        res.redirect('/500')

    }
}

export const editAddress = async (req, res) => {
    const addressId = req.body.id
    try {
        await Address.updateOne({ _id: addressId }, {
            $set: {
                fullName: req.body.fullName,
                mobile: req.body.mobile,
                landmark: req.body.landmark,
                street: req.body.street,
                village: req.body.village,
                city: req.body.city,
                pincode: req.body.pincode,
                state: req.body.state,
                country: req.body.country
            }
        })
        res.redirect('/user/address')
    } catch (error) {
        res.redirect('/500')

    }
}

export const editProfile = async (req, res) => {
    try {
        console.log(req.body.name)
        const user=await User.updateOne({ _id: req.user.id }, {
            $set: {
                name: req.body.name,
                bio: req.body.bio,
                mobile: req.body.mobile,
                email: req.body.email,
            }
        })
        // console.log(user)
        res.json({ success: true })
    } catch (error) {
        res.redirect('/500')

    }
}

export const getWalletHistory = async (req, res) => {
    try {
        const { id } = req.user
        const userDetails = await User.findOne({ _id: id })
        res.render('user/wallet', {
            user: userDetails
        })

    } catch (error) {
        res.redirect('/500')

    }
}

export const addToWallet = async (req, res) => {
    try {
        const { amount } = req.body
       
        const Id =  cryto.randomBytes(8).toString('hex')
        const payment = await razorpayPayment(Id, amount)
        res.json({ payment: payment, success: true })
    } catch (error) {
        console.log(error)

    }
}

export const razorpayVerifyPayment = async (req, res) => {
    const { id } = req.user
    const { order } = req.body
    await User.updateOne({ _id: id }, {
        $inc: {
            wallet: (order.amount) / 100
        },
        $push: {
            walletHistory: {
                date: Date.now(),
                amount: (order.amount) / 100,
                message: "Deposit from payment gateway"
            }
        }
    })
    res.json({ paid: true })
}



