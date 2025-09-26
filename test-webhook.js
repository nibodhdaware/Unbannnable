#!/usr/bin/env node

// Test script for webhook payment processing
const crypto = require("crypto");

// Mock webhook payload for successful payment
const webhookPayload = {
    event_type: "payment.succeeded",
    data: {
        payment_id: "test_payment_123",
        status: "succeeded",
        amount: 900, // $9.00 in cents
        currency: "USD",
        customer_email: "test@example.com",
        customer_name: "Test User",
        metadata: {
            userId: "user_test123", // This should be a valid Clerk user ID
            credits: "100",
            amount: "9.00",
        },
    },
};

// Create webhook signature (simplified for testing)
const payload = JSON.stringify(webhookPayload);

console.log("Testing webhook payload:");
console.log(JSON.stringify(webhookPayload, null, 2));

// Test the webhook endpoint
const testWebhook = async () => {
    try {
        const response = await fetch("http://localhost:3002/api/webhook", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "webhook-id": "test_webhook_id",
                "webhook-signature": "v1,test_signature",
                "webhook-timestamp": Math.floor(Date.now() / 1000).toString(),
            },
            body: payload,
        });

        const result = await response.text();
        console.log("Webhook response status:", response.status);
        console.log("Webhook response:", result);
    } catch (error) {
        console.error("Webhook test error:", error.message);
    }
};

// Run the test
testWebhook();
