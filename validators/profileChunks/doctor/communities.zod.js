const { z } = require('zod');
const {communitiesArray} = require('constants/enum');

const communitiesZodSchema = z.array(
    z.enum(communitiesArray, {
        error: 'Invalid community.'
    }),
    {
        error: 'Communities must be an array.'
    }
);

module.exports = {communitiesZodSchema}