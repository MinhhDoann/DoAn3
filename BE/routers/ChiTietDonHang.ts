import express from 'express';
import { 
    getAllChiTietDonHang, 
    deleteChiTietDonHang 
} from '../controllers/chiTietDonHangController';

const router = express.Router();

router.get('/', getAllChiTietDonHang);
router.delete('/:id', deleteChiTietDonHang);

export default router;
