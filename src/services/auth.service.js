const {user: User, token: Token} = require('models');
const {bcryptUtils: {hashPassword, comparePassword}, mailerUtils: {sendMail}, jwtUtils: {generateTokens}} = require('utils');
const {redis: {redisClient}} = require('config');
const {mails: {codeMailSub, codeMailHtml}} = require('constants');

const signup = async (data, role) => {
    try {
        console.log('Inside signup service:', data, 'and role:', role);
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
        throw new Error('Email already registered');
        }

        const { firstName, lastName, email, password } = data;
        const hashedPassword = await hashPassword(password);
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); 
        // const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); 

        await redisClient.setEx(
            `verifyCode:${email}`,
            300,
            verificationCode
        );

        const newUserData = {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        };

        const newUser = new User(newUserData);
        await newUser.save();

        await sendMail(email, verificationCode, codeMailSub, codeMailHtml(verificationCode));
        return { success: true, message: `User created successfully and verification code sent to ${email} .` };
    } catch (error) {
        console.error('Error during signup:', error);
        throw new Error(error.message || 'Signup failed');
    }
};


const verifyCode = async (email, code) => {
    console.log("inside verifyCode service: ", email, code)
    try {
        const user = await User.findOne({ email });

        if (!user) {
        throw new Error('User not found');
        }

        if (user.isEmailVerified) {
        throw new Error('Email is already verified');
        }

        const storedCode = await redisClient.get(`verifyCode:${email}`);
        if (!storedCode) {
            throw new Error('Verification code not found or expired');
        }

        // if (!user.verificationCode || !user.verificationCodeExpires) {
        // throw new Error('No verification code found');
        // }

        // if (Date.now() > user.verificationCodeExpires.getTime()) {
        //     user.verificationCode = undefined;
        //     user.verificationCodeExpires = undefined;
        //     await user.save();
        // throw new Error('Verification code has expired');
        // }

        if (storedCode !== code) {
        throw new Error('Incorrect verification code');
        }

        user.isEmailVerified = true;
        // user.verificationCode = undefined;
        // user.verificationCodeExpires = undefined;

        await user.save();

        return { success: true, message: 'Email verified successfully.' };

    } catch (error) {
        console.error('Error verifying code:', error);
        throw new Error(error.message || 'Code verification failed');
    }
};


const login = async (email, password, ip, userAgent) => {
    try {
        console.log("inside login service:", email, password, ip, userAgent)
        const user = await User.findOne({ email });
        if (!user) throw new Error('User does not exist');

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) throw new Error('Email or password is incorrect');

        const { accessToken, refreshToken, csrfToken, jti } = generateTokens(user._id.toString(), user.role);

        await redisClient.setEx(
            `access:${jti}`,
            15 * 60,
            accessToken
        );

        await Token.create({
            user: user._id,
            jti,
            type: 'refresh',
            ip,
            userAgent,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        return {
            success: true,
            message: "User logged in successfully",
            accessToken,
            refreshToken,
            csrfToken,
            user,
            jti
        };
    } catch (error) {
        console.error("Login error:", error);
        throw new Error(error.message || 'Login failed');
    }
};



module.exports = { signup, verifyCode, login };