import prisma from "../config/database";
import type { Booking } from "@prisma/client";

/**
 * Service to handle booking operations.
 */
export class BookingService {
  /**
   * Creates a new booking with optimistic concurrency control.
   * It ensures that a booking is only created if sufficient stock is available.
   */
  async createBooking(
    ticketTypeId: string,
    userId: string,
    quantity: number
  ): Promise<Booking> {
    if (quantity <= 0) {
      throw new Error("Quantity must be positive");
    }

    // CRITICAL: This single operation prevents race conditions
    // The WHERE clause ensures we only update if enough tickets exist
    const updateResult = await prisma.ticketType.updateMany({
      where: {
        id: ticketTypeId,
        available: {
          gte: quantity, // Only update if available >= quantity
        },
      },
      data: {
        available: {
          decrement: quantity, // Atomically reduce available count
        },
      },
    });

    // If count is 0, either ticket doesn't exist or insufficient availability
    // This happens when another user booked the tickets first (race condition handled)
    if (updateResult.count === 0) {
      const ticket = await prisma.ticketType.findUnique({
        where: { id: ticketTypeId },
      });
      if (!ticket) {
        throw new Error("Ticket type not found");
      } else {
        throw new Error("Not enough tickets available");
      }
    }

    // Stock reserved successfully, now create the booking record
    return prisma.booking.create({
      data: {
        ticketTypeId,
        userId,
        quantity,
      },
    });
  }

  /**
   * Retrieves a ticket type by ID
   * Used for fetching ticket price before payment processing
   */
  async getTicketById(ticketTypeId: string) {
    return prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
    });
  }
}

export const bookingService = new BookingService();
