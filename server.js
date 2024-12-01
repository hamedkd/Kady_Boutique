require('dotenv').config(); // Load environment variables from .env

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const twilio = require("twilio");

const app = express();
const PORT = process.env.PORT || 3000;

// Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Path to JSON file for storing orders
const filePath = process.env.FILE_PATH || "./userOrders.json";

// Endpoint: POST /submit-order
app.post("/submit-order", (req, res) => {
  res.json({ success: true, message: "Order received." });
  const userInfo = req.body;

  // Validate required fields
  if (!userInfo.userName || !userInfo.userPhone || !userInfo.userEmail || !userInfo.userAddress || !userInfo.cart) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  // Ensure the orders file exists
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]");
  }

  // Read existing orders
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading JSON file:", err);
      return res.status(500).json({ success: false, message: "Failed to read order data." });
    }

    const orders = JSON.parse(data || "[]");

    // Generate a unique order ID
    const nextOrderId = orders.length > 0 ? orders[orders.length - 1].orderId + 1 : 1;

    // Add the new order to the orders array
    const newOrder = { orderId: nextOrderId, ...userInfo };
    orders.push(newOrder);

    // Write updated orders back to the JSON file
    fs.writeFile(filePath, JSON.stringify(orders, null, 2), (err) => {
      if (err) {
        console.error("Error saving JSON file:", err);
        return res.status(500).json({ success: false, message: "Failed to save order." });
      }

      // Prepare the SMS message
      const message = `
        New Order Received:
        - Order ID: ${newOrder.orderId}
        - Name: ${newOrder.userName}
        - Address: ${newOrder.userAddress}
        - Phone: ${newOrder.userPhone}
        - Email: ${newOrder.userEmail}
        - Items: ${newOrder.cart.map(item => `${item.name} (x${item.quantity})`).join(", ")}
      `;

      // Send SMS notification to the owner
      client.messages
        .create({
          body: message,
          from: twilioPhoneNumber,
          to: process.env.OWNER_PHONE_NUMBER, // Owner's phone number from .env
        })
        .then(() => {
          console.log("SMS notification sent.");
          res.json({ success: true, message: "Order placed successfully!" });
        })
        .catch((smsError) => {
          console.error("Error sending SMS:", smsError);
          res.status(500).json({ success: false, message: "Order saved, but SMS notification failed." });
        });
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
