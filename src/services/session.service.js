const {session: Session} = require('models/session.model');
const {markSessionRevoked} = require('utils/session.utils');

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
    }

    throw new Error(
        'Authentication service temporarily unavailable'
    );
}



module.exports = {
    revokeSession,
    syncRevokedSessionToRedis,
    revokeAndSyncSessionToRedis
}
