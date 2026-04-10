import { Router } from 'express';
import { sendRequest } from '../controllers/requestController';

const router = Router();

router.post('/', sendRequest);

export default router;
