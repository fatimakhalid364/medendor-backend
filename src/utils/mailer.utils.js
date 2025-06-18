const nodemailer = require('nodemailer');
const {env: {GMAIL_USER, GMAIL_APP_PASS, }} = require('config')

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         type: 'OAuth2',
//         user: GMAIL_USER,
//         pass: GMAIL_APP_PASS,
//         clientId: GMAIL_CLIENT_ID,
//         clientSecret: GMAIL_CLIENT_SECRET,
//         refreshToken: GMAIL_REFRESH_TOKEN,
//     },
//     socketTimeout: 30000, 
//     connectionTimeout: 30000, 
//     tls: {
//         rejectUnauthorized: true, 
//         minVersion: 'TLSv1.2' 
//     },

// });


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASS,
    },
});

const sendCode = async (email, code) => {
    console.log(`Sending code ${code} to email ${email}`);
    await transporter.sendMail({
        from: GMAIL_USER,
        to: email,
        subject: 'Your Secret Code',
        text: `Your verification code is: ${code}`,
    });
};

module.exports = {sendCode};