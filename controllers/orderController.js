const Order = require("../models/orderModel");
const Cart = require("../models/Cart");
const Product = require("../models/productModel");

// ===========================================
// PLACE ORDER
// ===========================================

exports.checkout = (req, res) => {

    if (!req.session.customer) {

        return res.status(401).json({
            success: false,
            message: "Please login first."
        });

    }

    const customerId = req.session.customer.id;

    const paymentMethod =
        req.body.payment_method || "Cash on Delivery";

    Cart.getCart(customerId, (err, cart) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Unable to load cart."
            });

        }

        if (cart.length === 0) {

            return res.status(400).json({
                success: false,
                message: "Your cart is empty."
            });

        }

        let total = 0;

        cart.forEach(item => {

            total += item.price * item.quantity;

        });

        const order = {

            customer_id: customerId,

            total: total,

            payment_method: paymentMethod,

            payment_status: "Pending",

            status: "Pending"

        };

        Order.create(order, (err, result) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Unable to create order."
                });

            }

            const orderId = result.insertId;

            let completed = 0;

            cart.forEach(item => {

                Order.addItem({

                    order_id: orderId,

                    product_id: item.product_id,

                    quantity: item.quantity,

                    price: item.price

                }, (err) => {

                    if (err) {

                        console.error(err);

                        return;

                    }

                    Product.reduceStock(

                        item.product_id,

                        item.quantity,

                        () => {}

                    );

                    completed++;

                    if (completed === cart.length) {

                        Cart.clear(customerId, () => {

                            res.json({

                                success: true,

                                message:
                                    "Order placed successfully.",

                                order_id: orderId,

                                total: total

                            });

                        });

                    }

                });

            });

        });

    });

};


// ===========================================
// CUSTOMER ORDERS
// ===========================================

exports.myOrders = (req, res) => {

    if (!req.session.customer) {

        return res.status(401).json({
            success: false,
            message: "Please login."
        });

    }

    Order.getCustomerOrders(

        req.session.customer.id,

        (err, rows) => {

            if (err) {

                console.error(err);

                return res.status(500).json(err);

            }

            res.json(rows);

        }

    );

};

// ===========================================
// ADMIN: GET ALL ORDERS
// ===========================================

exports.getAllOrders = (req,res)=>{


    Order.getAll((err, orders)=>{


        if(err){

            console.error(err);

            return res.status(500).json({

                success:false,

                message:"Unable to load orders"

            });

        }


        res.json({

            success:true,

            orders

        });


    });


};





// ===========================================
// ADMIN: GET SINGLE ORDER DETAILS
// ===========================================

exports.getOrderDetails = (req,res)=>{


    const orderId = req.params.id;


    Order.getById(

        orderId,

        (err, order)=>{


            if(err){

                return res.status(500).json(err);

            }



            if(order.length === 0){

                return res.status(404).json({

                    message:"Order not found"

                });

            }




            Order.getItems(

                orderId,

                (err,items)=>{


                    if(err){

                        return res.status(500)
                        .json(err);

                    }



                    res.json({

                        order:order[0],

                        items

                    });



                }

            );



        }

    );


};






// ===========================================
// ADMIN: UPDATE ORDER STATUS
// ===========================================

exports.updateOrderStatus = (req,res)=>{


    const id =
    req.params.id;


    const status =
    req.body.status;



    Order.updateStatus(

        id,

        status,

        (err,result)=>{


            if(err){

                return res.status(500)
                .json(err);

            }


            res.json({

                success:true,

                message:
                "Order status updated"

            });



        }

    );


};






// ===========================================
// ADMIN: UPDATE PAYMENT STATUS
// ===========================================

exports.updatePaymentStatus = (req,res)=>{


    Order.updatePayment(

        req.params.id,

        req.body.payment_status,

        (err)=>{


            if(err){

                return res.status(500)
                .json(err);

            }


            res.json({

                success:true,

                message:
                "Payment status updated"

            });


        }

    );


};
