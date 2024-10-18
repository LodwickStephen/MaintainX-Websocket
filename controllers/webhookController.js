const crypto = require('crypto');
const axios = require('axios');
const { processWorkOrders } = require('./workOrdersService'); 

// Verify the webhook body signature
const verifyWebhookBodySignature = (req, secret) => {
    const body = JSON.stringify(req.body);
    
    // Extract timestamp and signature
    const signatureHeader = req.headers['x-maintainx-webhook-body-signature'];
    if (!signatureHeader) {
        console.error('Missing body signature header');
        return false; // Or handle as you prefer
    }
    
    const parts = signatureHeader.split(',');
    const timestamp = parts[0].split('=')[1];
    const bodySignature = parts[1].split('=')[1];

    // Prepare the signed payload
    const signedPayload = `${timestamp}.${body}`;
    const expectedBodySignature = crypto.createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex');

    return bodySignature === expectedBodySignature;
};

// Verify the webhook URI signature
const verifyWebhookUriSignature = (req, secret) => {
    const uriSignatureHeader = req.headers['x-maintainx-webhook-uri-signature'];
    if (!uriSignatureHeader) {
        console.error('Missing URI signature header');
        return false; // Or handle as you prefer
    }

    const parts = uriSignatureHeader.split(',');
    const uriSignature = parts[1].split('=')[1]; // Assuming it's structured similarly to the body signature

    // Create the expected URI signature
    const expectedUriSignature = crypto.createHmac('sha256', secret).update(req.originalUrl, 'utf8').digest('hex');

    return uriSignature === expectedUriSignature;
};

// Webhook listener for new work orders
const newWorkOrderWebhook = async (req, res) => {
    const secret = process.env.MAINTAINX_WEBHOOK_SECRET;

    // Step 1: Verify the webhook signatures
    if (!verifyWebhookBodySignature(req, secret)) {
        console.error('Invalid webhook body signature');
        return res.status(400).send('Invalid body signature');
    }

    if (!verifyWebhookUriSignature(req, secret)) {
        console.error('Invalid webhook URI signature');
        return res.status(400).send('Invalid URI signature');
    }

    // Step 2: Extract work order data from the webhook body
    const { newWorkOrder } = req.body;
    
    if (!newWorkOrder) {
        return res.status(400).send('Invalid data');
    }

    try {
        // Process the new work order based on its priority
        await processWorkOrders(newWorkOrder);  // Call the function to calculate due date based on priority
        res.status(200).send('Webhook processed successfully');
    } catch (error) {
        console.error('Error processing work order:', error);
        res.status(500).send('Error processing work order');
    }
};

module.exports = { newWorkOrderWebhook };
