import { Request, Response } from 'express';
import { ticketService } from '../services/ticket.service';

/**
 * Controller to handle ticket requests.
 */
export const getTickets = async (req: Request, res: Response) => {
    try {
        const tickets = await ticketService.getAllTickets();
        res.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
};
