const {user: User, token: Token} = require('models');
const {session: Session} = require('models/session.model');
const {bcryptUtils: {hashPassword, comparePassword}, mailerUtils: {sendMail}} = require('utils');
const {generateAccessToken, generateRefreshToken} = require('utils/jwt.utils');
const {redis: {redisClient}} = require('config');
const {codeMailSub, codeMailHtml, resetPasswordMailSub, resetPasswordMailHtml} = require('constants/mails');
const { v4: uuidv4 } = require('uuid');
const {generateRandomToken, safeCompare, hashToken, generateRandomIdOrJti} = require('utils/crypto.utils');
const {ACCESS_TOKEN_TTL_MS, ABSOLUTE_TTL_MS, SLIDING_TTL_MS} = require('config/auth.config');
const {calculateSessionExpiry, cacheSession} = require('utils/session.utils');
const {syncRevokedSessionToRedis, revokeSession, revokeAndSyncSessionToRedis, rotateSession} = require('./session.service');
const {convertToPublicUser} = require('utils/serializers.utils');
const AppError = require('utils/AppError');
const {FRONTEND_URL} = require('config/env');

const signup = async (data, role) => {
    console.log('Inside signup service:', data, 'and role:', role);
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
        throw new AppError(
            'Email already registered.',
            409,
            'EMAIL_ALREADY_REGISTERED'
        );
    }

    const { firstName, lastName, email, password } = data;
    const hashedPassword = await hashPassword(password);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); 
    // const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); 

    try {
            await redisClient.setEx(
            `verifyCode:${email}`,
            300,
            verificationCode
        );
    }catch(error){
        console.error(
            'Setting verififcation code in redis failed: ', 
            error
        )

        throw new AppError(
            'Authentication service is temporarily unavailable.',
            503,
            'AUTH_SERVICE_TEMPORARILY_UNAVAILABLE',
        );
    }

    const newUserData = {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
    };

    const newUser = new User(newUserData);
    try {

        await newUser.save();

    } catch (error) {

        console.error(
            'Creating user in MongoDB failed:',
            error
        );

        throw new AppError(
            'Unable to create your account right now.',
            500,
            'USER_CREATION_FAILED',
        );
    }

    try {
        await sendMail(
            email,
            codeMailSub,
            codeMailHtml(verificationCode)
        );

        } catch (error) {

            console.error(
                'Sending verification email failed:',
                error
            );

            throw new AppError(
                'Unable to send the verification email right now. Please try again.',
                503,
                'VERIFICATION_EMAIL_SEND_FAILED',
            );
        }
    return { 
        success: true,
        code: 'LOGIN_SUCCESSFUL',
        message: `User created successfully and verification code sent to ${email} .` 
    };
};


const verifyCode = async (email, code) => {
    console.log("inside verifyCode service: ", email, code)
    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError(
            'Unable to verify code because the user was not found.',
            404,
            'VERIFICATION_USER_NOT_FOUND'
        );
    }

    if (user.isEmailVerified) {
        throw new AppError(
            'Email is already verified.',
            409,
            'EMAIL_ALREADY_VERIFIED'
        );
    }

    let storedCode;

    try {
        storedCode = await redisClient.get(`verifyCode:${email}`);
    } catch (error) {
        console.error('Redis error while retrieving verification code:', error);

        throw new AppError(
            'Authentication service is temporarily unavailable.',
            503,
            'AUTH_SERVICE_TEMPORARILY_UNAVAILABLE'
        );
    }

    if (!storedCode) {
        throw new AppError(
            'Verification code not found or expired.',
            400,
            'VERIFICATION_CODE_NOT_FOUND_OR_EXPIRED'
        );
    }

    if (storedCode !== code) {
            throw new AppError(
            'Invalid verification code.',
            400,
            'INVALID_VERIFICATION_CODE'
        );
    }

    user.isEmailVerified = true;

    await user.save();

    return { 
        success: true,
        code: 'EMAIL_VERIFICATION_SUCCESSFUL',
        message: 'Email verified successfully.' 
    };
};


