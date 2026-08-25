const {user: User, token: Token} = require('models');
const OutboxEvent = require('models/outboxEvent.model');
const mongoose = require('mongoose');
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
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        console.log(
            'Inside signup service:',
            data,
            'and role:',
            role
        );

        const {
            firstName,
            lastName,
            email,
            password,
        } = data;

        /*
         * Check whether the email already exists.
         */
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({
            email: normalizedEmail,
        }).session(session);

        if (existingUser) {
            throw new AppError(
                'Email already registered.',
                409,
                'EMAIL_ALREADY_REGISTERED'
            );
        }

        /*
         * Hash password.
         */
        const hashedPassword = await hashPassword(password);

        /*
         * Generate verification code.
         */
        const verificationCode = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        /*
         * Create user.
         */
        const newUser = new User({
            firstName,
            lastName,
            email: normalizedEmail,
            password: hashedPassword,
            role,
        });

        await newUser.save({ session });

        /*
         * Create outbox event.
         *
         * IMPORTANT:
         * This is part of the SAME MongoDB transaction.
         */
        const outboxEvent = new OutboxEvent({
            type: 'SEND_VERIFICATION_EMAIL',

            payload: {
                userId: newUser._id.toString(),
                email: normalizedEmail,
                verificationCode,
            },

            status: 'pending',
        });

        await outboxEvent.save({ session });

        /*
         * Commit BOTH:
         *
         * 1. User
         * 2. Outbox event
         *
         * They succeed or fail together.
         */
        await session.commitTransaction();

        return {
            success: true,
            code: 'SIGNUP_SUCCESSFUL',
            message:
                `User created successfully. ` +
                `A verification code will be sent to ${email}.`,
        };

    } catch (error) {

        if (session.inTransaction()) {
            await session.abortTransaction();
        }

        console.error(
            'Signup transaction failed:',
            error
        );

        if (error instanceof AppError) {
            throw error;
        }

        throw new AppError(
            'Unable to create your account right now.',
            500,
            'SIGNUP_FAILED'
        );

    } finally {
        await session.endSession();
    }
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

    console.log('inside forgotPassword service with email: ', email);
    const user = await User.findOne({email});

    if (!user){
        console.error('User not found for this email.')
        return {
            success: true,
            code: RESET_PASSWORD_TOKEN_SENT,
            message: 'If an account exists for this email, you will receive a password reset email.'
        };
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
            'Failed to store password reset token in redis:',
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

            try {
                await redisClient.del(
                    `password-reset:${resetTokenHash}`
                );
            } catch (redisError) {
                console.error(
                    'Failed to remove password reset token from redis:',
                    redisError
                );

                throw new AppError(
                    'Authentication service is temporarily unavailable.',
                    503,
                    'AUTH_SERVICE_TEMPORARILY_UNAVAILABLE'
                )
            }

            throw new AppError(
                'Unable to send the reset-password email right now. Please try again.',
                503,
                'RESET_PASSWORD_EMAIL_SEND_FAILED',
            );
        }
    return ({
        success: true,
        code: RESET_PASSWORD_TOKEN_SENT,
        message: 'If an account exists for this email, you will receive a password reset email.'
    })
}

const resetPassword = async(newPassword, resetTokenHash, userId) => {
    console.log('resetting password with: ', newPassword, resetTokenHash);

    const user = await User.findOneAndUpdate(
        {userId},
        {password: newPassword},
        {
            new: true,
            runValidators: true,
            strict: true
        }

    );

    try {
        await redisClient.del(`password-reset:${resetTokenHash}`)
    }catch(error){
        console.error('Erro occured while deleting reset password token hash fro redis: ', error);
        throw new AppError(
            'Authentication service is temporarily unavailable. Please try again later',
            503,
            'AUTH_SERVICE_TEMPORARILY_UNAVAILABLE'
        )
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



module.exports = { 
    signup, 
    verifyCode, 
    login, 
    logout, 
    refreshAccessToken,
    forgotPassword 
};