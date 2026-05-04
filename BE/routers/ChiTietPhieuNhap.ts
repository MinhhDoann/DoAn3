import express from 'express';
import { 
    getAllChiTietPhieuNhap, 
    createChiTietPhieuNhap, 
    deleteChiTietPhieuNhap 
} from '../controllers/chiTietPhieuNhapController';

const router = express.Router();

router.get('/', getAllChiTietPhieuNhap);
router.post('/', createChiTietPhieuNhap);
router.delete('/:id', deleteChiTietPhieuNhap);

export default router;
