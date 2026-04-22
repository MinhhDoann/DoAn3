import { Router } from 'express';
import {
    getAllDanhMuc,
    createDanhMuc,
    updateDanhMuc,
    deleteDanhMuc,
} from '../controllers/danhmucController';

const router = Router();

router.get('/', getAllDanhMuc);
router.post('/', createDanhMuc);
router.put('/:id', updateDanhMuc);
router.delete('/:id', deleteDanhMuc);

export default router;