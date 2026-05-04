import express from 'express';
import {
    getAllDonHang,
    getDonHangById,
    createDonHang,
    updateDonHang,
    deleteDonHang
} from '../controllers/donHangController';

const router = express.Router();

router.get('/', getAllDonHang);
router.get('/:id', getDonHangById);
router.post('/', createDonHang);
router.put('/:id', updateDonHang);
router.delete('/:id', deleteDonHang);

export default router;
