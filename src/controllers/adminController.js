import User from '../models/user.model.js'
import Order from '../models/order.model.js'
import Product from '../models/productModel.js'
import {USERS_PER_PAGE} from "../utils/paginationHelper.js"
import {currentMonthRevenue,previousMonthRevenue,paymentMehtodAmount,todIncome,yestIncome,totRevenue,dailyChartt,categorySaless} from "../utils/dashboardHelpers.js"


export const getAdminHome = async( req, res ) => {
        
        try {
            // console.log("hitttt")
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
            
            
            const promises = [
                currentMonthRevenue( currentMonthStartDate, now ),
                previousMonthRevenue( previousMonthStartDate, previousMonthEndDate ),
               
                paymentMehtodAmount(),
            //   todayIncome(today,now),
            todIncome(today,now),
               yestIncome(today,yesterday),
                // yesterdayIncome( today, yesterday ),
                // totalRevenue(),
                totRevenue(),
                Order.find({ orderStatus : "Confirmed" }).countDocuments(),
                Order.find({ orderStatus : "Delivered" }).countDocuments(),
                User.find({isBlocked : false, isVerified : true}).countDocuments(),

                Product.find({status : true}).countDocuments(),
                // dailyChart(),
                // categorySales()
                dailyChartt(),
                categorySaless()
               
                
            ]
            
            const results = await Promise.all( promises )

            const revenueCurrentMonth = results[0]
            const revenuePreviousMonth = results[1]
            const paymentMethodAmount = results[2]
            const todayIncome = results[3]
            const yesterdayIncome = results[4]
            const totalRevenue = results[5]
            const ordersToShip = results[6]
            console.log('orders to ship'+ordersToShip)
            const completedOrders = results[7]
            const userCount = results[8]
            const productCount = results[9] 
            const dailyChart = results[10]
            const categorySales = results[11]
            const admin=await  User.findOne({_id:req.user.id})

            const razorPayAmount = paymentMethodAmount && paymentMethodAmount.length > 0 ? paymentMethodAmount[0]?.amount.toString() : 0
            const codPayAmount = paymentMethodAmount && paymentMethodAmount.length > 0 ? paymentMethodAmount[1]?.amount.toString() : 0
            const monthlyGrowth = revenuePreviousMonth === 0 ? 100 : ((( revenueCurrentMonth - revenuePreviousMonth ) / revenuePreviousMonth ) * 100).toFixed(1);

            const dailyGrowth = ((( todayIncome - yesterdayIncome ) / yesterdayIncome ) * 100).toFixed( 1 ) 
            // console.log(admin) 
            res.render( 'admin/dashboard', {
                admin : admin,
                todayIncome : todayIncome,
                dailyGrowth : dailyGrowth,
                totalRevenue : totalRevenue,
                revenueCurrentMonth : revenueCurrentMonth,
                monthlyGrowth : monthlyGrowth,
                razorPayAmount : razorPayAmount,
                codPayAmount : codPayAmount,
                userCount : userCount,
                ordersToShip : ordersToShip,
                completedOrders : completedOrders,
                productCount : productCount,
                dailyChart : dailyChart,
                categorySales : categorySales
            } )
        } catch (error) {
            // res.redirect('/500')
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
            const condition = { isAdmin : 0}

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
                    { firstName : { $regex : search, $options : "i" }},
                    { lastName : { $regex : search, $options : "i" }},
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
            // res.redirect('/500')
            console.log(error)

        }

    }

export const    blockUser = async ( req, res ) => {

        try {
            const userId = req.params.id
            const userData = await User.findById( userId )
            await userData.updateOne({ $set : { isBlocked : true }})

            // Checks if the user is in same browser 
            if( req.session.user === userId ){
                // If user is in same browser it deletes 
                delete req.session.user
            }
            
            const sessions = req.sessionStore.sessions;
            for ( const sessionId in sessions ) {
            const session = JSON.parse( sessions[sessionId] );
            if ( session.user === userId ) {
                delete sessions[sessionId];
                break; 
            }
            }
            
            res.json( { success : true } )
            
        } catch ( error ) {
            res.redirect('/500')

        }
       
    }

export const    unBlockUser = async ( req, res ) => {
        try {
            
            const userId = req.params.id
            const userData = await User.findById( userId )
            await userData.updateOne({ $set : { isBlocked : false }})

            res.json( { success : true } )

        } catch ( error ) {
            res.redirect('/500')

        }
    }


