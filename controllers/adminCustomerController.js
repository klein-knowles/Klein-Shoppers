const Customer = require("../models/customerModel");


// ===========================================
// GET ALL CUSTOMERS
// ===========================================

exports.getAllCustomers = (req,res)=>{


    Customer.getAll((err, customers)=>{


        if(err){

            console.error(err);

            return res.status(500).json({

                success:false,

                message:"Unable to load customers."

            });

        }


        res.json(customers);


    });


};





// ===========================================
// GET CUSTOMER DETAILS
// ===========================================

exports.getCustomer = (req,res)=>{


    Customer.getById(

        req.params.id,

        (err,customer)=>{


            if(err){

                return res.status(500).json(err);

            }


            if(customer.length === 0){

                return res.status(404).json({

                    message:"Customer not found"

                });

            }


            res.json(customer[0]);


        }

    );


};