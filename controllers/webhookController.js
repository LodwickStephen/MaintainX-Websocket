const crypto = require('crypto');
const axios = require('axios');
const { processWorkOrders } = require('./workOrdersService'); 

// Verify the webhook signature
const verifyWebhookSignature = (req, secret) => {
    const body = JSON.stringify(req.body);
    const timestamp = req.headers['x-maintainx-webhook-body-signature'].split(',')[0].split('=')[1];
    const signature = req.headers['x-maintainx-webhook-body-signature'].split(',')[1].split('=')[1];

    const signedPayload = `${timestamp}.${body}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex');

    return signature === expectedSignature;
};

// Webhook listener for new work orders
const newWorkOrderWebhook = async (req, res) => {
    const secret = process.env.MAINTAINX_WEBHOOK_SECRET;

    // Step 1: Verify the webhook signature
    if (!verifyWebhookSignature(req, secret)) {
        console.error('Invalid webhook signature');
        return res.status(400).send('Invalid signature');
    }

    // Step 2: Extract work order data from the webhook body
    const { newWorkOrder } = req.body;
    
    if (!newWorkOrder) {
        return res.status(400).send('Invalid data');
    }

    try {
        // Process the new work order based on its priority
        await processWorkOrders(newWorkOrder);  // Here you call the function that calculates the due date based on priority
        res.status(200).send('Webhook processed successfully');
    } catch (error) {
        console.error('Error processing work order:', error);
        res.status(500).send('Error processing work order');
    }
};

module.exports = { newWorkOrderWebhook };
