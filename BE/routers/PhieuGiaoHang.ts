import express from 'express';
import {
    getAllPhieuGiaoHang,
    createPhieuGiaoHang,
    updatePhieuGiaoHang,
    deletePhieuGiaoHang
} from '../controllers/phieuGiaoHangController';

const router = express.Router();

router.get('/', getAllPhieuGiaoHang);
router.post('/', createPhieuGiaoHang);
router.put('/:id', updatePhieuGiaoHang);
router.delete('/:id', deletePhieuGiaoHang);

export default router;
