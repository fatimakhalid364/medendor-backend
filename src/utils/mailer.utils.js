const nodemailer = require('nodemailer');
const {env: {GMAIL_USER, GMAIL_APP_PASS, }} = require('config');
const mails = require('../constants/index');



const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASS,
    },
});

const sendMail = async (email, code, subject, html) => {
    console.log(`Sending code ${code} to email ${email}`);
    await transporter.sendMail({
        from: GMAIL_USER,
        to: email,
        subject: subject,
        html: html,
    });
};

module.exports = {sendMail};