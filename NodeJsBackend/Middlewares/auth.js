const { clerkClient } = require("@clerk/backend");
const User = require("../Models/User");

const authenticate = async (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  try {
    const sessionToken = req.headers.authorization?.split(" ")[1];
    if (!sessionToken) return res.status(401).json({ error: "Unauthorized" });

    // Verify session and check revocation status
    const { userId, sessionId } = await clerkClient.verifySessionToken(
      sessionToken
    );
    const session = await clerkClient.sessions.getSession(sessionId);

    if (session.status === "revoked") {
      return res.status(401).json({ error: "Session expired" });
    }

    req.auth = { userId };
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid session" });
  }
};

const checkRole = (roles) => async (req, res, next) => {
  try {
    const user = await User.findOne({ clerkUserId: req.auth.userId });

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { authenticate, checkRole };
