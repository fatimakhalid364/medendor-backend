const CACHE_SESSION_SCRIPT = `
local current = redis.call('GET', KEYS[1])

if not current then
    redis.call(
        'SET',
        KEYS[1],
        ARGV[1],
        'EX',
        ARGV[2]
    )

    return 1
end

local currentData = cjson.decode(current)
local incomingData = cjson.decode(ARGV[1])

local currentVersion =
    tonumber(currentData.version or '0')

local incomingVersion =
    tonumber(incomingData.version or '0')

if currentData.revoked == true
    and incomingData.revoked == false then

    return 0
end

if incomingVersion < currentVersion then
    return 0
end

if incomingVersion == currentVersion
    and currentData.revoked == true
    and incomingData.revoked == false then

    return 0
end

redis.call(
    'SET',
    KEYS[1],
    ARGV[1],
    'EX',
    ARGV[2]
)

return 1
`;


const MARK_SESSION_REVOKED_SCRIPT = `
local current = redis.call('GET', KEYS[1])

local incomingVersion =
    tonumber(ARGV[2])

local revokedAt =
    ARGV[1]

local ttl =
    ARGV[3]

if not current then

    local data = cjson.encode({
        sessionId = ARGV[4],
        revoked = true,
        revokedAt = tonumber(revokedAt),
        version = incomingVersion
    })

    redis.call(
        'SET',
        KEYS[1],
        data,
        'EX',
        ttl
    )

    return 1
end

local currentData = cjson.decode(current)

local currentVersion =
    tonumber(currentData.version or '0')


if incomingVersion < currentVersion then

    if currentData.revoked == true then
        return 0
    end

    return 0
end

currentData.revoked = true
currentData.revokedAt = tonumber(revokedAt)
currentData.version = incomingVersion

local encoded =
    cjson.encode(currentData)

redis.call(
    'SET',
    KEYS[1],
    encoded,
    'EX',
    ttl
)

return 1
`;

module.exports = {
    CACHE_SESSION_SCRIPT,
    MARK_SESSION_REVOKED_SCRIPT
};
