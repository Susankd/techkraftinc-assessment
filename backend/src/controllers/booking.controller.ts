import { Request, Response } from "express";
import { bookingService } from "../services/booking.service";

/**
 * Simulates payment processing with random success/failure
 * In real time, this would call actual payment gateway APIs
 */
async function simulatePayment(
  amount: number,
  userId: string
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * 400 + 100)
  );

  const success = Math.random() > 0.05;

  if (success) {
    return {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    };
  } else {
    const errors = [
      "Insufficient funds",
      "Card declined",
      "Payment gateway timeout",
      "Invalid card details",
    ];
    return {
      success: false,
      error: errors[Math.floor(Math.random() * errors.length)],
    };
  }
}

export class BookingController {
  /**
   * Creates a new booking with simulated payment
   */
  async createBooking(req: Request, res: Response) {
    try {
      const { ticketTypeId, quantity, userId } = req.body;

      if (!ticketTypeId || !quantity || !userId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (quantity <= 0) {
        return res.status(400).json({ error: "Quantity must be positive" });
      }

      // Fetch ticket details from database to get the price
      const ticket = await bookingService.getTicketById(ticketTypeId);

      if (!ticket) {
        return res.status(404).json({ error: "Ticket type not found" });
      }

      // Calculate total amount from database price
      const amount = ticket.price * quantity;

      // STEP 1: Process Payment (Simulated)
      const paymentResult = await simulatePayment(amount, userId);

      if (!paymentResult.success) {
        return res.status(402).json({
          error: `Payment failed: ${paymentResult.error}`,
        });
      }

      console.log(
        `Payment successful! Transaction ID: ${paymentResult.transactionId}`
      );

      // STEP 2: Create Booking (only after successful payment)
      const booking = await bookingService.createBooking(
        ticketTypeId,
        userId,
        quantity
      );

      // STEP 3: Return success with booking and payment details
      res.status(201).json({
        success: true,
        booking,
        payment: {
          transactionId: paymentResult.transactionId,
          amount,
          currency: "USD",
        },
        message: "Booking confirmed! Payment processed successfully.",
      });
    } catch (error: any) {
      // Handle specific errors
      if (error.message === "Not enough tickets available") {
        return res.status(409).json({ error: error.message });
      }

      if (error.message === "Ticket type not found") {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const bookingController = new BookingController();
