const axios = require('axios');
const { getAuthHeaders } = require('../utils/auth');

// Fetch work orders that need due dates to be set based on priority
const getNewWorkOrders = async () => {
    const url = `${process.env.API_BASE_URL}/workorders`; // Adjust this according to the MaintainX API endpoint
    const headers = getAuthHeaders();
    
    try {
        const response = await axios.get(url, { headers });
        return response.data; // Return work orders data
    } catch (error) {
        console.error(`Failed to fetch work orders: ${error.message}`);
        throw error;
    }
};

// Calculate due date based on priority
const calculateDueDate = (priority) => {
    const now = new Date();
    let dueDate;

    switch (priority) {
        case 'HIGH':
            dueDate = new Date(now.setDate(now.getDate() + 1)); // 1 day from now
            break;
        case 'MEDIUM':
            dueDate = new Date(now.setDate(now.getDate() + 3)); // 3 days from now
            break;
        case 'LOW':
            dueDate = new Date(now.setDate(now.getDate() + 7)); // 7 days from now
            break;
        default:
            dueDate = null;
            break;
    }

    return dueDate ? dueDate.toISOString() : null;
};

// Update work order with new due date
const updateWorkOrderDueDate = async (workOrderId, dueDate) => {
    const url = `${process.env.API_BASE_URL}/workorders/${workOrderId}`;
    const headers = getAuthHeaders();

    try {
        const response = await axios.patch(url, { dueDate }, { headers });
        console.log(`Work order ${workOrderId} updated with due date: ${dueDate}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to update work order: ${error.message}`);
        throw error;
    }
};

// Add a comment to a work order
const addCommentToWorkOrder = async (workOrderId, comment) => {
    const url = `${process.env.API_BASE_URL}/workorders/${workOrderId}/comments`;
    const headers = getAuthHeaders();

    const payload = {
        content: comment
    };

    try {
        const response = await axios.post(url, payload, { headers });
        console.log(`Comment added to work order ${workOrderId}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to add comment to work order: ${error.message}`);
        throw error;
    }
};

// Add a cost to a work order
const addCostToWorkOrder = async (workOrderId, cost) => {
    const url = `${process.env.API_BASE_URL}/workorders/${workOrderId}/costs`;
    const headers = getAuthHeaders();

    const payload = {
        type: "EXPENSE",        // Always "EXPENSE" as per documentation
        costType: cost.costType, // Example: "LABOR", "OTHER", "TRAVEL"
        costPerUnit: cost.costPerUnit, // Cost per unit in cents
        description: cost.description || null // Optional description
    };

    try {
        const response = await axios.post(url, payload, { headers });
        console.log(`Cost added to work order ${workOrderId}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to add cost to work order: ${error.message}`);
        throw error;
    }
};

// Main function to process work orders
const processWorkOrders = async () => {
    const workOrders = await getNewWorkOrders();

    for (const workOrder of workOrders) {
        const { id, priority, dueDate } = workOrder;

        // If work order doesn't already have a due date
        if (!dueDate) {
            const calculatedDueDate = calculateDueDate(priority);
            
            if (calculatedDueDate) {
                await updateWorkOrderDueDate(id, calculatedDueDate);
            } else {
                console.log(`No due date set for work order ${id} with priority ${priority}`);
            }
        }

        // Optionally add a comment
        await addCommentToWorkOrder(id, `Due date set based on priority: ${priority}`);

        // Optionally add a cost (if applicable)
        const cost = { costType: 'LABOR', costPerUnit: 1000, description: 'Initial cost' };
        await addCostToWorkOrder(id, cost);
    }
};

module.exports = { processWorkOrders };
