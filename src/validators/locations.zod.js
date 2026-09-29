const { z } = require('zod');

const getCitiesQuerySchema = z.strictObject({
  country: z
    .string({
      error: 'Country query param is required'
    })
    .trim()
    .length(2, {
      error: 'Invalid country query param'
    })
    .transform((value) => value.toUpperCase()),
});

module.exports = getCitiesQuerySchema