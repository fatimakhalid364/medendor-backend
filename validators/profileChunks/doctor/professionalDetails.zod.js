const { z } = require('zod');

const experienceZodSchema = z.strictObject({

    organization: z.string()
        .trim()
        .min(1, {
            error: 'Organization cannot be empty.'
        }),

    position: z.string()
        .trim()
        .min(1, {
            error: 'Position cannot be empty.'
        }),

    startDate: z.coerce.date({
        error: 'Start date must be a valid date.'
    }),

    endDate: z.coerce.date({
        error: 'End date must be a valid date.'
    }),

    currentlyWorking: z.boolean({
        error: 'Currently working must be true or false.'
    })

}).superRefine((data, ctx) => {

    // Ongoing experience should not have an end date
    if (data.currentlyWorking && data.endDate !== undefined) {
        ctx.addIssue({
            code: 'custom',
            path: ['endDate'],
            message: 'End date should not be provided for ongoing experience.'
        });
    }

    // Completed experience must have an end date
    if (!data.currentlyWorking && data.endDate === undefined) {
        ctx.addIssue({
            code: 'custom',
            path: ['endDate'],
            message: 'End date is required when experience is not ongoing.'
        });
    }

    // If both dates exist, start cannot be after end
    if (
        data.endDate !== undefined &&
        data.startDate > data.endDate
    ) {
        ctx.addIssue({
            code: 'custom',
            path: ['startDate'],
            message: 'Start date cannot be after end date.'
        });
    }
});

const addition = z.strictObject({

    specialty: z.string({
        error: 'Specialty is required.'
    })
        .trim()
        .min(1, {
            error: 'Specialty is required.'
        }),

    subSpecialty: z.string()
        .trim()
        .min(1, {
            error: 'Sub-specialty cannot be empty.'
        })
        .optional(),

    experience: z.array(experienceZodSchema, {
        error: 'Experience must be an array.'
    })
        .max(5, {
            error: 'Maximum 5 experience entries allowed.'
        }),

    about: z.string()
        .trim()
        .min(1, {
            error: 'About cannot be empty.'
        })
        .optional()

});

const update = z.strictObject({

    specialty: z.string()
        .trim()
        .min(1, {
            error: 'Specialty can not be empty.'
        })
        .optional(),

    subSpecialty: z.string()
        .trim()
        .min(1, {
            error: 'Sub-specialty cannot be empty.'
        })
        .optional(),

    experience: z.array(experienceZodSchema, {
        error: 'Experience must be an array.'
    })
        .max(5, {
            error: 'Maximum 5 experience entries allowed.'
        })
        .optional(),

    about: z.string()
        .trim()
        .min(1, {
            error: 'About cannot be empty.'
        })
        .optional()

});

module.exports = {
    addition,
    update
};