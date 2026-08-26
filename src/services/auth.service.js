const {user: User, token: Token} = require('models');
const OutboxEvent = require('models/outboxEvent.model');
const mongoose = require('mongoose');
const {session: Session} = require('models/session.model');
const {sendMail} = require('utils/mailer.utils');
const {hashString, compareString} = require('utils/bcrypt.utils');
const {generateAccessToken, generateRefreshToken} = require('utils/jwt.utils');
const {redis: {redisClient}} = require('config');
const {codeMailSub, codeMailHtml, resetPasswordMailSub, resetPasswordMailHtml} = require('constants/mails');
const { v4: uuidv4 } = require('uuid');
const {generateRandomToken, generateRandomIntString, safeCompare, hashToken, generateRandomIdOrJti} = require('utils/crypto.utils');
const {ACCESS_TOKEN_TTL_MS, ABSOLUTE_TTL_MS, SLIDING_TTL_MS} = require('config/auth.config');
const {calculateSessionExpiry, cacheSession} = require('utils/session.utils');
const {syncRevokedSessionToRedis, revokeSession, revokeAndSyncSessionToRedis, rotateSession} = require('./session.service');
const {convertToPublicUser} = require('utils/serializers.utils');
const AppError = require('utils/AppError');
const {FRONTEND_URL} = require('config/env');
const {checkEmailRateLimit} = require('scripts/rateLimit.scripts')

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
        const hashedPassword = await hashString(password);

        /*
         * Generate verification code.
         */
        const verificationCode = generateRandomIntString();

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


