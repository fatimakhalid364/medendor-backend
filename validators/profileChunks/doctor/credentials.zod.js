const { z } = require('zod');

const {educationAdditionZodSchema, educationUpdateZodSchema} = require('./education.zod');

const addition = z.strictObject({

    medicalLicenseNumber: z.string({
        error: 'Medical license number is required.'
    })
    .trim()
    .min(1, {
        error: 'Medical license number is required.'
    }),

    issuingAuthority: z.string({
        error: 'Issuing authority is required.'
    })
    .trim()
    .min(1, {
        error: 'Issuing authority is required.'
    }),

    licenseCertificateUrl: z.string({
        error: 'License certificate URL is required.'
    })
    .trim()
    .min(1, {
        error: 'License certificate URL is required.'
    }),

    education: z.array(educationAdditionZodSchema, {
        error: 'Education must be an array.'
    })
    .max(5, {
        error: 'Maximum 5 degree entries allowed.'
    }),

    certifications: z.array(
        z.string()
            .trim()
            .min(1, {
                error: 'Certification cannot be empty.'
            }),
        {
            error: 'Certifications must be an array.'
        }
    )
    .max(5, {
        error: 'Maximum 5 certifications allowed.'
    })

});

const update = z.strictObject({

    medicalLicenseNumber: z.string({
        error: 'Medical license number is required.'
    })
    .trim()
    .min(1, {
        error: 'Medical license number is required.'
    })
    .optional(),

    issuingAuthority: z.string({
        error: 'Issuing authority is required.'
    })
    .trim()
    .min(1, {
        error: 'Issuing authority is required.'
    })
    .optional(),

    licenseCertificateUrl: z.string({
        error: 'License certificate URL is required.'
    })
    .trim()
    .min(1, {
        error: 'License certificate URL is required.'
    })
    .optional(),

    education: z.array(educationUpdateZodSchema, {
        error: 'Education must be an array.'
    })
    .max(5, {
        error: 'Maximum 5 degree entries allowed.'
    })
    .optional(),

    certifications: z.array(
        z.string()
            .trim()
            .min(1, {
                error: 'Certification cannot be empty.'
            }),
        {
            error: 'Certifications must be an array.'
        }
    )
    .max(5, {
        error: 'Maximum 5 certifications allowed.'
    })
    .optional()

});

module.exports = {
    addition,
    update
};

