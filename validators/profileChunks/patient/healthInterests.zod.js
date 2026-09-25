const {z} = require('zod');

const addition = z.strictObject({

    primaryConcerns: z.array(
        z.string()
            .trim()
            .min(1, { error: 'Primary concern cannot be empty.' }),
        {
            error: 'Primary concerns must be an array.'
        }
    ).default([]),

    otherInterests: z.array(
        z.string()
            .trim()
            .min(1, { error: 'Other interest cannot be empty.' }),
        {
            error: 'Other interests must be an array.'
        }
    ).default([]),

    medicalHistory: z.string()
        .trim()
        .min(1, { error: 'Medical history cannot be empty.' })
        .optional(),

    currentDiagnosis: z.string()
        .trim()
        .min(1, { error: 'Current diagnosis cannot be empty.' })
        .optional(),

    ongoingConditions: z.string()
        .trim()
        .min(1, { error: 'Ongoing conditions cannot be empty.' })
        .optional()

});


const update = z.strictObject({

    primaryConcerns: z.array(
        z.string()
            .trim()
            .min(1, { error: 'Primary concern cannot be empty.' }),
        {
            error: 'Primary concerns must be an array.'
        }
    ).optional(),

    otherInterests: z.array(
        z.string()
            .trim()
            .min(1, { error: 'Other interest cannot be empty.' }),
        {
            error: 'Other interests must be an array.'
        }
    ).optional(),

    medicalHistory: z.string()
        .trim()
        .min(1, { error: 'Medical history cannot be empty.' })
        .optional(),

    currentDiagnosis: z.string()
        .trim()
        .min(1, { error: 'Current diagnosis cannot be empty.' })
        .optional(),

    ongoingConditions: z.string()
        .trim()
        .min(1, { error: 'Ongoing conditions cannot be empty.' })
        .optional()

}).refine(
    data => Object.keys(data).length > 0,
    {
        error: 'At least one field must be provided for update.'
    }
);

module.exports = {
    addition,
    update
}