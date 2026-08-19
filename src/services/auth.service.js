const {user: User, token: Token} = require('models');
const {session: Session} = require('models/session.model');
const {bcryptUtils: {hashPassword, comparePassword}, mailerUtils: {sendMail}} = require('utils');
const {generateAccessToken, generateRefreshToken} = require('utils/jwt.utils');
const {redis: {redisClient}} = require('config');
const {mails: {codeMailSub, codeMailHtml}} = require('constants');
const { v4: uuidv4 } = require('uuid');
const {generateRandomToken, safeCompare, hashToken, generateRandomIdOrJti} = require('utils/crypto.utils');
const {ACCESS_TOKEN_TTL_MS, ABSOLUTE_TTL_MS, SLIDING_TTL_MS} = require('config/auth.config');
const {calculateSessionExpiry, cacheSession} = require('utils/session.utils');
const {syncRevokedSessionToRedis, revokeSession, revokeAndSyncSessionToRedis} = require('./session.service');
const {convertToPublicUser} = require('utils/serializers.utils');
const AppError = require('utils/AppError');

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
            verificationCode,
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

        if (!user.isEmailVerified) {
            throw new Error(
                'Please verify your email first'
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
            const cached =
                await cacheSession(session);

            // if (!cached) {
            //     throw new Error(
            //         'Redis rejected the new session state or session expired'
            //     );
            // }

        } catch (cacheError) {
            console.error(
                'Redis session cache failed during login:',
                cacheError
            );

            await revokeAndSyncSessionToRedis(session, 'Redis cache failure during login.')
        }

        return {
            success: true,
            message: "User logged in successfully",
            accessToken,
            refreshToken,
            csrfToken,
            user: convertToPublicUser(user),
            // accessJti,
            // refreshJti
        };
    } catch (error) {
        console.error("Login error:", error);
        throw new Error(error.message || 'Login failed');
    }
};

const logout = async (
    sessionId
) => {
    let revokedSession;

    try {
        revokedSession = 
            await revokeSession(
                    session.sessionId,
                    reason
                );
        if (!revokedSession){
            return {
                success: false,
                code: 'SESSION_NOT_FOUND',
                message: 'Session not found'
            }
        }
    }catch(revokedError){
        console.error(
            'Mongodb session revoke failed:',
            revokedError
        );
        throw new Error(
            'Authentication service temporarily unavailable'
        );
    }

    try {
        await syncRevokedSessionToRedis(
            revokedSession
        );
    } catch (redisError) {
        console.error(
            'Failed to synchronize a revoked session to Redis:',
            redisError
        );
        throw new Error(
        'Authentication service temporarily unavailable'
        );
    }

    return {
        success: true,
        code:'LOGOUT_SUCCESSFUL',
        message: 'User logged out successfully'
    }

    
};



