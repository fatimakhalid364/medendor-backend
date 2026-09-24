const { z } = require('zod');

const workplaceZodSchema = z.strictObject({
    name: z.string({
        error: 'Workplace name is required.'
    })
    .trim()
    .min(1, {
        error: 'Workplace name cannot be empty.'
    }),

    location: z.string({
        error: 'Workplace location is required.'
    })
    .trim()
    .min(1, {
        error: 'Workplace location cannot be empty.'
    })
});

const addition = z.strictObject({

    workplaces: z.array(workplaceZodSchema, {
        error: 'Workplaces must be an array.'
    })
    .max(5, {
        error: 'Maximum 5 workplaces entries allowed.'
    })
    .optional(),

    availableForOnlineConsultation: z.boolean({
        error: 'Available for online consultation must be true or false.'
    })
    .optional(),

    acceptingNewPatients: z.boolean({
        error: 'Accepting new patients must be true or false.'
    })
    .optional(),

    consultationFee: z.number({
        error: 'Consultation fee is required.'
    })
    .min(0, {
        error: 'Consultation fee cannot be negative.'
    }),

    appointmentTimeSlots: z.array(
        z.string()
        .trim()
        .min(1, {
            error: 'Appointment time slot cannot be empty.'
        }),
        {
            error: 'Appointment time slots must be an array.'
        }
    )
    .max(5, {
        error: 'Maximum 5 appointment-slot entries allowed.'
    })

}).refine(
    data =>
        data.workplaces.length > 0 ||
        data.availableForOnlineConsultation === true,
    {
        error: 'Provide at least one workplace or enable online consultation.'
    }
);

const update = z.strictObject({

    workplaces: z.array(workplaceZodSchema, {
        error: 'Workplaces must be an array.'
    })
    .max(5, {
        error: 'Maximum 5 workplaces entries allowed.'
    })
    .optional(),

    availableForOnlineConsultation: z.boolean({
        error: 'Available for online consultation must be true or false.'
    })
    .optional(),

    acceptingNewPatients: z.boolean({
        error: 'Accepting new patients must be true or false.'
    })
    .optional(),

    consultationFee: z.number({
        error: 'Consultation fee is required.'
    })
    .min(0, {
        error: 'Consultation fee cannot be negative.'
    })
    .optional(),

    appointmentTimeSlots: z.array(
        z.string()
        .trim()
        .min(1, {
            error: 'Appointment time slot cannot be empty.'
        }),
        {
            error: 'Appointment time slots must be an array.'
        }
    )
    .max(5, {
        error: 'Maximum 5 appointment-slot entries allowed.'
    })
    .optional()

}).refine(
    data =>
        data.workplaces.length > 0 ||
        data.availableForOnlineConsultation === true,
    {
        error: 'Provide at least one workplace or enable online consultation.'
    }
);



module.exports = {
    addition,
    update
};