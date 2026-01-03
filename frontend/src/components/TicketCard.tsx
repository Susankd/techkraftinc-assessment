import React, { useState } from "react";
import { Crown, Star, Ticket } from "lucide-react";
import type { TicketType } from "../types";

interface TicketCardProps {
  ticket: TicketType;
  onBook: (ticketTypeId: string, quantity: number) => Promise<void>;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onBook }) => {
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isSoldOut = ticket.available <= 0;
  const availabilityPercent = (ticket.available / ticket.quantity) * 100;
  const isLowStock = availabilityPercent < 40 && !isSoldOut;

  const handleBook = async () => {
    if (quantity > 0 && quantity <= ticket.available) {
      setIsProcessing(true);
      try {
        await onBook(ticket.id, quantity);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const tierConfig = {
    VIP: {
      accent: "bg-amber-500",
      gradient: "from-amber-400/20 via-amber-500/10 to-transparent",
      text: "text-amber-400",
      border: "border-amber-500/30",
      icon: Crown,
      glow: "group-hover:shadow-amber-500/20",
    },
    "Front Row": {
      accent: "bg-rose-500",
      gradient: "from-rose-500/20 via-rose-500/10 to-transparent",
      text: "text-rose-400",
      border: "border-rose-500/30",
      icon: Star,
      glow: "group-hover:shadow-rose-500/20",
    },
    "General Admission": {
      accent: "bg-cyan-500",
      gradient: "from-cyan-500/20 via-cyan-500/10 to-transparent",
      text: "text-cyan-400",
      border: "border-cyan-500/30",
      icon: Ticket,
      glow: "group-hover:shadow-cyan-500/20",
    },
  };

  const config =
    tierConfig[ticket.name as keyof typeof tierConfig] ||
    tierConfig["General Admission"];

  const IconComponent = config.icon;

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`absolute -inset-0.5 rounded-3xl blur opacity-20 transition duration-500 ${
          config.accent
        } ${isHovered ? "opacity-40" : "opacity-0"}`}
      ></div>

      <div
        className={`relative h-full flex flex-col glass-panel rounded-3xl overflow-hidden transition-all duration-500 ${
          isSoldOut ? "opacity-50 grayscale" : "hover:-translate-y-2"
        }`}
      >
        {/* Header Section */}
        <div
          className={`relative p-6 border-b border-white/5 bg-gradient-to-b ${config.gradient}`}
        >
          <div className="flex justify-between items-start mb-4">
            <div
              className={`p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 ${config.text}`}
            >
              <IconComponent className="w-6 h-6" />
            </div>
            {isLowStock && (
              <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                LOW STOCK
              </span>
            )}
            {isSoldOut && (
              <span className="px-3 py-1 bg-slate-700 text-slate-300 text-xs font-bold rounded-full">
                SOLD OUT
              </span>
            )}
          </div>

          <h3 className="text-2xl font-bold text-white tracking-tight mb-1">
            {ticket.name}
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white tracking-tight">
              ${ticket.price}
            </span>
            <span className="text-white/40 text-sm font-medium">/ person</span>
          </div>
        </div>

        {/* Body Section */}
        <div className="p-6 flex-1 flex flex-col gap-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                Capacity
              </p>
              <p className="text-lg font-medium text-white/90">
                {ticket.quantity}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                Remaining
              </p>
              <p
                className={`text-lg font-medium ${
                  isSoldOut ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {ticket.available}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ease-out rounded-full ${config.accent}`}
                style={{ width: `${availabilityPercent}%` }}
              />
            </div>
          </div>

          {/* Booking Controls */}
          <div className="mt-auto space-y-4 pt-4 border-t border-white/5">
            {!isSoldOut && (
              <div className="flex items-center justify-between gap-4 bg-black/20 rounded-xl p-1 border border-white/10">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isProcessing}
                  className="w-10 h-10 flex items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="font-mono text-lg font-bold text-white w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(ticket.available, quantity + 1))
                  }
                  disabled={isProcessing}
                  className="w-10 h-10 flex items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            )}

            <button
              onClick={handleBook}
              disabled={isSoldOut || isProcessing}
              className={`
                                relative w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 overflow-hidden
                                ${
                                  isSoldOut
                                    ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                                    : `bg-white text-black hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/5 cursor-pointer`
                                }
                            `}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing
                </span>
              ) : isSoldOut ? (
                "Sold Out"
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Book Now • ${ticket.price * quantity}
                </span>
              )}

              {!isSoldOut && !isProcessing && (
                <div className="shimmer-effect"></div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
