import express from 'express';
import { createVehicle, getVehicles, searchVehicles } from '../controllers/vehicleController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/search', searchVehicles);
router.post('/', createVehicle);
router.get('/', getVehicles);

export default router;
