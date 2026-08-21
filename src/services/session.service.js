const {session: Session} = require('models/session.model');
const {markSessionRevoked} = require('utils/session.utils');
const AppError = require('utils/AppError');
const {generateAccessToken, generateRefreshToken} = require('utils/jwt.utils');
const {generateRandomToken, safeCompare, hashToken, generateRandomIdOrJti} = require('utils/crypto.utils');
const {ACCESS_TOKEN_TTL_MS, ABSOLUTE_TTL_MS, SLIDING_TTL_MS} = require('config/auth.config');
const {session: Session} = require('models/session.model');

const revokeSession = async (
    sessionId,
    reason = 'unknown'
) => {
        const revokedAt = new Date();

        const updatedSession =
            await Session.findOneAndUpdate(
                {
                    sessionId,
                    revokedAt: null,
                },
                {
                    $set: {
                        revokedAt,
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
            /*
             * Another concurrent request may have revoked
             * the session first.
             *
             * Read the current authoritative MongoDB state.
             */
            return await Session.findOne({
                sessionId,
            });
        }

        console.info(
            `Session ${sessionId} revoked: ${reason}`
        );

        return updatedSession;
};

const syncRevokedSessionToRedis = async (
    session
) => {
        await markSessionRevoked(
            session.sessionId,
            session.absoluteExpiresAt,
            session.version
        );
};

const revokeAndSyncSessionToRedis = async(session, reason) => {
    let revokedSession;

    try {
        revokedSession = 
            await revokeSession(
                    session.sessionId,
                    reason
                );
    }catch(revokedError){
        console.error(
            'Mongodb session revoke failed:',
            revokedError
        );
        throw new AppError(
            'Authentication service is temporarily unavailable. Please try again.',
            503,
            'AUTH_SERVICE_TEMPORARILY_UNAVAILABLE'
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
        throw new AppError(
            'Authentication service is temporarily unavailable. Please try again.',
            503,
            'AUTH_SERVICE_TEMPORARILY_UNAVAILABLE'
        );
    }

}

const getValidRefreshSession = async (decoded) => {

    const session =
        await Session.findOne({
            sessionId: decoded.sid
        });

    if (!session) {
        throw new AppError(
            'Invalid session.',
            401,
            'INVALID_SESSION'
        );
    }

    if (
        session.user.toString() !==
        decoded.sub
    ) {
        throw new AppError(
            'Invalid session.',
            401,
            'INVALID_SESSION'
        );
    }

    if (session.revokedAt) {
        throw new AppError(
            'Session has been revoked.',
            401,
            'SESSION_REVOKED'
        );
    }

    const now = new Date();

    if (
        session.expiresAt <= now ||
        session.absoluteExpiresAt <= now
    ) {

        await revokeAndSyncSessionToRedis(session, 'Session expired');

        throw new AppError(
            'Session has expired.',
            401,
            'SESSION_EXPIRED'
        );
    }

    return session;
};

const rotateSession = async (
    incomingRefreshHash,
    session
) => {

    const now = new Date();

    const newRefreshJti =
        generateRandomIdOrJti();

    const newAccessJti =
        generateRandomIdOrJti();

    const newCsrfToken =
        generateRandomToken();

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
            userId: session.userId,
            sessionId: session.sessionId,
            expiresAt: newExpiresAt,
            accessJti: newAccessJti
        });

    const newRefreshToken =
        generateRefreshToken({
            userId: session.userId,
            sessionId: session.sessionId,
            expiresAt: newExpiresAt,
            refreshJti: newRefreshJti
        });

    /*
     * This is the important concurrency protection.
     *
     * MongoDB will only perform the rotation if the
     * session still contains the refresh token that
     * this request presented.
     */
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
                    $gt: now
                },

                absoluteExpiresAt: {
                    $gt: now
                }
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
                        now
                },

                $inc: {
                    version: 1
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

    if (!updatedSession) {
        await revokeAndSyncSessionToRedis(
            session, 'Concurrent refresh detected'
        );

        throw new AppError(
            'Refresh token reuse detected.',
            401,
            'REFRESH_TOKEN_REUSE_DETECTED'
        );
    }

    return {
        updatedSession,
        newAccessToken,
        newRefreshToken,
        newCsrfToken
    };
};



module.exports = {
    revokeSession,
    syncRevokedSessionToRedis,
    revokeAndSyncSessionToRedis,
    getValidRefreshSession,
    rotateSession
}
