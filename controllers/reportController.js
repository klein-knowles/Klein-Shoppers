const Report=require("../models/reportModel");

exports.daily=(req,res)=>{

    Report.daily((err,rows)=>{

        if(err){

            return res.status(500).json(err);

        }

        res.json(rows[0]);

    });

};

exports.weekly=(req,res)=>{

    Report.weekly((err,rows)=>{

        if(err){

            return res.status(500).json(err);

        }

        res.json(rows[0]);

    });

};

exports.monthly=(req,res)=>{

    Report.monthly((err,rows)=>{

        if(err){

            return res.status(500).json(err);

        }

        res.json(rows[0]);

    });

};

exports.custom=(req,res)=>{

    const{

        start,

        end

    }=req.query;

    Report.custom(

        start,

        end,

        (err,rows)=>{

            if(err){

                return res.status(500).json(err);

            }

            res.json(rows[0]);

        }

    );

};

exports.orders=(req,res)=>{

    const{

        start,

        end

    }=req.query;

    Report.orders(

        start,

        end,

        (err,rows)=>{

            if(err){

                return res.status(500).json(err);

            }

            res.json(rows);

        }

    );

};