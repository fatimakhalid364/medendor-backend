const { z } = require('zod');

const startYearSchema = z.number({
    error: 'Start year is required.'
})
    .int({
        error: 'Start year must be a whole number.'
    })
    .min(1900, {
        error: 'Start year must be 1900 or later.'
    })
    .max(new Date().getFullYear() + 1, {
        error: 'Start year cannot be more than one year in the future.'
    });


const endYearSchema = z.number({
    error: 'End year is required.'
})
    .int({
        error: 'End year must be a whole number.'
    })
    .min(1900, {
        error: 'End year must be 1900 or later.'
    });

const educationAdditionZodSchema = z.strictObject({
    degree: z.string({
        error: 'Degree is required.'
    })
        .trim()
        .min(1, {
            error: 'Degree is required.'
        }),

    institute: z.string({
        error: 'Institute is required.'
    })
        .trim()
        .min(1, {
            error: 'Institute is required.'
        }),

    country: z.string({
        error: 'Country is required.'
    })
        .trim()
        .min(1, {
            error: 'Country is required.'
        }),

    startYear: startYearSchema,
    endYear: endYearSchema.optional(),
    currentlyStudying: z.boolean({
        error: 'Currently studying must be true or false.'
    })
        .optional()
})
.superRefine((data, ctx) => {
    if (
        data.currentlyStudying !== true &&
        data.endYear === undefined
    ) {
        ctx.addIssue({
            code: 'custom',
            path: ['endYear'],
            message: 'End year is required when currently studying is false.'
        });
    }

    if (
        data.startYear !== undefined &&
        data.endYear !== undefined &&
        data.startYear > data.endYear
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['startYear'],
            message: 'Start year cannot be after end year.'
        });
    }
});



const educationUpdateZodSchema = z.strictObject({
    degree: z.string()
        .trim()
        .min(1, 'Degree cannot be empty.')
        .optional(),

    institute: z.string()
        .trim()
        .min(1, 'Institute cannot be empty.')
        .optional(),

    country: z.string()
        .trim()
        .min(1, 'Country cannot be empty.')
        .optional(),

    startYear: startYearSchema.optional(),

    endYear: endYearSchema.optional(),

    currentlyStudying: z.boolean().optional()
})
.superRefine((data, ctx) => {

    if (Object.keys(data).length === 0) {
        ctx.addIssue({
            code: 'custom',
            message: 'At least one field must be provided for update.'
        });
    }

    if (
        data.startYear !== undefined &&
        data.endYear !== undefined &&
        data.startYear > data.endYear
    ) {
        ctx.addIssue({
            code: 'custom',
            path: ['startYear'],
            message: 'Start year cannot be after end year.'
        });
    }

});


module.exports = {educationAdditionZodSchema, educationUpdateZodSchema};