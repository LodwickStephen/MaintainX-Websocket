# MaintainX Work Order Integration

## Overview
This project integrates with the MaintainX API to automatically set the due date for work orders based on their priority. It listens for incoming webhook notifications from MaintainX and updates work orders accordingly.

## Features
- Receives webhook notifications for new work orders and work order changes.
- Validates incoming webhook signatures for security.
- Calculates due dates for work orders based on their priority levels (High, Medium, Low), setting the due date to be 1 day, 3 days, or 7 days in the future, respectively.
- Updates work order information using the MaintainX API.

## Technologies Used
- **Node.js**
- **Express.js**
- **Axios** (for making HTTP requests)
- **dotenv** (for environment variable management)

## Project Structure
```
MaintainX-Work-Order/
├── controllers/
│   └── webhookController.js         # Handles incoming webhook requests
├── services/
│   └── workOrdersService.js          # Contains logic for processing work orders
├── utils/
│   ├── auth.js                       # Handles authorization headers for API requests
│   └── webhookValidator.js           # Validates incoming webhook signatures
├── .env                               # Environment variables for configuration
├── app.js                             # Main application file that sets up the server
└── package.json                       # Project metadata and dependencies
```

## Installation
Clone the repository:
```bash
git clone https://github.com/MarcusTianhuaZhang/MaintainX-Work-Order.git
cd MaintainX-Work-Order
```


## Install dependencies:
```
npm install
```

Create a .env file in the root directory and add your MaintainX API credentials:

```
makefile

BEARER_TOKEN=your_bearer_token
ORGANIZATION_ID=your_organization_id
API_BASE_URL=https://api.getmaintainx.com/v1
MAINTAINX_NEW_WORK_ORDER_WEBHOOK_SECRET=your_new_work_order_webhook_secret
MAINTAINX_WORK_ORDER_CHANGE_WEBHOOK_SECRET=your_work_order_change_webhook_secret
```

## Usage
Start the application:

```
node app.js
```

The server will run on port 80 by default. You can change the port in the app.js file if needed.

The webhook endpoints are:
- **POST /webhook/new-work-order**: For receiving new work order notifications.
- **POST /webhook/work-order-change**: For receiving updates on existing work orders.
You can test the webhook endpoints using Postman or CURL.

## Testing
Test Webhook Endpoint
```
You can send a test webhook request using the following command:
curl -X POST http://18.216.38.243/webhook/new-work-order \
-H "Content-Type: application/json" \
-d '{"workOrderId": 123456, "newWorkOrder": {"priority": "MEDIUM", "dueDate": null}}'
```

## Logging
The application logs incoming webhook requests, headers, and any errors that occur during processing. Check the terminal where the server is running for logs.
