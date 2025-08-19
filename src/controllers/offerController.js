
import Offer from "../models/offerModel.js"

export const   getOffers = async( req, res ) => {
        try {
            const offers = await Offer.find()
            res.render('admin/offers',{
                offers : offers,
                now : new Date(),
                admin : true
            })
        } catch (error) {
            res.redirect('/500')

        }
    }

export const    getAddOffer = async( req, res ) => {
        try {  
        res.render( 'admin/add-offer', {
            err : req.flash('err'),
            admin : true
        })
        } catch (error) {
            res.redirect('/500')

        }
    }

export const    addOffer = async ( req, res ) => {
        try {
            const { search, page } = req.query
            const { startingDate, expiryDate, percentage } = req.body
            const name = req.body.name.toUpperCase()
            const offerExist = await Offer.findOne({ name : name })
            if( offerExist ) {
                req.flash('err','Offer already exists!!!')
                res.redirect('/admin/add-offer')
            } else {
             const offer = new Offer({
                name : name,
                startingDate : startingDate, 
                expiryDate : expiryDate,
                percentage : percentage,
                search : search,
                page : page
             }) 
             await offer.save()
             res.redirect('/admin/offers')
            }
        } catch (error) {
            error.message
        }
    }

 export const   getEditOffer = async ( req, res ) => {
        try {
            const { id } = req.params
            const offer = await Offer.findOne({ _id : id })
            res.render('admin/edit-offer',{
                admin : true,
                offer : offer
            })
        } catch (error) {
            res.redirect('/500')

        }
    }

export const    editOffer = async ( req, res ) => {
        try {
            const { id, name, startingDate, expiryDate, percentage } = req.body
            await Offer.updateOne({ _id : id }, {
                $set : {
                    name : name.toUpperCase(),
                    startingDate : startingDate,
                    expiryDate : expiryDate,
                    percentage : percentage
                }
            })
            res.redirect('/admin/offers')
        } catch (error) {
            res.redirect('/500')

        }
    }

export const    cancelOffer = async ( req, res ) => {
        try {
            const  { offerId } = req.body
            await Offer.updateOne({ _id : offerId }, {
                $set : {
                    status : false
                }
            })
            res.json({ cancelled : true})
        } catch (error) {
            res.redirect('/500')

        }
    }
