require('module-alias/register');
const app = require('./app');
const {db, env: {PORT: port}, redis: {connectRedis}} = require('config');
const {
    processOutbox,
} = require('workers/outbox.worker');

(async () => {
    try {
        await connectRedis();             
        await db.connection();
        processOutbox();          
        app.listen(port, () => {
        console.log(`Server started at port ${port}`);
    });
    } catch (err) {
        console.error('Startup error:', err);
        process.exit(1);
    }
})();
