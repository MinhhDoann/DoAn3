import express from 'express';
import {
    getAllPhieuTraHang,
    getPhieuTraHangById,
    createPhieuTraHang,
    updatePhieuTraHang,
    deletePhieuTraHang
} from '../controllers/phieuTraHangController';

const router = express.Router();

router.get('/', getAllPhieuTraHang);
router.get('/:id', getPhieuTraHangById);
router.post('/', createPhieuTraHang);
router.put('/:id', updatePhieuTraHang);
router.delete('/:id', deletePhieuTraHang);

export default router;
