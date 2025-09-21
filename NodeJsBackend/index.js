require("dotenv").config();
const cors = require("cors");
const authRoutes = require("./Routes/authRoutes");
const { connectToDatabase } = require("./DB");
const teacherRoutes = require("./Routes/teacherRoutes");
const classRoutes = require("./Routes/classRoutes");
const studentRoutes = require("./Routes/studentRoutes");
const folderRoutes = require("./Routes/folderRoutes");
const upload = require("./Middlewares/uploadMiddleware");
const express = require("express");
const errorHandler = require("./Middlewares/errorHandler");
const openEndedRoutes = require("./Routes/openEndedRoutes");
const {
  clerkMiddleware,
  requireAuth,
  getAuth,
  clerkClient,
} = require("@clerk/express");
const User = require("./Models/User");
const Teacher = require("./Models/Teacher");
const Student = require("./Models/Student");
const webhookRoutes = require("./Routes/webhooks");
const appealRoutes = require("./Routes/appealRoutes");
const answerKeyRoutes = require("./Routes/answerKeyRoutes");
const fastapiService = require("./services/fastapiService");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
console.log(`[${new Date().toISOString()}] Server starting...`);

app.use(clerkMiddleware());
app.use("/api/webhooks", webhookRoutes);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Enable CORS for requests from http://localhost:5173
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "https://www.smartgradeai.com",
      "https://flask-backend.ashyriver-2a697dc0.westus2.azurecontainerapps.io",
      "https://node-app.ashyriver-2a697dc0.westus2.azurecontainerapps.io",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

connectToDatabase(process.env.COSMOS_DB_CONNECTION_STRING)
  .then(() => {
    console.log("Connected to Azure Cosmos DB");
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err);
  });

// Use teacher routes
app.use("/api", teacherRoutes);

// Use class routes
app.use("/api", classRoutes);

// Use student routes
app.use("/api", studentRoutes);

app.use("/api/folders", folderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/appeals", appealRoutes);
app.use("/api/answer-keys", answerKeyRoutes);
// Use the open-ended routes
app.use("/api/open-ended", openEndedRoutes);

app.get("/api/users/me", requireAuth(), async (req, res) => {
  try {
    console.log(`[${req.auth.userId}] Fetching user role`);
    const { userId } = getAuth(req);
    console.log(`[${userId}] Fetching user from database`);
    let dbUser = await User.findOne({ clerkUserId: userId });
    console.log(`[${userId}] User found in database:`, dbUser);

    // Create user if not found
    if (!dbUser) {
      console.log(
        `[${userId}] User not found in database. Creating a new user.`
      );
      const clerkUser = await clerkClient.users.getUser(userId);
      console.log(`[${userId}] User creating in database:`, clerkUser);
      const firstName = clerkUser.firstName;
      const lastName = clerkUser.lastName;
      // console.log(`[${firstName} ${lastName}] Clerk user found:`, clerkUser);
      const clerkRole = clerkUser.unsafeMetadata.role;
      // console.log(`[${userId}] Clerk user found:`, clerkUser);
      // console.log(`[${userId}] Clerk user found:`, clerkUser.role);
      console.log(`[${userId}] Clerk user role:`, clerkRole);
      dbUser = await User.create({
        clerkUserId: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        role: clerkRole,
      });
      console.log(`[${userId}] User created in database:`, dbUser);
      if (clerkRole === "teacher") {
        await Teacher.create({
          clerkUserId: userId,
          firstName: firstName,
          lastName: lastName,
          role: clerkRole,
          email: clerkUser.emailAddresses[0].emailAddress,
          classes: [],
        });
      } else if (clerkRole === "student") {
        await Student.create({
          clerkUserId: userId,
          role: clerkRole,
          firstName: firstName,
          lastName: lastName,
          email: clerkUser.emailAddresses[0].emailAddress,
          enrolledClasses: [],
          taskSubmissions: [],
        });
      }
    }

    res.json({ role: dbUser.role });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Error Handling
app.use(errorHandler);

// Health check endpoints
app.get("/", (req, res) => {
  res.send("Backend Running!");
});

// Health check for FastAPI integration
app.get("/api/health/fastapi", async (req, res) => {
  try {
    const healthStatus = await fastapiService.checkHealth();
    const status = await fastapiService.getStatus();
    const backendInfo = fastapiService.getBackendInfo();
    
    res.json({
      nodejs: {
        status: "healthy",
        timestamp: new Date().toISOString()
      },
      fastapi: {
        ...healthStatus,
        ...status,
        backend_info: backendInfo
      }
    });
  } catch (error) {
    res.status(500).json({
      nodejs: {
        status: "healthy",
        timestamp: new Date().toISOString()
      },
      fastapi: {
        status: "error",
        error: error.message
      }
    });
  }
});

// Detailed health check
app.get("/api/health/detailed", async (req, res) => {
  try {
    const fastapiHealth = await fastapiService.checkHealth();
    const fastapiStatus = await fastapiService.getStatus();
    const backendInfo = fastapiService.getBackendInfo();
    
    res.json({
      services: {
        nodejs: {
          status: "healthy",
          port: PORT,
          environment: process.env.NODE_ENV || "development"
        },
        fastapi: {
          ...fastapiHealth,
          ...fastapiStatus,
          backend_info: backendInfo
        }
      },
      database: {
        status: "connected", // Assuming connection is working if we reach this point
        type: "MongoDB/Cosmos DB"
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: "Health check failed",
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
