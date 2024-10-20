const { validateWebhookSignature } = require('./webhookValidator'); // Adjust the path as necessary
const { processWorkOrders, updateWorkOrderIfPriorityChanged  } = require('./workOrdersService'); 

// Webhook listener for new work orders
const newWorkOrderWebhook = async (req, res) => {
    // Step 1: Validate the webhook signatures
    const isValidSignature = validateWebhookSignature(
        req.headers,
        req.body,
        req.originalUrl,
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
    const isValidSignature = validateWebhookSignature(
        req.headers,
        req.body,
        req.originalUrl,
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
