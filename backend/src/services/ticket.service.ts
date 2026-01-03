import prisma from "../config/database";
import type { TicketType } from "@prisma/client";

/**
 * Service to handle ticket related operations.
 */
export class TicketService {
  /**
   * Retrieves all ticket types from the database.
   */
  async getAllTickets(): Promise<TicketType[]> {
    return prisma.ticketType.findMany({
      orderBy: { price: "desc" },
    });
  }

  /**
   * Retrieves a specific ticket type by ID.
   */
  async getTicketById(id: string): Promise<TicketType | null> {
    return prisma.ticketType.findUnique({ where: { id } });
  }
}

export const ticketService = new TicketService();
