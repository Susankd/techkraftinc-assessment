import { Router } from 'express';
import { getTickets } from '../controllers/ticket.controller';

const router = Router();

router.get('/', getTickets);

export default router;
