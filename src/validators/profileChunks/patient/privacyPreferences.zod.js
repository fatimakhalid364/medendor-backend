const {z} = require('zod');

const addition = z.strictObject({

    preferredDoctorGender: z.enum(genderArray, {
        error: 'Preferred doctor gender must be a valid gender.'
    }).optional(),

    allowDirectMessages: z.boolean({
        error: 'Allow direct messages must be true or false.'
    }).default(true),

    allowAnonymousPosting: z.boolean({
        error: 'Allow anonymous posting must be true or false.'
    }).default(false),

    visibilitySettings: z.strictObject({

        hideAge: z.boolean({
            error: 'Hide age must be true or false.'
        }).default(false),

        showHealthConcernsToDoctorsOnly: z.boolean({
            error: 'Show health concerns to doctors only must be true or false.'
        }).default(false),

        showLocationToDoctorsOnly: z.boolean({
            error: 'Show location to doctors only must be true or false.'
        }).default(true),

        allowProfileToAppearInSearch: z.boolean({
            error: 'Allow profile to appear in search must be true or false.'
        }).default(true),

        showAvailabilityStatus: z.boolean({
            error: 'Show availability status must be true or false.'
        }).default(true)

    }).default({})

});


const update = z.strictObject({

    preferredDoctorGender: z.enum(genderArray, {
        error: 'Preferred doctor gender must be a valid gender.'
    }).optional(),

    allowDirectMessages: z.boolean({
        error: 'Allow direct messages must be true or false.'
    }).optional(),

    allowAnonymousPosting: z.boolean({
        error: 'Allow anonymous posting must be true or false.'
    }).optional(),

    visibilitySettings: z.strictObject({

        hideAge: z.boolean({
            error: 'Hide age must be true or false.'
        }).optional(),

        showHealthConcernsToDoctorsOnly: z.boolean({
            error: 'Show health concerns to doctors only must be true or false.'
        }).optional(),

        showLocationToDoctorsOnly: z.boolean({
            error: 'Show location to doctors only must be true or false.'
        }).optional(),

        allowProfileToAppearInSearch: z.boolean({
            error: 'Allow profile to appear in search must be true or false.'
        }).optional(),

        showAvailabilityStatus: z.boolean({
            error: 'Show availability status must be true or false.'
        }).optional()

    }).optional()

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