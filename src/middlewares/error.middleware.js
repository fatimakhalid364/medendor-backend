const AppError = require('utils/appError.utils');

const globalErrorHandler = (
    error,
    req,
    res,
    next
) => {
    console.error(
        'Unhandled application error:',
        error
    );

    if (error instanceof AppError) {

        return res.status(
            error.statusCode
        ).json({
            success: false,

            code: error.code,

            message: error.message
        });
    }

    return res.status(500).json({
        success: false,

        code: 'INTERNAL_SERVER_ERROR',

        message:
            'An unexpected error occurred.'
    });
};

module.exports = globalErrorHandler;