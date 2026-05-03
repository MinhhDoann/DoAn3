import { Router } from 'express';
import {
    getAllSanPham,
    createSanPham,
    updateSanPham,
    deleteSanPham,
} from '../controllers/sanPhamController';

const router = Router();

router.get('/', getAllSanPham);
router.post('/', createSanPham);
router.put('/:id', updateSanPham);
router.delete('/:id', deleteSanPham);

export default router;
