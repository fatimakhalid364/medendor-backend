const { createClient } = require('redis');
const {REDIS_URL} = require('./env');

const redisClient = createClient({
    url: REDIS_URL
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));

const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('✅ Redis connected!');
    } catch (err) {
        console.error('❌ Redis connection failed:', err.message);
        throw err; 
    }
};

module.exports = { redisClient, connectRedis };
