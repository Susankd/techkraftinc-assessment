import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import type { TicketType } from "./types";
import { getTickets, bookTicket } from "./api/api";
import { TicketCard } from "./components/TicketCard";

const generateUserId = () => "user-" + Math.random().toString(36).substr(2, 9);

function App() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId] = useState(generateUserId());

  const fetchTickets = async () => {
    try {
      const response = await getTickets();
      setTickets(response.data);
      setError(null);
    } catch {
      setError(
        "Unable to connect to the server. Please ensure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBook = async (ticketTypeId: string, quantity: number) => {
    try {
      await bookTicket(ticketTypeId, quantity, userId);
      toast.success("Your tickets have been successfully booked!", {
        duration: 4000,
        position: "top-right",
      });
      await fetchTickets();
    } catch (err: any) {
      const msg =
        err.response?.data?.error || "Booking failed. Please try again.";
      toast.error(msg, {
        duration: 4000,
        position: "top-right",
      });
    }
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(15, 23, 42, 0.95)",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "16px",
            fontSize: "14px",
            fontWeight: "500",
            backdropFilter: "blur(10px)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur bg-black/40 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-wide">
              🎟️ TechKraft Concert 2026
            </h1>
            <div className="text-xs bg-white/10 px-3 py-1.5 rounded-full font-mono">
              Session: {userId.slice(0, 8)}
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Book Your Seat Concert
          </h2>
        </section>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-6 pb-20">
          {loading && (
            <div className="flex flex-col items-center py-20">
              <div className="w-14 h-14 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="mt-4 text-sm text-white/70">
                Loading available tickets...
              </p>
            </div>
          )}

          {error && (
            <div className="max-w-md mx-auto bg-red-500/10 border border-red-400/30 rounded-xl p-6 text-center">
              <p className="font-semibold text-red-300">Connection Error</p>
              <p className="text-sm text-red-200 mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onBook={handleBook}
                />
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-6 text-center text-xs text-white/50">
          © 2026 TechKraft • Secure Ticketing Platform
        </footer>
      </div>
    </>
  );
}

export default App;
