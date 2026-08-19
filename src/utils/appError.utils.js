class AppError extends Error {
    constructor(
        message,
        statusCode,
        code,
        options = {}
    ) {
        super(message, options);

        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        // Maintain proper stack trace.
        Error.captureStackTrace(
            this,
            this.constructor
        );
    }
}

module.exports = AppError;