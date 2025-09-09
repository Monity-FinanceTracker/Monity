require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { logger, morganMiddleware } = require("./utils/logger");
const { supabase } = require("./config/supabase");
const BillingController = require("./controllers/billingController");

const initializeControllers = require("./controllers");
const initializeRoutes = require("./routes");
const initializeMiddleware = require("./middleware");

const { errorHandler } = require("./middleware/errorHandler");

const createServer = (supabaseClient) => {
  const app = express();

  // --- Pre-router Middleware ---
  app.use(helmet());

  // CORS configuration for production and development
  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:5173", // Local development
        "http://localhost:3000", // Alternative local port
        "https://firstmonity.vercel.app", // Production frontend
        process.env.CLIENT_URL, // Environment variable override
      ].filter(Boolean); // Remove undefined values

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn("CORS blocked request from origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  };

  // Webhook handler must come BEFORE express.json()
  // Initialize controllers now to access webhook handler
  const controllers = initializeControllers(supabaseClient || supabase);

  app.post(
    "/api/v1/billing/webhook",
    express.raw({ type: "application/json" }),
    controllers.billingController.handleWebhook
  );

  app.use(cors(corsOptions));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morganMiddleware);

  // --- Initialization ---
  // controllers already initialized above for webhook
  const middleware = initializeMiddleware(supabaseClient || supabase);

  // --- API Routes ---
  app.use("/api/v1", initializeRoutes(controllers, middleware));

  // --- Post-router Middleware ---
  app.use(errorHandler);

  return app;
};

const app = createServer();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(
    `CORS enabled for origins: ${
      process.env.CLIENT_URL ||
      "http://localhost:5173, https://firstmonity.vercel.app"
    }`
  );
});

module.exports = { createServer, app };
