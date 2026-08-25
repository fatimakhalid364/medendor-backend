const mongoose = require('mongoose');

const { MONGO_URI} = require('config/env');

const {
    processOutbox,
} = require('workers/outbox.worker');


const start = async () => {

    try {

        await mongoose.connect(MONGO_URI);

        console.log(
            'MongoDB connected for outbox worker.'
        );

        await processOutbox();

    } catch (error) {

        console.error(
            'Outbox worker failed to start:',
            error
        );

        process.exit(1);
    }
};


start();