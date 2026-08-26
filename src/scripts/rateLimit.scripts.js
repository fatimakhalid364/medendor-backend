const redisClient = require('config/redis');

const COOLDOWN_SECONDS = 60;
const WINDOW_SECONDS = 60 * 60;
const MAX_REQUESTS = 5;


const EMAIL_RATE_LIMIT_SCRIPT = `
    local cooldownKey = KEYS[1]
    local hourlyKey = KEYS[2]

    /*
     * Check cooldown.
     */
    local cooldownExists =
        redis.call('EXISTS', cooldownKey)

    if cooldownExists == 1 then

        local ttl =
            redis.call('TTL', cooldownKey)

        return {0, 1, ttl}
    end

    /*
     * Check hourly limit.
     */
    local currentCount =
        tonumber(redis.call('GET', hourlyKey) or '0')

    if currentCount >= tonumber(ARGV[1]) then

        local ttl =
            redis.call('TTL', hourlyKey)

        return {0, 2, ttl}
    end

    /*
     * Set cooldown.
     */
    redis.call(
        'SET',
        cooldownKey,
        '1',
        'EX',
        tonumber(ARGV[2])
    )

    /*
     * Increment hourly attempts.
     */
    local newCount =
        redis.call('INCR', hourlyKey)

    /*
     * Give the hourly counter its TTL
     * only when it is created.
     */
    if newCount == 1 then

        redis.call(
            'EXPIRE',
            hourlyKey,
            tonumber(ARGV[3])
        )

    end

    return {1, 0, 0}
`;

const checkEmailRateLimit = async (
    email,
    purpose
) => {

    const cooldownKey =
        `email-rate-limit:${purpose}:cooldown:${email}`;

    const hourlyKey =
        `email-rate-limit:${purpose}:attempts:${email}`;

    try {

        const result = await redisClient.eval(
            EMAIL_RATE_LIMIT_SCRIPT,
            {
                keys: [
                    cooldownKey,
                    hourlyKey,
                ],

                arguments: [
                    MAX_REQUESTS.toString(),
                    COOLDOWN_SECONDS.toString(),
                    WINDOW_SECONDS.toString(),
                ],
            }
        );

        const [
            allowed,
            reason,
            retryAfter,
        ] = result;

        /*
         * Request is allowed.
         */
        if (Number(allowed) === 1) {

            return {
                allowed: true,
            };
        }

        /*
         * Cooldown active.
         */
        if (Number(reason) === 1) {

            return {
                allowed: false,
                reason: 'COOLDOWN',
                retryAfter: Number(retryAfter),
            };
        }

        /*
         * Hourly limit reached.
         */
        return {
            allowed: false,
            reason: 'RATE_LIMIT',
            retryAfter: Number(retryAfter),
        };

    } catch (error) {

        console.error(
            'Email rate limiter unavailable:',
            error
        );

        /*
         * Fail closed.
         *
         * Do NOT allow password-reset or verification
         * emails to bypass rate limiting when Redis
         * is unavailable.
         */
        return {
            allowed: false,
            reason: 'RATE_LIMITER_UNAVAILABLE',
        };
    }
};

module.exports = {
    checkEmailRateLimit,
};