import { Router } from 'express';
const router = Router();
import ticketRoutes from './ticketRoutes.js';

router.use('/tickets', ticketRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

export default router;
