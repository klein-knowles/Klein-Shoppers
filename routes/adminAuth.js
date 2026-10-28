const express=require("express");
const bcrypt=require("bcrypt");

const router=express.Router();

const Admin=require("../models/adminModel");

router.post("/login",(req,res)=>{

    const{

        email,

        password

    }=req.body;

    Admin.findByEmail(email,(err,rows)=>{

        if(err){

            return res.status(500).json(err);

        }

        if(rows.length===0){

            return res.status(401).json({

                success:false,

                message:"Invalid email"

            });

        }

        const admin=rows[0];

        bcrypt.compare(password,admin.password,(err,result)=>{

            if(!result){

                return res.status(401).json({

                    success:false,

                    message:"Invalid password"

                });

            }

            if(admin.status!=="Active"){

                return res.status(403).json({

                    success:false,

                    message:"Account Disabled"

                });

            }

            req.session.admin={

                id:admin.id,

                full_name:admin.full_name,

                email:admin.email,

                role:admin.role

            };

            res.json({

                success:true,

                admin:req.session.admin

            });

        });

    });

});

router.get("/me",(req,res)=>{

    if(!req.session.admin){

        return res.status(401).json({

            loggedIn:false

        });

    }

    res.json({

        loggedIn:true,

        admin:req.session.admin

    });

});

router.post("/logout",(req,res)=>{

    req.session.destroy(()=>{

        res.json({

            success:true

        });

    });

});

module.exports=router;