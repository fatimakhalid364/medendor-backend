const { z } = require('zod');
const { genderArray } = require('constants/enum');

const addition = z.strictObject({

    gender: z.enum(genderArray, {
        error: 'Gender must be a valid gender.'
    }),

    dateOfBirth: z.coerce.date({
        error: 'Date of birth must be a valid date.'
    }),

    country: z.string({
        error: 'Country is required.'
    })
        .trim()
        .min(1, {
            error: 'Country is required.'
        }),

    city: z.string({
        error: 'City is required.'
    })
        .trim()
        .min(1, {
            error: 'City is required.'
        }),

    languagesSpoken: z.array(
        z.string()
            .trim()
            .min(1, {
                error: 'Language cannot be empty.'
            }),
        {
            error: 'Languages spoken must be an array.'
        }
    )
        .optional()

});


const update = z.strictObject({

    gender: z.enum(genderArray, {
        error: 'Gender must be a valid gender.'
    })
        .optional(),

    dateOfBirth: z.coerce.date({
        error: 'Date of birth must be a valid date.'
    })
        .optional(),

    country: z.string({
        error: 'Country must be a string.'
    })
        .trim()
        .min(1, {
            error: 'Country cannot be empty.'
        })
        .optional(),

    city: z.string({
        error: 'City must be a string.'
    })
        .trim()
        .min(1, {
            error: 'City cannot be empty.'
        })
        .optional(),

    languagesSpoken: z.array(
        z.string()
            .trim()
            .min(1, {
                error: 'Language cannot be empty.'
            }),
        {
            error: 'Languages spoken must be an array.'
        }
    )
        .optional()

});


module.exports = {
    basicProfileZodSchema: {
        addition,
        update
    }
};