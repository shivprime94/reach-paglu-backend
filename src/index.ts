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
import { securityHeaders } from './middlewares/security-headers.middleware';
// Import routes
import reportRoutes from './routes/reportRoutes';
import statsRoutes from './routes/statsRoutes';
import helmet from 'helmet';

const app: Application = express();
const PORT: number = config.port as number;

// CORS middleware with better security
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Add security middleware
app.use(helmet()); // Adds various security headers
app.use(securityHeaders); // Custom security headers

// Limit body size to prevent DDOS
app.use(bodyParser.json({ limit: '100kb' }));

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
if (require.main === module) { // Only start server if this is the main module (not imported)
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app; 
