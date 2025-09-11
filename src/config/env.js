require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MODE === "development" ? process.env.MONGO_URI_LOCAL : process.env.MONGO_URI_LIVE,
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_APP_PASS: process.env.GMAIL_APP_PASS,
    GMAIL_CLIENT_ID: process.env.GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET: process.env.GMAIL_CLIENT_SECRET,
    GMAIL_REFRESH_TOKEN: process.env.GMAIL_REFRESH_TOKEN,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    CSRF_TOKEN_SECRET: process.env.CSRF_TOKEN_SECRET,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD
}