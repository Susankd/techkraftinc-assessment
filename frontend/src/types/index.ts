export interface TicketType {
    id: string;
    name: string;
    price: number;
    quantity: number;
    available: number;
}

export interface Booking {
    id: string;
    ticketTypeId: string;
    userId: string;
    quantity: number;
    createdAt: string;
}

export interface ApiError {
    error: string;
}
