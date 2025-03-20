// Initialize Redis (importing the service will initialize the connection)
import './services/redis.service';

import express, { Application } from 'express';

import bodyParser from 'body-parser';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import cors from 'cors';
import evidenceRoutes from './routes/evidenceRoutes';
import healthRoutes from './routes/healthRoutes';
import migrationRoutes from './routes/migrationRoutes';
import { rateLimitConfig } from './config/rateLimit.config';
import { rateLimiter } from './middlewares/rateLimiter.middleware';
// Import routes
import reportRoutes from './routes/reportRoutes';
import statsRoutes from './routes/statsRoutes';

const app: Application = express();
const PORT: number = config.port as number;

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(bodyParser.json());

// Global rate limiter applied to all routes as a fallback
app.use(rateLimiter(rateLimitConfig.default));

// Connect to database
connectDatabase();

// Routes
app.use(healthRoutes);
app.use(reportRoutes);
app.use(evidenceRoutes);
app.use(statsRoutes);
app.use(migrationRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 