const {user: User, token: Token} = require('models');
const {bcryptUtils: {hashPassword, comparePassword}, mailerUtils: {sendCode}, jwtUtils: {generateTokens}} = require('utils');
const {redis: {redisClient}} = require('config');

const signup = async (data, role) => {
    try {
        console.log('Inside signup service:', data, 'and role:', role);
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
        throw new Error('Email already registered');
        }

        const { name, email, password } = data;
        const hashedPassword = await hashPassword(password);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); 
        const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); 

        const newUserData = {
        name,
        email,
        password: hashedPassword,
        role,
        verificationCode,
        verificationCodeExpires,
        };

        const newUser = new User(newUserData);
        await newUser.save();

        await sendCode(email, verificationCode);
        return { success: true, message: `User created successfully and verification code sent to ${email} .` };
    } catch (error) {
        console.error('Error during signup:', error);
        throw new Error(error.message || 'Signup failed');
    }
};


const verifyCode = async (email, code) => {
    try {
        const user = await User.findOne({ email });

        if (!user) {
        throw new Error('User not found');
        }

        if (user.isEmailVerified) {
        throw new Error('Email is already verified');
        }

        if (!user.verificationCode || !user.verificationCodeExpires) {
        throw new Error('No verification code found');
        }

        if (Date.now() > user.verificationCodeExpires.getTime()) {
            user.verificationCode = undefined;
            user.verificationCodeExpires = undefined;
            await user.save();
        throw new Error('Verification code has expired');
        }

        if (user.verificationCode !== code) {
        throw new Error('Incorrect verification code');
        }

        user.isEmailVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;

        await user.save();

        return { success: true, message: 'Email verified successfully.' };

    } catch (error) {
        console.error('Error verifying code:', error);
        throw new Error(error.message || 'Code verification failed');
    }
};



module.exports = { signup, verifyCode };