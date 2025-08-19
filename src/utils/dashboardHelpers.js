
import Order from "../models/order.model.js";

export const todIncome = async( today, now ) => {
    const todayOrders = await Order.aggregate([
        {
            $match : {
                date : {
                    $gte : today,
                    $lt : now
                }
        }
        },
        {
            $unwind : "$products"
        },
        {
            $group : 
            {
                _id : null,
                todayIncome : 
                {
                    $sum : 
                    {
                        $multiply : 
                        [
                            { $toDouble : "$products.quantity"},
                            { $toDouble : "$products.price"}
                        ]
                    }
                }
            }
        },
        {
            $project :
            {
                todayIncome : 1
            }
        }
    ])
    const todayIncome =  todayOrders.length > 0 ? todayOrders[0].todayIncome : 0;
    return todayIncome
}

export const yestIncome =  async ( today, yesterday) => {
    const yesterdayOrders = await Order.aggregate([
        { 
            $match : {
            date : {
                $gte : yesterday,
                $lt : today
            }
        }
        },
        { 
            $unwind : "$products"
        },
        {
            $group : 
            {
                _id : null,
                yesterdayIncome : {
                    $sum : 
                    {
                        $multiply : 
                        [
                            { $toDouble : "$products.quantity" },
                            { $toDouble : "$products.price"}
                        ]
                    }
                }
            }
        },
        {
            $project :
            {
                yesterdayIncome : 1
            }
        }
    ])
    const yesterdayIncome = yesterdayOrders.length > 0 ? yesterdayOrders[0].yesterdayIncome : 0
    return yesterdayIncome
}

export const totRevenue = async () =>  {

    const revenue = await Order.aggregate([
        {
            $match : 
            {
                orderStatus : 
                {
                    $ne : "Pending"
                }
            }
        },
        {
            $group : 
            {
                _id : null,
                revenue : 
                {
                    $sum : "$totalPrice"
                }
            }
        }
    ])

    const totalRevenue = revenue.length > 0 ? revenue[0].revenue : 0
    return totalRevenue
}

export const currentMonthRevenue = async ( currentMonthStartDate, now ) =>{

    const currentMonthRevenue = await Order.aggregate([
        {
            $match : 
            {
                date : 
                {
                    $gte : currentMonthStartDate,
                    $lt : now
                },
                orderStatus :
                {
                    $ne : "Pending"
                }
            }
        },
        {
            $group : 
            {
                _id : null,
                currentMonthRevenue : 
                {
                    $sum : "$totalPrice"
                }
            }
        }
    ])
    const result = currentMonthRevenue.length > 0 ? currentMonthRevenue[0].currentMonthRevenue : 0
    return result
}

export const previousMonthRevenue = async ( previousMonthStartDate, previousMonthEndDate ) => {
    const previousMonthRevenue = await Order.aggregate([
        {
            $match : 
            {
                date : 
                {
                    $gte : previousMonthStartDate,
                    $lt : previousMonthEndDate
                },
                orderStatus :
                {
                    $ne : "Pending"
                }
            }
        },
        {
            $group : 
            {
                _id : null,
                previousMonthRevenue : 
                {
                    $sum : "$totalPrice"
                }
            }
        }
    ])
    const result = previousMonthRevenue.length > 0 ? previousMonthRevenue[0].previousMonthRevenue : 0
    return result
}

export const paymentMehtodAmount = async () => {
    const paymentMethodTotal = await Order.aggregate([
        {
            $match : 
            {
                orderStatus : 
                {
                    $ne : "Pending"
                }
            }
        },
        {
            $group : 
            {
                _id : "$paymentMethod",
                amount : 
                {
                    $sum : "$totalPrice"
                }
            }
        }
    ]) 
    const result = paymentMethodTotal.length > 0 ? paymentMethodTotal : 0
    return result

}

export const dailyChartt = async () => {
    const dailyOrders = await Order.aggregate([
        {
            $match : {
                orderStatus : {
                    $ne : "pending"
                }
            }
        },
        {
            $group : {
                _id : {
                    $dateToString : {
                        format : "%Y-%m-%d",
                        date : "$date"
                    },
                },
                dailyrevenue : {
                    $sum : "$totalPrice"
                }
            }
        },
        {
            $sort : {
                _id : 1
            }
        },
        {
            $limit : 14
        }
    ])

    const result =  dailyOrders || 0
    return result
}

export const categorySaless = async () => {
    const catSales = await Order.aggregate([
        {
            $match : { 
                orderStatus : 
                {
                    $ne : "Pending"
                }
            }
        },
        {
            $unwind : "$products"
        },
        {
            $lookup :
            { 
                from : "products", 
                localField : "products.productId", 
                foreignField : "_id",
                as : "categories"
            }
        },
        {
            $unwind : "$categories"
        },
        {
            $lookup :
            { 
                from : "categories", 
                localField : "categories.category", 
                foreignField : "_id", 
                as: "category"
            } 
        },
        {
            $unwind : "$category"
        },
        {
            $group : 
                {
                _id: "$category.category", 
                qty : 
                    {
                        $sum : "$products.quantity"
                    }
                }
        }
    ])
    return catSales
}
