const express = require('express');
const routes = require('routes');
const app = express();
const cors = require('cors');
const globalErrorHandler = require('middlewares/error.middleware');
const {FRONTEND_URL} = require('config/env');


app.use(cors({
    origin: FRONTEND_URL, 
    credentials: true 
}));

app.use(express.json());

app.use('/api/v1', routes);

app.use(globalErrorHandler);

module.exports= app;

