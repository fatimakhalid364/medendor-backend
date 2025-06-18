require('module-alias/register');
const app = require('./app');
const {db, env: {PORT: port}, redis: {connectRedis}} = require('config');

(async () => {
    try {
        await connectRedis();             
        await db.connection();           
        app.listen(port, () => {
        console.log(`Server started at port ${port}`);
    });
    } catch (err) {
    console.error('Startup error:', err);
    }
})();
