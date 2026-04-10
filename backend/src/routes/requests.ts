import { Router } from 'express';
import {
  createRequest,
  getRequests,
  getRequest,
  updateRequest,
  deleteRequest,
  sendAndSaveRequest,
} from '../controllers/requestController';

const router = Router();

router.post('/', createRequest);
router.get('/', getRequests);
router.get('/:id', getRequest);
router.put('/:id', updateRequest);
router.delete('/:id', deleteRequest);
router.post('/:id/send', sendAndSaveRequest);

export default router;
