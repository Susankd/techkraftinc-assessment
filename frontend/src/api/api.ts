import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getTickets = async () => {
    return api.get('/tickets');
};

export const bookTicket = async (ticketTypeId: string, quantity: number, userId: string) => {
    return api.post('/bookings', { ticketTypeId, quantity, userId });
};
