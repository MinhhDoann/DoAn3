import express from 'express';
import {
    getAllPhieuNhap,
    getPhieuNhapById,
    createPhieuNhap,
    deletePhieuNhap
} from '../controllers/phieuNhapController';

const router = express.Router();

router.get('/', getAllPhieuNhap);
router.get('/:id', getPhieuNhapById);
router.post('/', createPhieuNhap);
router.delete('/:id', deletePhieuNhap);

export default router;
