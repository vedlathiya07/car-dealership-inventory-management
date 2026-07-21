import express from 'express';
import {
    createVehicle,
    getVehicles,
    searchVehicles,
    updateVehicle,
    deleteVehicle
} from '../controllers/vehicleController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/search', searchVehicles);
router.post('/', createVehicle);
router.get('/', getVehicles);

router.put('/:id', updateVehicle);
router.delete('/:id', requireAdmin, deleteVehicle);

export default router;
