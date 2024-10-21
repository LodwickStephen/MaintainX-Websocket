//This file sets up the Express server and routes webhook requests to the webhookController
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const webhookController = require('./controllers/webhookController');

const app = express();
app.use(bodyParser.json());

// Webhook endpoint for new work orders
app.post('/webhook/new-work-order', webhookController.newWorkOrderWebhook);

// Webhook endpoint for work order changes
app.post('/webhook/work-order-change', webhookController.workOrderChangeWebhook);

app.post('/test-webhook', (req, res) => {
    console.log('Test webhook hit:', req.body);
    res.send('Test webhook received');
});

console.log('Setting up webhook routes');


// Start the server on HTTP
const PORT = 80;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
