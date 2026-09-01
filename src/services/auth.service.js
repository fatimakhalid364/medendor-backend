const {user: User, token: Token} = require('models');
const OutboxEvent = require('models/outboxEvent.model');
const mongoose = require('mongoose');
const {session: Session} = require('models/session.model');
const {hashString, compareString} = require('utils/bcrypt.utils');
const {generateAccessToken, generateRefreshToken} = require('utils/jwt.utils');
const {redis: {redisClient}} = require('config');
const {generateRandomToken, generateRandomIntString, hashToken, generateRandomIdOrJti} = require('utils/crypto.utils');
const {calculateSessionExpiry, cacheSession} = require('utils/session.utils');
const {revokeSession, rotateSession} = require('./session.service');
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
        const existingUser = await User.findOne({
            email
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
            email,
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
                email,
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

    /*
     * 1. Check rate limit.
     */
    const rateLimitResult =
        await checkEmailRateLimit(
            email,
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
        email,
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
            email,
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

    try {
        
        await cacheSession(session, user.role);

    } catch (cacheError) {
        console.error(
            'Redis session cache failed during login:',
            cacheError
        );

       try {
            await revokeSession(
                sessionId,
                'Redis cache failure during login.'
            );
        } catch (revokeError) {
            console.error(
                'Failed to revoke session after Redis cache failure:',
                revokeError
            );
        }
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
    
    const rateLimitResult = await checkEmailRateLimit(email, 'password-reset');

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
            `Password reset rate limited for ${email}`,
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
        {
            email
        },
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
            email,
            resetUrl,
        },

        status: 'pending',
    });

    await outboxEvent.save();

    return ({
        success: true,
        code: 'RESET_PASSWORD_TOKEN_SENT',
        message: 'If an account exists for this email, you will receive a password reset email.'
    })
}

const resetPassword = async(newPassword, resetToken) => {
    console.log('resetting password with: ', newPassword, resetToken);

    const resetTokenHash = hashToken(resetToken);
    const hashedNewPassword = await hashString(newPassword);

    const session = await mongoose.startSession();

    try {
        let revokedSessions = [];

        await session.withTransaction(async () => {

            // 1. Reset password
            const user = await User.findOneAndUpdate(
                {
                    passwordResetTokenHash: resetTokenHash,
                    passwordResetExpiresAt: { $gt: new Date() }
                },
                {
                    $set: {
                        password: hashedNewPassword,
                        passwordResetTokenHash: null,
                        passwordResetExpiresAt: null
                    }
                },
                {
                    new: true,
                    runValidators: true,
                    strict: true,
                    session
                }
            );

            if (!user) {
                throw new AppError(
                    'Invalid or expired reset token',
                    401,
                    'INVALID_OR_EXPIRED_TOKEN'
                );
            }

            // 2. Find all currently active sessions
            revokedSessions = await Session.find(
                {
                    userId: user._id,
                    revoked: false
                }
            )
            .select(
                'sessionId absoluteExpiresAt version'
            )
            .session(session);

            if (revokedSessions.length === 0) {
                return;
            }

            // 3. Revoke them in MongoDB
            await Session.updateMany(
                {
                    userId: user._id,
                    revoked: false
                },
                {
                    $set: {
                        revoked: true,
                        revokedAt: new Date()
                    },
                    $inc: {
                        version: 1
                    }
                },
                {
                    session
                }
            );

            // 4. Create outbox events
            const events = revokedSessions.map((revokedSession) => ({
                type: 'SESSION_REVOKED',
                payload: {
                    sessionId: revokedSession.sessionId,
                    absoluteExpiresAt: revokedSession.absoluteExpiresAt,
                    version: revokedSession.version + 1
                },
                status: 'pending'
            }));

            await OutboxEvent.insertMany(events, { session });
        });

        return {
            success: true,
            code: 'PASSWORD_RESET_SUCCESSFUL',
            message:
                'Your password has been reset successfully. Please login with the new password.'
        };

    } finally {
        await session.endSession();
    }

}


const changePassword = async (
    currentPassword,
    newPassword,
    userId,
    currentSessionId
) => {

    console.log(
        'Inside changePassword service with data:',
        newPassword,
        userId
    );

    const session = await mongoose.startSession();

    try {

        session.startTransaction();

        /*
         * Find the user inside the transaction.
         */
        const user = await User.findOne({
            _id: userId,
        }).session(session);

        if (!user) {

            throw new AppError(
                'Unable to change your password.',
                404,
                'USER_NOT_FOUND'
            );
        }


        /*
         * Verify current password.
         */
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


        /*
         * Prevent the new password from being
         * the same as the current password.
         */
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


        /*
         * Hash and save the new password.
         */
        const hashedPassword =
            await hashString(newPassword);

        user.password = hashedPassword;

        await user.save({
            session,
        });


        const otherSessions =
            await Session.find({
                user: userId,

                sessionId: {
                    $ne: currentSessionId,
                },

                revokedAt: null,
            }).session(session);


        if (otherSessions.length > 0) {

            /*
             * Revoke all other sessions in MongoDB.
             */
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


            const outboxEvents =
                otherSessions.map(
                    (revokedSession) => ({
                        type: 'SESSION_REVOKED',

                        payload: {
                            sessionId:
                                revokedSession.sessionId,

                            absoluteExpiresAt:
                                revokedSession.absoluteExpiresAt,

                            version:
                                revokedSession.version + 1,
                        }
                    })
                );


            await OutboxEvent.insertMany(
                outboxEvents,
                {
                    session,
                }
            );
        }


        await session.commitTransaction();


        return {
            success: true,

            code: 'PASSWORD_CHANGE_SUCCESSFUL',

            message:
                'Your password has been changed successfully. ' +
                'Other active sessions have been signed out.',
        };


    } catch (error) {

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


        throw new AppError(
            'Unable to change your password right now.',
            500,
            'PASSWORD_CHANGE_FAILED'
        );

    } finally {

        await session.endSession();
    }
};


const logout = async (sessionId) => {

    let revokedSession;

    try {

        revokedSession = await revokeSession(
            sessionId,
            'User logout'
        );

    } catch (error) {

        console.error(
            'MongoDB logout failed:',
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
            message: 'You are already logged out.',
        };
    }

    return {
        success: true,
        code: 'LOGOUT_SUCCESSFUL',
        message: 'User logged out successfully',
    };
};


const refreshAccessToken = async (
    session,
    refreshToken
) => {

    console.log('Inside refreshAccessToken service with session: ', session, 'refreshToken: ', refreshToken, 'and userId: ', userId)

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
            await cacheSession(updatedSession, updatedSession.userId.role);

    } catch (cacheError) {
        console.error(
            'Redis session cache failed during login:',
            cacheError
        );

        await revokeSession(updatedSession.sessionId, 'Redis cache failure during login.');
        throw new AppError(
            'Authentication service is temporarily unavailable. Please try again.',
            503,
            'AUTH_SERVICE_TEMPORARILY_UNAVAILABLE'
        );
    }

    if (cached.status === 'STALE_VERSION' || cached.status === 'WOULD_RESURRECT_REVOKED') {
        console.warn(
            `Session cache update rejected as stale or resurrecting revoked session: ${updatedSession.sessionId}`
        );

        throw new AppError(
            'Authentication state changed. Please try again.',
            409,
            'SESSION_STATE_CONFLICT'
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
    resendVerificationCode, 
    verifyCode, 
    login,
    forgotPassword,
    resetPassword,
    changePassword, 
    logout, 
    refreshAccessToken,
     
};