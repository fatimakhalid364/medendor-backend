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

        const { accessToken, refreshToken, csrfToken, accessJti, refreshJti } = generateTokens(user._id.toString(), user.role);

         await redisClient.setEx(
            `session:${accessJti}`,
            15 * 60,
            JSON.stringify({
                userId: user._id.toString(),
                role: user.role,
                csrfToken,
                ip,
                userAgent
            })
        );

        await Token.create({
            user: user._id,
            jti: refreshJti,
            type: 'refresh',
            ip,
            userAgent,
            expiresAt: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            ), // 7 days
            absoluteExpiresAt: new Date(
                now + 30 * 24 * 60 * 60 * 1000
            )
        });

        return {
            success: true,
            message: "User logged in successfully",
            accessToken,
            refreshToken,
            csrfToken,
            user,
            accessJti,
            refreshJti
        };
    } catch (error) {
        console.error("Login error:", error);
        throw new Error(error.message || 'Login failed');
    }
};

const logout = async (accessToken, refreshToken) => {
    try {
       

        if (!accessToken) throw new Error ('Access token missing')

        let decoded;

        try {
            decoded = verifyAccessToken(accessToken);
        } catch (err) {
            // Even if token expired, still allow logout cleanup
            decoded = jwt.decode(accessToken);
        }

        const accessJti = decoded?.accessJti;
        const userId = decoded?.sub;

        if (!accessJti) throw new Error ('Invalid access token')

        // 1. Delete Redis session (kills access + CSRF)
        await redisClient.del(`session:${accessJti}`);

        // 3. Revoke refresh token in DB (important)
        if (refreshToken) {
            try {
                const decodedRefresh = verifyRefreshToken(refreshToken);

                await Token.updateOne(
                    {
                        user: userId,
                        jti: decodedRefresh.refreshJti,
                        type: 'refresh'
                    },
                    {
                        $set: {
                            revoked: true
                        }
                    }
                );
            } catch (err) {
                // ignore refresh token errors (already invalid/expired)
                console.log('Refresh token invalid during logout');
            }
        }

        
        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        throw new Error(error.message || 'Logout failed');
    }
};

const refreshAccessToken = async (req, res) => {
    try {

        const refreshToken =
            req.cookies['refresh_token'];

        if (!refreshToken) throw new Error ('Refresh token msising');

        const csrfToken = req.headers['csrf-token'];

        if (!csrfToken) 
            throw new Error('CSRF token missing');

        const session = await redisClient.get(
             `session:${accessJti}`
        );

        if (session.csrfToken !== csrfToken) {
            throw new Error('Invalid CSRF token');
        }

        let decoded;


        decoded = verifyRefreshToken(refreshToken);

        if (!decoded)  throw new Error ('Invalid or expired refresh token');

        const {
            sub: userId,
            refreshJti
        } = decoded;

        const tokenRecord =
            await Token.findOne({
                user: userId,
                jti: refreshJti,
                type: 'refresh',
                revoked: false
            });

        if (!tokenRecord) 
            throw new Error ('Refresh token revoked or not found.')

        const now = new Date();

        // 7-day inactivity timeout
        if (now > tokenRecord.expiresAt) 
            throw new Error ('Session expires due to inactivity');

        // 30-day hard session limit
        if (
            now >
            tokenRecord.absoluteExpiresAt
        ) throw new Error ('Maximum session lifetime exceeded');

        const user =
            await User.findById(userId);

        if (!user) throw new Error ('User not found');

        const {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            csrfToken: newCsrfToken,
            accessJti: newAccessJti,
            refreshJti: newRefreshJti
        } = generateTokens(
            user._id.toString(),
            user.role
        );

        // revoke old refresh token
        await Token.updateOne(
            {
                jti: refreshJti,
                type: 'refresh'
            },
            {
                $set: {
                    revoked: true
                }
            }
        );

        // sliding window extension
        const newSlidingExpiry =
            new Date(
                Date.now() +
                7 * 24 * 60 * 60 * 1000
            );

        await Token.create({
            user: user._id,
            jti: newRefreshJti,
            type: 'refresh',
            ip: req.ip,
            userAgent:
                req.get('User-Agent'),

            expiresAt: newSlidingExpiry,

            // KEEP ORIGINAL HARD LIMIT
            absoluteExpiresAt:
                tokenRecord.absoluteExpiresAt
        });

        await redisClient.setEx(
            `session:${newAccessJti}`,
            7 * 24 * 60 * 60,
            JSON.stringify({
                userId:
                    user._id.toString(),
                role: user.role,
                csrfToken: newCsrfToken,
                ip: req.ip,
                userAgent:
                    req.get('User-Agent')
            })
        );

        // res
        //     .cookie(
        //         'access_token',
        //         accessToken,
        //         {
        //             httpOnly: true,
        //             secure: true,
        //             sameSite: 'none',
        //             maxAge:
        //                 15 * 60 * 1000
        //         }
        //     )
        //     .cookie(
        //         'refresh_token',
        //         newRefreshToken,
        //         {
        //             httpOnly: true,
        //             secure: true,
        //             sameSite: 'none',
        //             path: '/auth/refresh',
        //             maxAge:
        //                 7 *
        //                 24 *
        //                 60 *
        //                 60 *
        //                 1000
        //         }
        //     )
        //     .cookie(
        //         'csrf_token',
        //         csrfToken,
        //         {
        //             httpOnly: false,
        //             secure: true,
        //             sameSite: 'none',
        //             maxAge:
        //                 7 *
        //                 24 *
        //                 60 *
        //                 60 *
        //                 1000
        //         }
        //     );

        return res.status(200).json({
            success: true,
            message:
                'Access token refreshed successfully',
            newAccessToken,
            newRefreshToken,
            newCsrfToken
        });

    } catch (error) {
        console.error(
            'Refresh access token error:',
            error
        );

        throw new Error(error.message || 'Refresh access token failed');
    }
};

module.exports = { signup, verifyCode, login, logout, refreshAccessToken };