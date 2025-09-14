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
  const app = express(); // --- Middleware antes das rotas ---

  app.use(helmet()); // Configuração do CORS para produção e desenvolvimento

  const corsOptions = {
    origin: function (origin, callback) {
      // Permite requisições sem origem (aplicativos móveis, etc.)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:5173", // Desenvolvimento local
        "http://localhost:3000", // Porta local alternativa
        "https://firstmonity.vercel.app", // Frontend de produção
        process.env.CLIENT_URL, // Variável de ambiente
      ].filter(Boolean); // Remove valores indefinidos

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn("CORS bloqueou a requisição da origem:", origin);
        callback(new Error("Não permitido pelo CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  }; // O manipulador do webhook deve vir ANTES do express.json()

  const controllers = initializeControllers(supabaseClient || supabase); // Define explicitamente a rota do webhook do Stripe aqui // O caminho da rota e o manipulador são combinados em uma única unidade. // Esta é a maneira mais confiável de lidar com webhooks.
  app.post(
    "/api/v1/webhook/stripe",
    express.raw({ type: "application/json" }),
    controllers.billingController.handleWebhook
  );

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morganMiddleware); // --- Inicialização ---

  const middleware = initializeMiddleware(supabaseClient || supabase); // --- Rotas da API ---

  app.use("/api/v1", initializeRoutes(controllers, middleware)); // --- Middleware depois das rotas ---

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