const refreshAccessToken = async (refreshToken, csrfToken, decoded) => {
        const session =
        await Session.findOne({
            sessionId:
                decoded.sid,
        });

        if (!session) {
            throw new Error(
                'Invalid session'
            );
        }

        if (
            session.user.toString() !==
            decoded.sub
        ) {
            throw new Error(
                'Invalid session'
            );
        }
        if (session.revokedAt) {
            throw new Error(
                'Session revoked'
            );
        }

        const now =
            new Date();
        
        if (
            session.expiresAt <= now ||
            session.absoluteExpiresAt <= now
        ) {

            const expiredSession =
                await revokeSession(
                    session.sessionId,
                    'Session expired'
                );

            try {
                await syncRevokedSessionToRedis(
                    expiredSession
                );
            } catch (error) {
                console.error(
                    'Failed to mark expired session in Redis:',
                    error
                );
                throw new Error(
                    'Authentication service temporarily unavailable'
                );
            }

            throw new Error(
                'Session expired'
            );
        }

        const incomingCsrfHash =
            hashToken(csrfToken);

        if (
            !safeCompare(
                incomingCsrfHash,
                session.csrfTokenHash
            )
        ) {
            throw new Error(
                'CSRF validation failed'
            );
        }

        const incomingRefreshHash = hashToken(refreshToken);

        const hashMatches =
            safeCompare(
                incomingRefreshHash,
                session.refreshTokenHash
            );

        const jtiMatches =
            safeCompare(
                decoded.jti,
                session.refreshJti
            );

        if (
            !hashMatches ||
            !jtiMatches
        ) {
            const revokedSession =
                await revokeSession(
                    session.sessionId,
                    'Refresh token reuse detected'
                );
            try {
                await syncRevokedSessionToRedis(
                    revokedSession
                );
            } catch (error) {
                console.error(
                    'Redis revoke failed after refresh-token reuse:',
                    error
                );
            }

            throw new Error(
                'Refresh token reuse detected'
            );
        }

        const newRefreshJti = generateRandomIdOrJti();

        const newAccessJti = generateRandomIdOrJti();

        const newCsrfToken = generateRandomToken();

        const proposedSlidingExpiry =
        new Date(
            Date.now() +
            SLIDING_TTL_MS
        );

        const newExpiresAt =
            proposedSlidingExpiry <
            session.absoluteExpiresAt
                ? proposedSlidingExpiry
                : session.absoluteExpiresAt;

        const newAccessToken =
            generateAccessToken({
                userId:
                    session.user,

                sessionId:
                    session.sessionId,

                expiresAt:
                    newExpiresAt,
                
                accessJti: newAccessJti
            });

        const newRefreshToken =
            generateRefreshToken({
                userId:
                    session.user,

                sessionId:
                    session.sessionId,
                
                expiresAt:
                    newExpiresAt,

                refreshJti:
                    newRefreshJti,

            });

        const updatedSession =
            await Session.findOneAndUpdate(
                {
                    sessionId:
                        session.sessionId,

                    refreshTokenHash:
                        incomingRefreshHash,

                    refreshJti:
                        session.refreshJti,

                    revokedAt: null,

                    expiresAt: {
                        $gt: now,
                    },

                    absoluteExpiresAt: {
                        $gt: now,
                    },
                },
                {
                    $set: {
                        refreshTokenHash:
                            hashToken(
                                newRefreshToken
                            ),

                        refreshJti:
                            newRefreshJti,

                        csrfTokenHash:
                            hashToken(
                                newCsrfToken
                            ),

                        expiresAt:
                            newExpiresAt,

                        lastActivityAt:
                            new Date(),
                    },
                    $inc: {
                    version: 1,
                },
                },

                {
                    new: true,
                    runValidators: true,
                }
            );

            if (!updatedSession) {

                let revokedSession;

                try {revokedSession =
                    await revokeSession(
                        session.sessionId,
                        'Concurrent refresh detected'
                    );
                }catch(error){
                    console.error(
                        'Mongodb revoke failed after concurrent refresh:',
                        error
                    );
                }

                try {
                    await syncRevokedSessionToRedis(
                        revokedSession
                    );
                } catch (error) {
                    console.error(
                        'Redis revoke failed after concurrent refresh:',
                        error
                    );
                }

                throw new Error(
                    'Refresh token reuse detected'
                );
        }

        try {

            const cached = await cacheSession(
                updatedSession
            );

            if (!cached) {
                throw new Error(
                    'Redis session synchronization failed'
                );
            }

        } catch (error) {

            console.error(
                'Redis update failed after refresh:',
                error
            );

        /*
         * MongoDB rotation already succeeded.
         *
         * If Redis cannot be synchronized, fail closed by
         * revoking the MongoDB session.
         */
            let revokedSession;

            try {revokedSession =
                await revokeSession(
                    session.sessionId,
                    'Redis cache failure after refresh'
                );
            }catch(error){
                console.error('Mongodb revoke failed after redis cache failure after refresh')
            }
            try {
                await syncRevokedSessionToRedis(
                    revokedSession
                );
            } catch (redisError) {
                console.error(
                    'Redis revoke failed:',
                    redisError
                );
            }

            throw new Error(
                'Authentication service temporarily unavailable'
            );
        }

        return {

            success: true,

            message: 'Access token refreshed successfully',

            accessToken:
                newAccessToken,

            refreshToken:
                newRefreshToken,

            csrfToken:
                newCsrfToken,
        };
};

module.exports = { signup, verifyCode, login, logout, refreshAccessToken };