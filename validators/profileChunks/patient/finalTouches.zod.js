const { z } = require('zod');

const addition = z.strictObject({

    lookingFor: z.strictObject({
        medicalAdvice: z.boolean({
            error: 'Medical advice must be true or false.'
        }),

        emotionalSupport: z.boolean({
            error: 'Emotional support must be true or false.'
        }),

        communityDiscussions: z.boolean({
            error: 'Community discussions must be true or false.'
        })
    }),

    notificationPreferences: z.strictObject({
        emailNotifications: z.boolean({
            error: 'Email notifications must be true or false.'
        }),

        inAppNotifications: z.boolean({
            error: 'In-app notifications must be true or false.'
        }),

        newsletterSubscribed: z.boolean({
            error: 'Newsletter subscription must be true or false.'
        })
    })

});



const update = z.strictObject({
    lookingFor: z.strictObject({
    medicalAdvice: z.boolean({
        error: 'Medical advice must be true or false.'
        }).optional(),

        emotionalSupport: z.boolean({
            error: 'Emotional support must be true or false.'
        }).optional(),

        communityDiscussions: z.boolean({
            error: 'Community discussions must be true or false.'
        }).optional()
    }).optional(),

    notificationPreferences: z.strictObject({
        emailNotifications: z.boolean({
            error: 'Email notifications must be true or false.'
        }).optional(),

        inAppNotifications: z.boolean({
            error: 'In-app notifications must be true or false.'
        }).optional(),

        newsletterSubscribed: z.boolean({
            error: 'Newsletter subscription must be true or false.'
        }).optional()
    }).optional()
})
.refine(
    data => Object.keys(data).length > 0,
    {
        error: 'At least one field must be provided for update.'
    }
);

module.exports = {
        addition,
        update
}