require('module-alias/register');
const app = require('./app');
const {connection} = require('config/db');
const {PORT: port} = require('config/env');
const {connectRedis} = require('config/redis');
const {
    processOutbox,
} = require('workers/outbox.worker');

(async () => {
    try {
        await connectRedis();             
        await connection();
        processOutbox();          
        app.listen(port, () => {
        console.log(`Server started at port ${port}`);
    });
    } catch (err) {
        console.error('Startup error:', err);
        process.exit(1);
    }
})();
