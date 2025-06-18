const { createClient } = require('redis');

const redisClient = createClient({
    url: 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));

const connectRedis = async () => {
    await redisClient.connect();
    console.log('Redis connected!');
};

module.exports = { redisClient, connectRedis };
