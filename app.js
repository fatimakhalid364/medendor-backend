const express = require('express');
const routes = require('routes');
const app = express();
const cors = require('cors');
const globalErrorHandler =
    require('middlewares/error.middleware');


app.use(cors({
    origin: 'https://a5edd1d013d7.ngrok-free.app', 
    credentials: true 
}));

app.use(express.json());

app.use('/api/v1', routes);

app.use(globalErrorHandler);

module.exports= app;

