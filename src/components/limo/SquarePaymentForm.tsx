"use client";

import { useEffect, useState } from "react";

interface SquarePaymentFormProps {
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  customerId?: string;
  bookingId?: string;
}

declare global {
  interface Window {
    Square: any;
  }
}

export default function SquarePaymentForm({
  amount,
  onSuccess,
  onError,
  customerId,
  bookingId,
}: SquarePaymentFormProps) {
  const [payments, setPayments] = useState<any>(null);
  const [card, setCard] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!window.Square) {
      onError("Square SDK not loaded");
      return;
    }

    const initializeSquare = async () => {
      try {
        const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || "";
        const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || "";
        
        const squarePayments = window.Square.payments(appId, locationId);
        setPayments(squarePayments);

        const cardInstance = await squarePayments.card();
        await cardInstance.attach("#card-container");
        setCard(cardInstance);
      } catch (e) {
        console.error("Square initialization error:", e);
        onError("Failed to initialize payment form");
      }
    };

    initializeSquare();

    return () => {
      if (card) {
        card.destroy();
      }
    };
  }, []);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!card || isProcessing) return;

    setIsProcessing(true);
    try {
      const result = await card.tokenize();
      if (result.status === "OK") {
        const response = await fetch("/api/square/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceId: result.token,
            amount,
            idempotencyKey: crypto.randomUUID(),
            customerId,
            bookingId,
            note: `Payment for booking ${bookingId}`,
          }),
        });

        const data = await response.json();
        if (data.success) {
          onSuccess(data.payment.id);
        } else {
          onError(data.error || "Payment failed");
        }
      } else {
        onError(result.errors[0].message);
      }
    } catch (e) {
      console.error("Payment submission error:", e);
      onError("An unexpected error occurred during payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-surface-high p-6 rounded-xl ghost-border mt-8">
      <h3 className="text-xl text-primary mb-6" style={{ fontFamily: "var(--font-display)" }}>
        Secure Payment
      </h3>
      <p className="text-sm text-on-surface-variant mb-6">
        Amount due: <span className="text-lime font-bold">${amount.toFixed(2)}</span>
      </p>
      
      <form id="payment-form" onSubmit={handlePayment}>
        <div id="card-container" className="mb-6 min-h-[100px]" />
        
        <button
          type="submit"
          disabled={!card || isProcessing}
          className="w-full btn-lime py-4 text-sm uppercase tracking-wider disabled:opacity-50"
        >
          {isProcessing ? "Processing Payment..." : `Pay $${amount.toFixed(2)} Now`}
        </button>
      </form>
      
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-on-surface-variant opacity-50">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <span>SSL SECURED SQUARE TRANSACTION</span>
      </div>
    </div>
  );
}
