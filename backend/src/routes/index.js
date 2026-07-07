import { Router } from 'express';
const router = Router();
import ticketRoutes from './ticketRoutes.js';
import mongoose from 'mongoose';

router.use('/tickets', ticketRoutes);

// Health check endpoint (used by Render for deployment monitoring)
router.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

  res.status(dbState === 1 ? 200 : 503).json({
    status: dbState === 1 ? 'ok' : 'degraded',
    message: 'API is running',
    database: dbStatus[dbState] || 'unknown',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

export default router;
