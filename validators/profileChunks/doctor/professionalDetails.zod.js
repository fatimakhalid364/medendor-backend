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

}).refine(
    data =>
        data.startDate <= data.endDate,
    {
        path: ['startDate'],
        error: 'Start date cannot be after end date.'
    }
);

const professionalDetailsAdditionZodSchema = z.strictObject({

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

const professionalDetailsUpdateZodSchema = z.strictObject({

    specialty: z.string({
        error: 'Specialty is required.'
    })
        .trim()
        .min(1, {
            error: 'Specialty is required.'
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
    professionalDetailsAdditionZodSchema,
    professionalDetailsUpdateZodSchema
};