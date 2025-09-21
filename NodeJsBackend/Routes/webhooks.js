// routes/webhooks.js
const express = require("express");
const { Webhook } = require("svix");
const User = require("../Models/User");

const router = express.Router();

router.post("/clerk-webhook", async (req, res) => {
  const payload = req.body;
  const svixHeaders = req.headers;
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

  try {
    const verifiedPayload = wh.verify(payload, svixHeaders);

    if (verifiedPayload.type === "user.created") {
      const { id, email_addresses, public_metadata } = verifiedPayload.data;

      await User.create({
        clerkUserId: id,
        email: email_addresses[0].email_address,
        role: public_metadata.role || "student",
      });

      console.log(`User ${id} created in database`);
    }

    res.status(200).end();
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(400).json({ error: "Invalid webhook" });
  }
});

module.exports = router;
