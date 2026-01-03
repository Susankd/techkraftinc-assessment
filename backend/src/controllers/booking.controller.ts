import { Request, Response } from 'express';
import { bookingService } from '../services/booking.service';

/**
 * Controller to handle booking creation requests.
 */
export const createBooking = async (req: Request, res: Response): Promise<void> => {
    const { ticketTypeId, quantity, userId } = req.body;

    if (!ticketTypeId || !quantity || !userId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    try {
        const booking = await bookingService.createBooking(ticketTypeId, userId, quantity);
        res.status(201).json(booking);
    } catch (error: any) {
        // Handle known domain errors
        if (error.message === 'Ticket type not found') {
            res.status(404).json({ error: error.message });
        } else if (error.message === 'Not enough tickets available' || error.message === 'Quantity must be positive') {
            res.status(400).json({ error: error.message });
        } else {
            console.error('Error creating booking:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