const resendVerificationCode = async (email) => {

    const normalizedEmail =
        email.trim().toLowerCase();

    /*
     * 1. Check rate limit.
     */
    const rateLimitResult =
        await checkEmailRateLimit(
            normalizedEmail,
            'verification'
        );

    if (
        rateLimitResult.reason ===
        'RATE_LIMITER_UNAVAILABLE'
    ) {
        throw new AppError(
            'Verification service temporarily unavailable.',
            503,
            'VERIFICATION_SERVICE_UNAVAILABLE'
        );
    }

    /*
     * Rate limited.
     */
    if (!rateLimitResult.allowed) {

        return {
            success: true,
            code: 'RESEND_VERIFICATION_CODE',
            message:
                'If an unverified account exists for this email, a verification code will be sent.',
        };
    }

    /*
     * 2. Find the user.
     */
    const user = await User.findOne({
        email: normalizedEmail,
    });

    /*
     * Don't reveal whether account exists.
     */
    if (!user || user.isEmailVerified) {

        return {
            success: true,
            code: 'RESEND_VERIFICATION_CODE',
            message:
                'If an unverified account exists for this email, a verification code will be sent.',
        };
    }

    /*
     * 3. Generate new verification code.
     */
    const verificationCode =
        generateRandomIntString();

    /*
     * 4. Create outbox event.
     */
    const outboxEvent = new OutboxEvent({

        type: 'SEND_VERIFICATION_EMAIL',

        payload: {
            userId: user._id.toString(),
            email: normalizedEmail,
            verificationCode,
        },

        status: 'pending',
    });

    await outboxEvent.save();

    return {
        success: true,
        code: 'VERIFICATION_CODE_RESENT',
        message:
            'If an unverified account exists for this email, a verification code will be sent.',
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

    const isMatch = await compareString(code, storedCode);

    if (!isMatch) {
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

    const isMatch = await compareString(password, user.password);
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
    const normalizedEmail = email.trim().toLowerCase();

    
    const rateLimitResult = await checkEmailRateLimit(normalizedEmail, 'password-reset');

    if (
        rateLimitResult.reason ===
        'RATE_LIMITER_UNAVAILABLE'
    ) {
        console.error('Rate limiter unavailble because of redis failure.')
        throw new AppError(
            'Verification service temporarily unavailable.',
            503,
            'AUTH_SERVICE_TEMPORARILY_UNAVAILABLE'
        );
    }
    
    if (!rateLimitResult.allowed) {

        console.log(
            `Password reset rate limited for ${normalizedEmail}`,
            rateLimitResult.reason
        );

        return {
            success: true,
            code: RESET_PASSWORD_TOKEN_SENT,
            message:
                'If an account exists for this email, you will receive a password reset email.',
        };
    }
    

    const resetToken = generateRandomToken();

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    const resetTokenHash = hashToken(resetToken);
    const user = await User.findOneAndUpdate(
        {email: normalizedEmail},
        {
            $set: {
                passwordResetTokenHash: resetTokenHash,
                passwordResetExpiresAt: new Date(
                    Date.now() + 15 * 60 * 1000
                )
            }
        }
    );

    if (!user){
        console.error('User not found for this email.')
        return {
            success: true,
            code: RESET_PASSWORD_TOKEN_SENT,
            message: 'If an account exists for this email, you will receive a password reset email.'
        };
    }


    const outboxEvent = new OutboxEvent({
        type: 'SEND_PASSWORD_RESET_EMAIL',

        payload: {
            userId: user._id.toString(),
            email: normalizedEmail,
            resetUrl,
        },

        status: 'pending',
    });

    await outboxEvent.save();

    return ({
        success: true,
        code: RESET_PASSWORD_TOKEN_SENT,
        message: 'If an account exists for this email, you will receive a password reset email.'
    })
}

const resetPassword = async(newPassword, resetToken) => {
    console.log('resetting password with: ', newPassword, resetToken);

    const resetTokenHash = hashToken(resetToken);
    const user = await User.findOneAndUpdate(
        {
            passwordResetTokenHash: resetTokenHash,
            passwordResetExpiresAt: {$gt: new Date()}

        },
        { 
            $set: {
                password: newPassword,
                passwordResetTokenHash: null,
                passwordResetExpiresAt: null
            },
            
        },
        {
            new: true,
            runValidators: true,
            strict: true
        }

    );

    if (!user){
        throw new AppError(
            'Invalid or expired reset token',
            401,
            'INVALID_OR_EXPIRED_TOKEN'
        )
    }

    return {
        success: true,
        code: 'PASSWORD_RESET_SUCCESSFUL',
        message: 'Your password has been reset successfully. Please login with the new password.'
    }

}


const changePassword = async(currentPassword, newPassword, userId, currentSessionId) => {
    console.log('insde changePassword service with data: ', newPassword, userId);

    const session = await mongoose.startSession();

    try {

        session.startTransaction();

        const user = await User.findOne(
            {
                _id: userId,
            }
        ).session(session);

        if (!user) {

            throw new AppError(
                'Unable to change your password.',
                404,
                'USER_NOT_FOUND'
            );
        }

        const isCurrentPasswordValid =
            await compareString(
                currentPassword,
                user.password
            );

        if (!isCurrentPasswordValid) {

            throw new AppError(
                'Current password is incorrect.',
                401,
                'CURRENT_PASSWORD_INVALID'
            );
        }

        const isSamePassword =
            await compareString(
                newPassword,
                user.password
            );

        if (isSamePassword) {

            throw new AppError(
                'Your new password must be different from your current password.',
                400,
                'PASSWORD_SAME_AS_CURRENT'
            );
        }

        const hashedPassword =
            await hashString(newPassword);

        user.password = hashedPassword;

        await user.save({
            session,
        });

        const otherSessions = await Session.find({
            user: userId,

            sessionId: {
                $ne: currentSessionId,
            },

            revokedAt: null,
        }).session(session);

        if (otherSessions.length > 0) {

            await Session.updateMany(
                {
                    user: userId,

                    sessionId: {
                        $ne: currentSessionId,
                    },

                    revokedAt: null,
                },
                {
                    $set: {
                        revokedAt: new Date(),
                    },

                    $inc: {
                        version: 1,
                    },
                },
                {
                    session,
                }
            );
        }

        await session.commitTransaction();

        for (const revokedSession of otherSessions) {

            try {

                await markSessionRevoked(
                    revokedSession.sessionId,
                    revokedSession.absoluteExpiresAt
                );

            } catch (redisError) {
                 console.error(
                    `Failed to synchronize revoked session ` +
                    `${revokedSession.sessionId} to Redis:`,
                    redisError
                );

                throw new AppError(
                    'Your password was changed, but some existing sessions may take a short time to be logged out.',
                    503,
                    'SESSION_REVOCATION_SYNC_FAILED'
                );
            }
        }

        return {
            success: true,

            code: 'PASSWORD_CHANGE_SUCCESSFUL',

            message:
                'Your password has been changed successfully. ' +
                'Other active sessions have been signed out.',
        };

    }catch(error){
        if (session.inTransaction()) {

            await session.abortTransaction();
        }

        console.error(
            'Change password failed:',
            error
        );

        if (error instanceof AppError) {

            throw error;
        }

        /*
         * Convert unexpected errors into a safe
         * application-level error.
         */
        throw new AppError(
            'Unable to change your password right now.',
            500,
            'PASSWORD_CHANGE_FAILED'
        );

        } finally {

            await session.endSession();
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