const login = async (email, password, ip, userAgent) => {
    console.log("inside login service:", email, password, ip, userAgent)
    const user = await User.findOne({ email });
    if (!user)  throw new AppError(
        'User not found. Please signup before login',
        404,
        'USER_NOT_FOUND'
    );

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new AppError(
        'Invalid email or password.',
        401,
        'INVALID_CREDENTIALS'
    );

    if (!user.isEmailVerified) {
        throw new AppError(
            'Please verify your email before logging in.',
            403,
            'EMAIL_NOT_VERIFIED'
        );
    }

    const sessionId = generateRandomIdOrJti();

    const {expiresAt, absoluteExpiresAt} = calculateSessionExpiry();

    const refreshJti = generateRandomIdOrJti();

    const accessJti = generateRandomIdOrJti();

    const csrfToken = generateRandomToken();

    const accessToken = 
        generateAccessToken({
            userId: user._id,
            sessionId,
            expiresAt,
            accessJti
        });

    const refreshToken =
        generateRefreshToken({
            userId: user._id,
            sessionId,
            expiresAt,
            refreshJti
        });

    const refreshTokenHash = hashToken(refreshToken);

    const csrfTokenHash = hashToken(csrfToken);

    const session = new Session({
        sessionId,
        user: user._id,
        refreshTokenHash: refreshTokenHash,
        refreshJti,
        csrfTokenHash: csrfTokenHash,
        expiresAt,
        absoluteExpiresAt,
        lastActivityAt: new Date(),
        version: 0
    });

    await session.save();

    let cached;

    try {
        cached =
            await cacheSession(session, user.role);

    } catch (cacheError) {
        console.error(
            'Redis session cache failed during login:',
            cacheError
        );

        await revokeAndSyncSessionToRedis(session, 'Redis cache failure during login.');
        throw new AppError(
            'Authentication service is temporarily unavailable. Please try again.',
            503,
            'AUTH_SERVICE_TEMPORARILY_UNAVAILABLE'
        );
    }

    return {
        success: true,
        code: 'LOGIN_SUCCESSFUL',
        message: "User logged in successfully",
        accessToken,
        refreshToken,
        csrfToken,
        user: convertToPublicUser(user)
    };
};

const forgotPassword = async(email) => {
    const user = User.findOne({email});

    if (!user){
        throw new AppError(
            'You do not have an account. Please sign up.',
            401,
            'USER_NOT_FOUND'
        )
    }

    const resetToken = generateRandomToken();

    const resetTokenHash =
        hashToken(resetToken);

    try {
        await redisClient.setEx(
            `password-reset:${resetTokenHash}`,
            900,
            user._id.toString()
        );
    } catch (error) {
        console.error(
            'Failed to store password reset token:',
            error
        );

        throw new AppError(
            'Authentication service is temporarily unavailable.',
            503,
            'AUTH_SERVICE_TEMPORARILY_UNAVAILABLE'
        );
    }

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    try {
        await sendMail(
            email,
            resetPasswordMailSub,
            resetPasswordMailHtml(resetUrl)
        );

        } catch (error) {

            console.error(
                'Sending reset-password email failed:',
                error
            );

            throw new AppError(
                'Unable to send the reset-password email right now. Please try again.',
                503,
                'RESET_PASSWORD_EMAIL_SEND_FAILED',
            );
        }
}

const logout = async (
    sessionId
) => {

    console.log('Inside logout service with sessionId: ', sessionId);
    let revokedSession;

    try {
        revokedSession = await revokeSession(
            sessionId,
            'User logout'
        );
    } catch (error) {
        console.error(
            'MongoDB session revoke failed:',
            error
        );

        throw new AppError(
            'Authentication service is temporarily unavailable. Please try again later.',
            503,
            'AUTH_SERVICE_TEMPORARILY_UNAVAILABLE'
        );
    }

    if (!revokedSession) {
        return {
            success: true,
            code: 'ALREADY_LOGGED_OUT',
            message: 'You are already logged out.'
        };
    }

    try {
        await syncRevokedSessionToRedis(
            revokedSession
        );
    } catch (error) {
        console.error(
            'Failed to synchronize revoked session to Redis:',
            error
        );

        throw new AppError(
            'Authentication service is temporarily unavailable. Please try again later.',
            503,
            'AUTH_SERVICE_TEMPORARILY_UNAVAILABLE'
        );
    }

    return {
        success: true,
        code:'LOGOUT_SUCCESSFUL',
        message: 'User logged out successfully'
    }

};

const refreshAccessToken = async (
    session,
    refreshToken,
    userId
) => {

    console.log('Inside refreshAccessToken service with session: ', session, 'incomingRefreshHash: ', incomingRefreshHash, 'and userId: ', userId)

    const user = await User.findOne({ userId });
    const incomingRefreshHash = hashToken(refreshToken);

    const {
        updatedSession,
        newAccessToken,
        newRefreshToken,
        newCsrfToken
    } = await rotateSession(
        incomingRefreshHash,
        session
    );

    let cached;

    try {
        cached =
            await cacheSession(updatedSession, user.role);

    } catch (cacheError) {
        console.error(
            'Redis session cache failed during login:',
            cacheError
        );

        await revokeAndSyncSessionToRedis(updatedSession, 'Redis cache failure during login.');
        throw new AppError(
            'Authentication service is temporarily unavailable. Please try again.',
            503,
            'AUTH_SERVICE_TEMPORARILY_UNAVAILABLE'
        );
    }

    return {
        success: true,
        code: 'ACCESS_TOKEN_REFRESH_SUCCESSFUL',
        message: 'Access token refreshed successfully',
        newAccessToken,
        newRefreshToken,
        newCsrfToken
    };
};



module.exports = { signup, verifyCode, login, logout, refreshAccessToken };