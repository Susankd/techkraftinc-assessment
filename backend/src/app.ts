import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import ticketRoutes from "./routes/ticket.routes";
import bookingRoutes from "./routes/booking.routes";

const app: Express = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/tickets", ticketRoutes);
app.use("/api/bookings", bookingRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
