require("dotenv").config();

module.exports = {

    username: process.env.YO_USERNAME,

    password: process.env.YO_PASSWORD,

    subscriptionKey: process.env.YO_SUBSCRIPTION_KEY,

    environment: process.env.YO_ENVIRONMENT,

    baseURL: process.env.YO_BASE_URL

};