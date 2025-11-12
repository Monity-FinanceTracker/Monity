const express = require("express");
const router = express.Router();

module.exports = (controllers, middleware) => {
  // Health check endpoint - no authentication required
  router.get("/", async (req, res) => {
    try {
      // Check database connectivity
      const { supabase } = require("../config/supabase");
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .limit(1);

      const dbStatus = error ? "disconnected" : "connected";

      res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbStatus,
        environment: process.env.NODE_ENV || "development",
      });
    } catch (error) {
      res.status(503).json({
        status: "error",
        timestamp: new Date().toISOString(),
        message: "Service unavailable",
      });
    }
  });

  return router;
};
