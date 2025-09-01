require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { logger, morganMiddleware } = require('./utils/logger');
const { supabase } = require('./config/supabase');

const initializeControllers = require('./controllers');
const initializeRoutes = require('./routes');
const initializeMiddleware = require('./middleware');

const { errorHandler } = require('./middleware/errorHandler');

const createServer = (supabaseClient) => {
    const app = express();
    
    // --- Pre-router Middleware ---
    app.use(helmet());
    app.use(cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    }));

    
    
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(morganMiddleware);
    
    // --- Initialization ---
    const controllers = initializeControllers(supabaseClient || supabase);
    const middleware = initializeMiddleware(supabaseClient || supabase);
    
    // --- API Routes ---
    app.use('/api/v1', initializeRoutes(controllers, middleware));
    
    // --- Post-router Middleware ---
    app.use(errorHandler);

    return app;
};

const app = createServer();
const PORT = process.env.PORT || 3000;

// --- Server Startup ---
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
        console.log('Encryption-key:', process.env.ENCRYPTION_KEY);
    });
}

module.exports = { createServer, app };
