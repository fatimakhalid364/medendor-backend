const {session: Session} = require('models/session.model');
const {markSessionRevoked} = require('utils/session.utils');
const AppError = require('utils/AppError');
const {generateAccessToken, generateRefreshToken} = require('utils/jwt.utils');
const {generateRandomToken, safeCompare, hashToken, generateRandomIdOrJti} = require('utils/crypto.utils');
const {ACCESS_TOKEN_TTL_MS, ABSOLUTE_TTL_MS, SLIDING_TTL_MS} = require('config/auth.config');
const {session: Session} = require('models/session.model');



const revokeSession = async (
    sessionId,
    reason
) => {

    const mongoSession =
        await mongoose.startSession();

    try {

        mongoSession.startTransaction();

        console.log(`Revoking ${sessionId} for reason ${reason}`)


        const revokedAt = new Date();


        const session =
            await Session.findOneAndUpdate(
                {
                    sessionId,
                    revoked: false,
                    revokedAt: null,
                },

                {
                    $set: {
                        revoked: true,
                        revokedAt,
                    },

                    $inc: {
                        version: 1,
                    },
                },

                {
                    new: true,
                    session: mongoSession,
                }
            );


        if (!session) {

            await mongoSession.commitTransaction();

            return null;
        }


        await OutboxEvent.create(
            [
                {
                    type: 'SESSION_REVOKED',

                    payload: {
                        sessionId:
                            session.sessionId,

                        absoluteExpiresAt:
                            session.absoluteExpiresAt,

                        version:
                            session.version
                    },
                },
            ],
            {
                session: mongoSession,
            }
        );


        await mongoSession.commitTransaction();


        return session;


    } catch (error) {

        if (mongoSession.inTransaction()) {
            await mongoSession.abortTransaction();
        }

        throw error;

    } finally {

        await mongoSession.endSession();
    }
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

                revoked: false,

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
                runValidators: true,
                strict: true
            }
        ).populate({
            path: 'userId',
            select: 'role'
        });

    if (!updatedSession) {
         const currentSession = await Session.findOne({
            sessionId: session.sessionId
        });
        if (
            currentSession.refreshTokenHash !== incomingRefreshHash
        ) {
            await revokeSession(
                session.sessionId,
                'Refresh token reuse detected'
            );

            throw new AppError(
                'Refresh token reuse detected.',
                401,
                'REFRESH_TOKEN_REUSE_DETECTED'
            );
        }
        throw new AppError(
            'Session refresh failed.',
            500,
            'SESSION_REFRESH_FAILED'
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
    rotateSession
}
