import User from '../models/user.model.js'
import Order from '../models/order.model.js'
import Product from '../models/productModel.js'
import {USERS_PER_PAGE} from "../utils/paginationHelper.js"


export const getAdminHome = async( req, res ) => {
        
        try {
            
            const today = new Date();
            today.setHours( 0, 0, 0, 0 )
            const yesterday = new Date(today)
            yesterday.setDate( today.getDate() - 1 );
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();
            const currentMonthStartDate = new Date(currentYear, currentMonth, 1, 0, 0, 0);
            const previousMonthStartDate = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0);
            const previousMonthEndDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
            
            const {incomeToday,totalRevenue,ordersToShip,completedOrders,productCount,monthlyRevenue,userCount}= await getDashboard(currentMonthStartDate,today,now)
           
            const admin=await  User.findOne({_id:req.user.id})
            /
            res.render( 'admin/dashboard', {
                admin : admin,
                totalRevenue : totalRevenue,
                revenueCurrentMonth : monthlyRevenue,
                userCount : userCount,
                ordersToShip : ordersToShip,
                completedOrders : completedOrders,
                productCount : productCount,
               
            } )
        } catch (error) {
            console.log(error)
        }

    }

export const    getUserList = async( req, res ) => {
        try {
            const { search, sortData, sortOrder } = req.query

            let page = Number(req.query.page);
            if (isNaN(page) || page < 1) {
            page = 1;
            }
            const condition = {role:"customer" }
            const sort = {}
            if( sortData ) {
                if( sortOrder === "Ascending" ){
                    sort[sortData] = 1
                } else {
                    sort[sortData] = -1
                }
            }
            if( search ) {
                condition.$or = [
                    { name : { $regex : search, $options : "i" }},
                    { email : { $regex : search, $options : "i" }},
                    { mobile : { $regex : search, $options : "i" }},
                ]
            }
            const userCount = await User.find( condition ).countDocuments()
            const userList = await User.find( condition )
            .sort( sort ).skip(( page - 1 ) * USERS_PER_PAGE ).limit( USERS_PER_PAGE )
            res.render( 'admin/userList', {
                userList : userList,
                admin : req.session.admin,
                currentPage : page,
                hasNextPage : page * USERS_PER_PAGE < userCount,
                hasPrevPage : page > 1,
                nextPage : page + 1,
                prevPage : page -1,
                lastPage : Math.ceil( userCount / USERS_PER_PAGE ),
                search : search,
                sortData : sortData,
                sortOrder : sortOrder
            } )
        } catch ( error ) {

            console.log(error)

        }

    }




