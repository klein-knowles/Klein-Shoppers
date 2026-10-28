const axios = require("axios");

const config = require("../config/yopayments");

const { v4: uuid } = require("uuid");

class YoPayments {

    constructor(){

        this.client = axios.create({

            baseURL: config.baseURL,

            timeout:15000,

            headers:{

                "Ocp-Apim-Subscription-Key":

                config.subscriptionKey,

                "Content-Type":"application/json"

            }

        });

    }

    async collectMoney({

        phone,

        amount,

        orderId,

        customer

    }){

        const reference = uuid();

        const payload={

            reference,

            amount,

            phone,

            currency:"UGX",

            customer,

            orderId

        };

        try{

            const response =

                await this.client.post(

                    "/collection",

                    payload,

                    {

                        auth:{

                            username:config.username,

                            password:config.password

                        }

                    }

                );

            return{

                success:true,

                reference,

                data:response.data

            };

        }

        catch(error){

            return{

                success:false,

                error:error.response?.data ||

                error.message

            };

        }

    }

}

module.exports=new YoPayments();