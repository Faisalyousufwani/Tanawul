import mongoose from "mongoose"
import fs from "fs"

import Category from "../models/categoryModel.js"
import Product from "../models/productModel.js"
import Offer from "../models/offerModel.js"
import cloudinary from "../../config/cloudinary.js"
import { PRODUCT_PER_PAGE, } from "../utils/paginationHelper.js"

import Restaurant from "../models/restaurant.js"


export const deleteImage = async (req, res) => {
    try {
        const id = req.query.id
        const image = req.query.imageId
        const imageUrl=image.split("/").pop().split("?")[0]
        const cleanedUrl=encodeURIComponent(imageUrl)
        
        const rest=await Product.updateOne({ _id: id }, { $pull: { image:{$regex: cleanedUrl+"$"}} })
        console.log(rest)
        res.redirect(`/restaurant/edit-product/${id}`)
    } catch (error) {
        // res.redirect('/500')
        console.log(error)

    }
}

export const getAddProducts = async (req, res) => {
    try {
        const categories = await Category.find({ status: true })
        if (req.user.role === "vendor") {
            return res.render('res/admin/add-products', {
                admin: req.session.admin,
                categories: categories,
                err: req.flash('err')
            })
        }
        res.render('admin/add-products', {
            admin: req.session.admin,
            categories: categories,
            err: req.flash('err')
        })
    } catch (error) {
        res.redirect('/500')

    }
}

export const addProducts = async (req, res) => {
    try {
        const { id } = req.user
        const restaurant = await Restaurant.findOne({ owner: id })
        const filePath = req.file.path
        const result = await cloudinary.uploader.upload(filePath, {
            folder: "food images",
        })
        fs.unlinkSync(filePath)
        const resultLink = result.secure_url;


        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            brand: req.body.brand,
            image: resultLink,
            category: req.body.id,
            quantity: req.body.quantity,
            price: req.body.price,
            restaurant: restaurant._id
        })
        const SaveProduct = await product.save()
        const updatedRestaurantFoods = await Restaurant.findOneAndUpdate({ owner: id }, { $push: { foods: SaveProduct._id } }, { new: true })
      
        res.redirect('/restaurant/products')
    } catch (error) {
        // res.redirect('/500')
        console.log(error)
    }
}

export const getProductsList = async (req, res) => {
    try {
        const { search, sortData, sortOrder } = req.query
        let page = Number(req.query.page);
        if (isNaN(page) || page < 1) {
            page = 1;
        }
        const sort = {}
        const condition = {}
        if (sortData) {
            if (sortOrder === "Ascending") {
                sort[sortData] = 1
            } else {
                sort[sortData] = -1
            }
        }
        if (search) {
            condition.$or = [
                { name: { $regex: search, $options: "i" } },
                { brand: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ]
        }
        const availableOffers = await Offer.find({ status: true, expiryDate: { $gte: new Date() } })
        const productsCount = await Product.find(condition).countDocuments()
        const products = await Product.find(condition).populate('category').populate('offer')
            .sort(sort)
            .skip((page - 1) * PRODUCT_PER_PAGE).limit(PRODUCT_PER_PAGE)
        res.render('admin/products', {
            admin: req.session.admin,
            products: products,
            currentPage: page,
            hasNextPage: page * PRODUCT_PER_PAGE < productsCount,
            hasPrevPage: page > 1,
            nextPage: page + 1,
            prevPage: page - 1,
            lastPage: Math.ceil(productsCount / PRODUCT_PER_PAGE),
            search: search,
            sortData: sortData,
            sortOrder: sortOrder,
            availableOffers: availableOffers
        })
    } catch (error) {
        console.log(error)

    }

}

export const deleteProduct = async (req, res) => {
    try {
        await Product.updateOne({ _id: req.params.id }, { $set: { status: false } })
        if (req.user.role === 'vendor') {
            return res.redirect('/restaurant/products')
        }
        res.redirect('/admin/products')
    } catch (error) {
        res.redirect('/500')

    }
}

export const restoreProduct = async (req, res) => {
    try {
        await Product.updateOne({ _id: req.params.id }, { $set: { status: true } })
        if (req.user.role === 'vendor') {
            return res.redirect('/restaurant/products')
        }
        res.redirect('/admin/products')
    } catch (error) {
        res.redirect('/500')

    }
}

export const getEditProdut = async (req, res) => {
    try {
        const { id } = req.params
        // console.log(id + "id")
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.send("invalid id")
        }
        const product = await Product.findById(id).populate('category')
        const category = await Category.find()
        res.render('res/admin/edit-products', {
            product: product,
            categories: category,
            admin: req.user.id,
            err: req.flash('err')
        })
    } catch (error) {
        // res.redirect('/500')
        console.log(error)

    }
}

export const editProduct = async (req, res) => {
    try {
        const { productId, ...fields } = req.body
        const updates = {}
        for (let key in fields) {
            if (fields[key] && fields[key].trim !== "") {
                updates[key] = fields[key]
            }
        }
        const existingProduct = await Product.findById(productId)
        if (req.file?.path) {
            const filePath = req.file.path
            const result = await cloudinary.uploader.upload(filePath, {
                folder: "food images",
            })
            fs.unlinkSync(filePath)
            updates.$push = { image: result.secure_url }

        }
        const rest = await Product.findOneAndUpdate({ _id: productId }, updates, { new: true })
     
        res.redirect('/restaurant/products')
    } catch (error) {
        // res.redirect('/500')
        console.log(error)

    }
}
export const applyProductOffer = async (req, res) => {
    try {
        const { offerId, productId } = req.body
        await Product.updateOne({ _id: productId }, {
            $set: {
                offer: offerId
            }
        })
        res.json({ success: true })
    } catch (error) {
        res.redirect('/500')

    }
}

export const removeProductOffer = async (req, res) => {
    try {
        const { productId } = req.body
        const remove = await Product.updateOne({ _id: productId }, {
            $unset: {
                offer: ""
            }
        })
        res.json({ success: true })
    } catch (error) {
        res.redirect('/500')

    }
}

