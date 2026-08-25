const OutboxEvent = require('models/outboxEvent.model');

const redisClient = require('config/redis');

const {
    sendMail,
} = require('utils/mailer.utils');

const {
    codeMailSub,
    codeMailHtml,
} = require('constants/mails');

const MAX_ATTEMPTS = 5;

const BASE_RETRY_DELAY_MS = 60 * 1000;


/*
 * Process one event.
 */
const processOutboxEvent = async (event) => {

    switch (event.type) {

        case 'SEND_VERIFICATION_EMAIL': {

            const {
                email,
                verificationCode,
            } = event.payload;

            /*
             * Store the verification code in Redis.
             *
             * We do this here rather than inside signup()
             * because the MongoDB transaction cannot include Redis.
             */
            await redisClient.setEx(
                `verifyCode:${email}`,
                300,
                verificationCode
            );

            /*
             * Now send the email.
             */
            await sendMail(
                email,
                codeMailSub,
                codeMailHtml(verificationCode)
            );

            break;
        }

        default:

            throw new Error(
                `Unknown outbox event type: ${event.type}`
            );
    }
};


/*
 * Claim one event atomically.
 *
 * This is important if you have multiple workers running.
 */
const claimOutboxEvent = async () => {

    const now = new Date();

    const event = await OutboxEvent.findOneAndUpdate(
        {
            $or: [
                {
                    status: 'pending',
                    $or: [
                        { nextAttemptAt: null },
                        { nextAttemptAt: { $lte: now } },
                    ],
                },

                /*
                 * Recover events that were being processed
                 * by a worker that crashed.
                 *
                 * An event stuck in "processing" for more
                 * than 5 minutes becomes eligible again.
                 */
                {
                    status: 'processing',
                    updatedAt: {
                        $lte: new Date(
                            Date.now() - 5 * 60 * 1000
                        ),
                    },
                },
            ],
        },

        {
            $set: {
                status: 'processing',
            },

            $inc: {
                attempts: 1,
            },
        },

        {
            sort: {
                createdAt: 1,
            },

            new: true,
        }
    );

    return event;
};


/*
 * Process events continuously.
 */
const processOutbox = async () => {

    console.log('Outbox worker started.');

    while (true) {

        let event;

        try {

            event = await claimOutboxEvent();

        } catch (error) {

            console.error(
                'Failed to claim outbox event:',
                error
            );

            await sleep(5000);

            continue;
        }

        /*
         * Nothing to process.
         */
        if (!event) {
            await sleep(2000);
            continue;
        }

        try {

            console.log(
                `Processing outbox event ${event._id}`
            );

            await processOutboxEvent(event);

            /*
             * Email successfully sent.
             */
            await OutboxEvent.updateOne(
                {
                    _id: event._id,
                    status: 'processing',
                },
                {
                    $set: {
                        status: 'completed',
                        processedAt: new Date(),
                        lastError: null,
                    },
                }
            );

            console.log(
                `Outbox event ${event._id} completed.`
            );

        } catch (error) {

            console.error(
                `Outbox event ${event._id} failed:`,
                error
            );

            const attempts = event.attempts;

            /*
             * Stop retrying after MAX_ATTEMPTS.
             */
            if (attempts >= MAX_ATTEMPTS) {

                await OutboxEvent.updateOne(
                    {
                        _id: event._id,
                        status: 'processing',
                    },
                    {
                        $set: {
                            status: 'failed',
                            lastError: error.message,
                        },
                    }
                );

                console.error(
                    `Outbox event ${event._id} permanently failed.`
                );

            } else {

                /*
                 * Exponential-ish retry delay:
                 *
                 * attempt 1 → 1 minute
                 * attempt 2 → 2 minutes
                 * attempt 3 → 4 minutes
                 * attempt 4 → 8 minutes
                 */
                const retryDelay =
                    BASE_RETRY_DELAY_MS *
                    Math.pow(2, attempts - 1);

                await OutboxEvent.updateOne(
                    {
                        _id: event._id,
                        status: 'processing',
                    },
                    {
                        $set: {
                            status: 'pending',

                            nextAttemptAt: new Date(
                                Date.now() + retryDelay
                            ),

                            lastError: error.message,
                        },
                    }
                );

                console.log(
                    `Outbox event ${event._id} `
                    + `will retry in `
                    + `${retryDelay / 1000}s.`
                );
            }
        }
    }
};


const sleep = (ms) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};


module.exports = {
    processOutbox,
};