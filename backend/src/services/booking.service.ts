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

    const updateResult = await prisma.ticketType.updateMany({
      where: {
        id: ticketTypeId,
        available: {
          gte: quantity,
        },
      },
      data: {
        available: {
          decrement: quantity,
        },
      },
    });

    // If count is 0, it means either the ticket ID is wrong or availability was insufficient.
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

    // Stock reserved successfully, now create the booking record.
    return prisma.booking.create({
      data: {
        ticketTypeId,
        userId,
        quantity,
      },
    });
  }
}

export const bookingService = new BookingService();
