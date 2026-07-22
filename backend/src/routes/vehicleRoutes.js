import express from 'express';
import {
    createVehicle,
    getVehicles,
    searchVehicles,
    updateVehicle,
    deleteVehicle,
    purchaseVehicle,
    restockVehicle
} from '../controllers/vehicleController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/search', searchVehicles);
router.post('/', createVehicle);
router.get('/', getVehicles);

router.post('/:id/purchase', purchaseVehicle);
router.post('/:id/restock', requireAdmin, restockVehicle);

router.put('/:id', requireAdmin, updateVehicle);
router.delete('/:id', requireAdmin, deleteVehicle);

export default router;
