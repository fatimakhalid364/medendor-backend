const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const { MONGO_URI } = require('./env');

const connection = function () {
    return new Promise((resolve, reject) => {
        mongoose
            .connect(MONGO_URI)
            .then(() => {
                console.log('db connected');
                resolve();
            })
            .catch((error) => {
                error.message = 'could not connect to database, the server may be down';
                reject(error);
            });
    });
};

module.exports = { connection };
