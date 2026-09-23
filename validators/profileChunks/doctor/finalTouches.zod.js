const { z } = require('zod');

const finalTouchesAdditionZodSchema = z.strictObject({
    openTo: z.strictObject({
        collaborations: z.boolean({
            error: 'Collaborations must be true or false.'
        }),
        jobOpportunities: z.boolean({
            error: 'Job opportunities must be true or false.'
        }),
        mentoring: z.boolean({
            error: 'Mentoring must be true or false.'
        })
    }),

    notificationPreferences: z.strictObject({
        emailNotifications: z.boolean({
            error: 'Email notifications must be true or false.'
        }),
        inAppNotifications: z.boolean({
            error: 'In-app notifications must be true or false.'
        }),
        newsletterUpdates: z.boolean({
            error: 'Newsletter updates must be true or false.'
        }),
        allNotifications: z.boolean({
            error: 'All notifications must be true or false.'
        })
    }),

    visibilitySettings: z.strictObject({
        showContactInfo: z.boolean({
            error: 'Show contact info must be true or false.'
        }),
        showEducation: z.boolean({
            error: 'Show education must be true or false.'
        }),
        showWorkExperience: z.boolean({
            error: 'Show work experience must be true or false.'
        }),
        showLanguagesSpoken: z.boolean({
            error: 'Show languages spoken must be true or false.'
        }),
        showAvailabilityStatus: z.boolean({
            error: 'Show availability status must be true or false.'
        })
    })
});

const finalTouchesUpdateZodSchema = z.strictObject({
    openTo: z.strictObject({
        collaborations: z.boolean({
            error: 'Collaborations must be true or false.'
        }),
        jobOpportunities: z.boolean({
            error: 'Job opportunities must be true or false.'
        }),
        mentoring: z.boolean({
            error: 'Mentoring must be true or false.'
        })
    }).optional(),

    notificationPreferences: z.strictObject({
        emailNotifications: z.boolean({
            error: 'Email notifications must be true or false.'
        }),
        inAppNotifications: z.boolean({
            error: 'In-app notifications must be true or false.'
        }),
        newsletterUpdates: z.boolean({
            error: 'Newsletter updates must be true or false.'
        }),
        allNotifications: z.boolean({
            error: 'All notifications must be true or false.'
        })
    }).optional(),

    visibilitySettings: z.strictObject({
        showContactInfo: z.boolean({
            error: 'Show contact info must be true or false.'
        }),
        showEducation: z.boolean({
            error: 'Show education must be true or false.'
        }),
        showWorkExperience: z.boolean({
            error: 'Show work experience must be true or false.'
        }),
        showLanguagesSpoken: z.boolean({
            error: 'Show languages spoken must be true or false.'
        }),
        showAvailabilityStatus: z.boolean({
            error: 'Show availability status must be true or false.'
        })
    }).optional()
});

module.exports = {finalTouchesAdditionZodSchema, finalTouchesUpdateZodSchema};