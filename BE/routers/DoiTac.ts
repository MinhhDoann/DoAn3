import { Router } from 'express';
import {
    getAllDoiTac,
    createDoiTac,
    updateDoiTac,
    deleteDoiTac,
} from '../controllers/doiTacController';

const router = Router();

router.get('/', getAllDoiTac);
router.post('/', createDoiTac);
router.put('/:id', updateDoiTac);
router.delete('/:id', deleteDoiTac);

export default router;
