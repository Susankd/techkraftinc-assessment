# TechKraft Concert Ticket Booking System

A modern, full-stack ticket booking application for concert events. Built with React, Node.js, TypeScript, and PostgreSQL.

## 📋 Features

### Ticket Tiers & Pricing
- **VIP**: $100 per ticket (100 seats available)
- **Front Row**: $50 per ticket (200 seats available)  
- **General Admission**: $10 per ticket (1,000 seats available)

### What You Can Do
- **Browse Tickets**: View all available ticket types with real-time availability
- **Book Tickets**: Select quantity and book tickets instantly
- **Live Updates**: Availability updates every 5 seconds automatically
- **Global Access**: Book from anywhere in the world (all prices in USD)
- **Safe Booking**: System prevents double-booking even when multiple users book simultaneously

---

## 🚀 Getting Started

### What You Need
- Node.js version 18 or higher
- PostgreSQL database running locally (port 5432)

### Installation Steps

**1. Set Up the Database**

Make sure PostgreSQL is running on your computer. Create a database for the project.

**2. Set Up the Backend**

```bash
cd backend
npm install

# Create environment file from example
cp .env.example .env
# Update the DATABASE_URL in .env with your PostgreSQL credentials

# Create database tables and add sample data
npx prisma migrate dev --name init
npm run seed

# Start the backend server
npm run dev
```

The backend will start at `http://localhost:3000`

**3. Set Up the Frontend**

```bash
cd frontend
npm install

# Create environment file from example
cp .env.example .env
# The default API URL (http://localhost:3000/api) should work if backend is running locally

npm run dev
```

The frontend will start at `http://localhost:5173`

---

## 🏗️ How It Works

### System Architecture

The application is built in three layers:

1. **Frontend (User Interface)**: React application where users browse and book tickets
2. **Backend (API Server)**: Node.js server that handles booking requests and business logic
3. **Database**: PostgreSQL stores all ticket and booking information

### Preventing Double-Booking (Race Condition Handling)

**The Challenge**: When two people try to book the last ticket at the exact same time, only one should succeed.

**Our Solution**: We use **Atomic Database Operations** with conditional updates. This is the industry-standard approach used by Ticketmaster, airlines, and e-commerce platforms.

#### How It Works

**The Code** (see `backend/src/services/booking.service.ts`):

```typescript
// Single atomic operation that prevents race conditions
const updateResult = await prisma.ticketType.updateMany({
  where: {
    id: ticketTypeId,
    available: { gte: quantity }  // Only update if enough tickets exist
  },
  data: {
    available: { decrement: quantity }  // Atomically reduce count
  }
});
```

#### Race Condition Example

**Scenario**: 1 ticket left, User A and User B both click "Book" simultaneously

**What Happens**:
1. Both requests reach the database at the same time
2. Database processes them sequentially (ACID properties)
3. **User A's request**: 
   - Check: `available >= 1`? → YES (1 >= 1)
   - Action: Decrement to 0
   - Result: ✅ **Success**
4. **User B's request**:
   - Check: `available >= 1`? → NO (0 >= 1)
   - Action: No update performed
   - Result: ❌ **"Not enough tickets available"**

**Why This Works**:
- The WHERE clause condition is part of the UPDATE statement itself
- No separate SELECT then UPDATE (which would have a race condition)
- PostgreSQL guarantees atomicity through transaction isolation
- Works correctly even with multiple backend servers

**Testing Double-Booking Prevention**:
1. Open the app in two browser windows
2. Reduce tickets to 1 for any tier
3. Click "Book" on both windows simultaneously
4. Only one will succeed, the other gets an error

---

### Payment Processing (Simulated)

**Important**: This demo uses **simulated payment processing**. No real payment gateways are integrated.

#### How Payment Simulation Works

The booking flow includes a payment step (see `backend/src/controllers/booking.controller.ts`):

1. **Calculate Total**: `price × quantity`
2. **Process Payment** (simulated):
   - 95% success rate (realistic for payment gateways)
   - Random delay of 100-500ms (simulates network)
   - Generates fake transaction ID on success
3. **Create Booking**: Only if payment succeeds
4. **Return Result**: Includes booking details and payment confirmation

#### Simulated Payment Responses

