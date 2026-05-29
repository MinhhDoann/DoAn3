import express from 'express';
import { getStats } from '../controllers/dashboardController';

const router = express.Router();

router.get('/stats', getStats);

export default router;
