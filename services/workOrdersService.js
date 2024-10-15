const axios = require('axios');
const { getAuthHeaders } = require('../utils/auth');

// Calculate due date based on priority
const calculateDueDate = (priority) => {
    const now = new Date();
    let dueDate;

    switch (priority.toUpperCase()) {
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

// Process a single work order
const processWorkOrders = async (workOrder) => {
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
};

module.exports = { processWorkOrders };