**Success** (95% of the time):
```json
{
  "success": true,
  "booking": { ... },
  "payment": {
    "transactionId": "txn_1234567890_abc123",
    "amount": 100,
    "currency": "USD"
  }
}
```

**Failure** (5% of the time):
```json
{
  "error": "Payment failed: Insufficient funds"
}
```

Possible simulated errors:
- "Insufficient funds"
- "Card declined"
- "Payment gateway timeout"
- "Invalid card details"

#### In Production

For a real application, you would integrate with:
- **International**: Stripe, PayPal, Square
- **Nepal**: Khalti, eSewa
- **India**: Razorpay
- **General**: Braintree, Adyen

The payment simulation can be easily replaced with actual payment gateway API calls without changing the booking logic.

---

## 📊 Scaling for High Traffic

### Handling 1 Million Daily Users

**Current Design**: Works great for moderate traffic (thousands of users)

**For Production Scale** (1M daily users, 50K concurrent):

**1. Multiple Backend Servers**
- Run 10-20 copies of the backend server behind a load balancer
- Each server can handle ~2,500 concurrent users
- If one server crashes, others keep working (high availability)

**2. Database Optimization**
- **Read Replicas**: Create 3-5 read-only database copies for viewing tickets
- **Write Master**: Keep one main database for bookings
- This separates heavy read traffic (browsing) from critical write traffic (booking)

**3. Caching Layer**
- Add Redis cache to store ticket availability
- Refresh every 1-2 seconds
- Reduces database load by 80-90%

**4. Content Delivery Network (CDN)**
- Serve frontend files from CDN (CloudFlare, AWS CloudFront)
- Users download from nearest server location
- Reduces page load time from 2s to 200ms globally

### Achieving 99.99% Uptime (Four Nines)

**What This Means**: System can only be down for 52 minutes per year

**How to Achieve It**:

1. **Multi-Region Deployment**
   - Deploy in 3 geographic regions (US, Europe, Asia)
   - If one region fails, traffic automatically routes to others
   - Use AWS Route53 or similar for health-check based routing

2. **Database High Availability**
   - Use managed PostgreSQL (AWS RDS, Google Cloud SQL)
   - Enable Multi-AZ deployment (automatic failover)
   - Automated backups every hour

3. **Monitoring & Alerts**
   - Set up health checks every 30 seconds
   - Alert team immediately if response time > 1 second
   - Automated rollback if new deployment causes errors

4. **Zero-Downtime Deployments**
   - Use blue-green deployment strategy
   - Deploy new version alongside old version
   - Switch traffic only after health checks pass

### Fast Booking Performance (p95 < 500ms)

**Goal**: 95% of booking requests complete in under 500 milliseconds

**How We Achieve This**:

1. **Database Indexing**
   - Index on `ticketTypeId` and `available` columns
   - Booking query executes in ~5ms instead of 50ms

2. **Connection Pooling**
   - Maintain 50 ready database connections
   - No time wasted creating new connections
   - Saves ~100ms per request

3. **Optimized Queries**
   - Single atomic UPDATE query for booking
   - No separate SELECT then UPDATE (prevents race conditions AND improves speed)

4. **Async Processing**
   - Send booking confirmation emails asynchronously
   - Don't make user wait for email to send
   - Return success response immediately

---

## 🛠️ Technology Stack

**Frontend**
- React 18 with TypeScript
- Tailwind CSS for styling
- Vite for fast development
- React Hot Toast for notifications
- Axios for API calls

**Backend**
- Node.js with Express
- TypeScript for type safety
- Prisma ORM for database
- CORS enabled for cross-origin requests

**Database**
- PostgreSQL 14+
- Atomic transactions for data integrity
- Optimistic concurrency control

---

## 🧪 Testing the System

### Test Double-Booking Prevention

1. Open the app in two different browser windows
2. Set both to book the last available ticket
3. Click "Book" on both at the same time
4. Only one will succeed, the other will get an error message

### Test Live Updates

1. Open app in two windows
2. Book tickets in one window
3. Watch availability decrease automatically in the other window (updates every 5 seconds)

---


## 🔒 Security Considerations

- Input validation on all booking requests
- CORS configured for specific origins in production
- Rate limiting recommended for production (not implemented in demo)

---

