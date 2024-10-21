const crypto = require('crypto');


// Validate the MaintainX webhook signature
function validateWebhookSignature(headers, body, fullUri, secret) {
    // Validate the body signature
    const bodySignature = headers['x-maintainx-webhook-body-signature'];
    const isValidBodySignature = validateSignature(bodySignature, body, secret);

    // Validate the URI signature
    //const uriSignature = headers['x-maintainx-webhook-uri-signature'];
    //const isValidUriSignature = validateSignature(uriSignature, fullUri, secret);

    // Both signatures must be valid
    //return isValidBodySignature && isValidUriSignature;
    return isValidBodySignature
}

// Helper function to validate signature for both body and URI
function validateSignature(signatureHeader, data, secret) {
  if (!signatureHeader) {
    console.error('Signature header is missing'); // Log for better debugging
    return false; // Signature header is missing
  }

  // Split the header into timestamp and signature parts
  const [timestampPart, signaturePart] = signatureHeader.split(',');
  const timestamp = timestampPart.split('=')[1];
  const receivedSignature = signaturePart.split('=')[1];

  // Prepare the signed payload string as <timestamp>.<data>
  const signedPayload = `${timestamp}.${typeof data === 'object' ? JSON.stringify(data) : data}`;

  // Calculate the expected signature using HMAC SHA256
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');

    console.log(`Timestamp: ${timestamp}`);
    console.log(`Received Signature: ${receivedSignature}`);
    console.log(`Expected Signature: ${expectedSignature}`);
    console.log(`Signed Payload: ${signedPayload}`);

 // Compare the received signature to the expected signature
 const signatureMatches = receivedSignature === expectedSignature;

 // Check timestamp for replay attacks, set tolerance to 5 minutes
 const receivedTime = parseInt(timestamp, 10);
 const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
 const timeDifference = Math.abs(currentTime - receivedTime);

 const tolerance = 5 * 60; // 5 minutes in seconds

 console.log(`Time Difference: ${timeDifference} seconds`);


 return signatureMatches && timeDifference <= tolerance;

}

module.exports = { validateWebhookSignature };
