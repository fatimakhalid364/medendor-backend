// middlewares/validation.middleware.js
const AppError = require('utils/appError.utils');

const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            const { fieldErrors, formErrors } = result.error.flatten();

            const firstFieldError =
                Object.values(fieldErrors)[0]?.[0];

            const firstError =
                firstFieldError || formErrors[0] || 'Invalid input.';

            return next(
                new AppError(
                    `Validation failed. ${firstError}`,
                    400,
                    'VALIDATION_FAILED'
                )
            );
        }

        req[source] = result.data;

        next();
    };
};

module.exports = validate;