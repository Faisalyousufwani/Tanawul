import Category from '../models/categoryModel.js'
import Offer from '../models/offerModel.js'
import{CATEGORY_PER_PAGE} from "../utils/paginationHelper.js"





export const    getCategory = async ( req, res ) => {
        try {
            const { search, sortData, sortOrder } = req.query
            let page = Number(req.query.page);
            if (isNaN(page) || page < 1) {
            page = 1;
            }
            const condition = {}
            if ( search ){
                condition.$or = [
                    { category : { $regex : search, $options : "i" }} 
                ]
            }
            const sort = {}
            if( sortData ) {
                if( sortOrder === "Ascending" ){
                    sort[sortData] = 1
                } else {
                    sort[sortData] = -1
                }
            }

            const availableOffers = await Offer.find({ status : true, expiryDate : { $gte : new Date() }})
            const categoryCount = await Category.find( condition ).countDocuments()
            const category = await Category.find( condition ).populate('offer')
            .sort( sort ).skip(( page - 1 ) * CATEGORY_PER_PAGE ).limit( CATEGORY_PER_PAGE )
            res.render( 'admin/category', {
                admin : req.session.admin,
                category : category,
                err : req.flash('categoryExist'),
                success : req.flash('success'),
                currentPage : page,
                hasNextPage : page * CATEGORY_PER_PAGE < categoryCount,
                hasPrevPage : page > 1,
                nextPage : page + 1,
                prevPage : page -1,
                lastPage : Math.ceil( categoryCount / CATEGORY_PER_PAGE ),
                search : search,
                sortData : sortData,
                sortOrder : sortOrder,
                availableOffers : availableOffers
            } )

        } catch (error) {
            console.log(error)

        }

    }
    
export const    addCategory = async ( req, res ) => {

        try {
            const cat = req.body.category.toUpperCase()
            const category = await Category.findOne( { category : req.body.category.toUpperCase() })
            if( category ) {
                req.flash('categoryExist','Category already exist')
                res.redirect( '/admin/category')
            } else {
                const categoryName = new Category({
                    category : req.body.category.toUpperCase()
                })
                await categoryName.save()
                req.flash('success',`${cat} successfully added to category`)
                res.redirect('/admin/category')
            }
            
        } catch (error) {
            res.redirect('/500')

        }

    }
    
export const    listCategory = async ( req, res ) => {

        try {
            await Category.updateOne({ _id : req.params.id }, { $set : { status : true } })
            res.redirect('/admin/category')
        } catch (error) {
            res.redirect('/500')

        }
    }

export const    unlistCategory = async ( req, res ) => {

        try {
            await Category.updateOne({ _id : req.params.id },{ $set : { status : false}})
            res.redirect('/admin/category')
        } catch (error) {
            res.redirect('/500')

        }

    }

 export const   getEditCategory = async ( req, res ) => {

        try {
            const category = await Category.findOne({ _id : req.params.id })
            res.render('admin/edit-category',{
                admin : req.session.admin,
                category : category
            })
        } catch (error) {
            res.redirect('/500')

        }
    }

export const    editCategory = async ( req, res ) => {

        try {
            const updatedCategory = req.body.category.toUpperCase()
            await Category.updateOne( { _id : req.body.categoryId },{
                category : updatedCategory
            }) 
            res.redirect('/admin/category')
            
        } catch (error) {
            res.redirect('/500')

        }
    }

export const    applyCategoryOffer = async ( req, res ) => {
        try {
            const { offerId, categoryId } = req.body
            await Category.updateOne({ _id : categoryId },{
                $set : {
                    offer : offerId 
                }
            })
            res.json({ success : true })
        } catch (error) {
            res.redirect('/500')

        }
    }

export const    removeCategoryOffer = async ( req, res ) => {
        try {
            const { categoryId } = req.body
            await Category.updateOne({ _id : categoryId}, {
                $unset : {
                    offer : ""
                }
            })
            res.json({ success : true })
        } catch (error) {
            res.redirect('/500')

        }
    }
