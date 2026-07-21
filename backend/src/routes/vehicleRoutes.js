import express from 'express';
import { createVehicle, getVehicles } from '../controllers/vehicleController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', createVehicle);
router.get('/', getVehicles);

export default router;
