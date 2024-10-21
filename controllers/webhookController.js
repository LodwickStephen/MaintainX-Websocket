const { validateWebhookSignature } = require('../utils/webhookValidator');
const { processWorkOrders, updateWorkOrderIfPriorityChanged  } = require('../services/workOrdersService'); 

// Webhook listener for new work orders
const newWorkOrderWebhook = async (req, res) => {
    
    console.log('Incoming Headers:', req.headers);
    console.log('Incoming Body:', req.body);

    //construct full URI for webhook validation
    const fullUri = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    console.log('Full URI:', fullUri); // Log the constructed full URI


    // Step 1: Validate the webhook signatures
    const isValidSignature = validateWebhookSignature(
        req.headers,
        req.body,
        fullUri, 
        process.env.MAINTAINX_NEW_WORK_ORDER_WEBHOOK_SECRET // Use new work order secret
    );

    if (!isValidSignature) {
        console.error('Invalid webhook signature or timestamp out of tolerance');
        return res.status(400).send('Invalid webhook signature or timestamp out of tolerance');
    }

    // Step 2: Extract work order data from the webhook body
    const { newWorkOrder, workOrderId } = req.body; 

    if (!newWorkOrder) {
        console.error('Invalid data: newWorkOrder is missing');
        return res.status(400).send('Invalid data');
    }

    try {
        // Process the new work order based on its priority
        await processWorkOrders(workOrderId, newWorkOrder);  // Call the function to calculate due date based on priority
        res.status(200).send('New work order due date set successfully');
    } catch (error) {
        console.error('Error processing work order:', error);
        res.status(500).send('Error processing work order');
    }
};


// Webhook listener for work order changes
const workOrderChangeWebhook = async (req, res) => {
    // Step 1: Validate the webhook signatures

       //construct full URI for webhook validation
    const fullUri = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    const isValidSignature = validateWebhookSignature(
        req.headers,
        req.body,
        fullUri,
        process.env.MAINTAINX_WORK_ORDER_CHANGE_WEBHOOK_SECRET // Use work order change secret
    );

    if (!isValidSignature) {
        console.error('Invalid webhook signature or timestamp out of tolerance');
        return res.status(400).send('Invalid webhook signature or timestamp out of tolerance');
    }

    // Step 2: Extract work order change data from the webhook body
    const { newWorkOrder, workOrderId } = req.body;

    if (!newWorkOrder) {
        console.error('Invalid data: newWorkOrder is missing');
        return res.status(400).send('Invalid data');
    }

    try {
        // Check if the priority has changed and update the due date if necessary
        await updateWorkOrderIfPriorityChanged(workOrderId, newWorkOrder);
        res.status(200).send('Due date changed successfully');
    } catch (error) {
        console.error('Error processing work order change:', error);
        res.status(500).send('Error processing work order change');
    }
};
module.exports = { newWorkOrderWebhook, workOrderChangeWebhook };
