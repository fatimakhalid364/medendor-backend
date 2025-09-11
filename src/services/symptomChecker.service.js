const {conditions: Conditions} = require('models');
const {redis: {redisClient}} = require('config');
const {pipelineUtils: {matchConditionsPipeline}} = require('utils');

const getMatchingConditions = async (symptomsArray) => {
    const cacheKey = `conditionSearch:${symptomsArray.join(",")}`;
    try {
        console.log("Inside getMatchingConditions service with symptoms:", symptomsArray);
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
        return {
            success: true,
            message: 'Possible conditions found successfully from cache',
            fromCache: true,
            data: JSON.parse(cachedData)
        };
        }

        const results = await Conditions.aggregate(matchConditionsPipeline(symptomsArray));
        console.log("Aggregation results:", results);
        await redisClient.set(cacheKey, JSON.stringify(results));

        return {
            success: true,
            message: 'Possible conditions found successfully from db',
            fromCache: false,
            data: results
        };
    } catch (error) {
        console.error("Error in getMatchingConditions:", error);
        throw new Error(error.message || 'getMatchingConditions failed');
    }
};

module.exports = {getMatchingConditions};