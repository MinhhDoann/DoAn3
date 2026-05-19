import express from 'express';
import {
    getAllPhieuTraNCC,
    getPhieuTraNCCById,
    createPhieuTraNCC,
    updatePhieuTraNCC,
    deletePhieuTraNCC
} from '../controllers/phieuTraNCCController';

const router = express.Router();

router.get('/', getAllPhieuTraNCC);
router.get('/:id', getPhieuTraNCCById);
router.post('/', createPhieuTraNCC);
router.put('/:id', updatePhieuTraNCC);
router.delete('/:id', deletePhieuTraNCC);

export default router;
