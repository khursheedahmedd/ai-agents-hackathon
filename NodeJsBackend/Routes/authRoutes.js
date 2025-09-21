const express = require("express");
const router = express.Router();
const { Webhook } = require("svix");
const User = require("../Models/User");
const { clerk } = require("../services/clerkService");

// Clerk Webhook Handler
router.post("/webhook", async (req, res) => {
  console.log(`[${new Date().toISOString()}] Webhook received:`, req.body.type);
  const payload = req.body;
  const svixHeaders = req.headers;

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
  try {
    const verifiedPayload = wh.verify(payload, svixHeaders);
    console.log(
      `[${new Date().toISOString()}] Processing webhook: ${
        verifiedPayload.type
      }`
    );

    if (verifiedPayload.type === "user.created") {
      console.log(
        `[${new Date().toISOString()}] Creating user ${id} with role ${
          public_metadata.role || "student"
        }`
      );
      const { id, email_addresses, public_metadata } = verifiedPayload.data;

      await User.create({
        clerkUserId: id,
        email: email_addresses[0].email_address,
        role: public_metadata.role || "student",
      });
      console.log(
        `[${new Date().toISOString()}] User created successfully: ${user._id}`
      );
    }

    res.status(200).end();
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Webhook error:`,
      error.message
    );
    res.status(400).json({ error: "Invalid webhook" });
  }
});

module.exports = router;
