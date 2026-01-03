import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller';

const router = Router();

router.post('/', (req, res) => bookingController.createBooking(req, res));

export default router;
