//This file sets up the Express server and routes webhook requests to the webhookController
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const webhookController = require('./controllers/webhookController');

const app = express();
app.use(bodyParser.json());

// Webhook endpoint for new work orders
app.post('/webhook/new-work-order', webhookController.newWorkOrderWebhook);

// Start the server on HTTP
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
