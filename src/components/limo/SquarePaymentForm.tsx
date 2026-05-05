"use client";

import { useEffect, useId, useRef, useState } from "react";
import { formatCurrency } from "@/lib/limo";

interface SquareCardTokenResult {
  status: string;
  token?: string;
  errors?: Array<{ message?: string }>;
}

interface SquareCard {
  attach: (selector: string) => Promise<void>;
  destroy: () => Promise<boolean>;
  tokenize: () => Promise<SquareCardTokenResult>;
}

interface SquarePayments {
  card: () => Promise<SquareCard>;
}

interface SquareGlobal {
  payments: (appId: string, locationId: string) => SquarePayments;
}

declare global {
  interface Window {
    Square?: SquareGlobal;
  }
}

interface SquarePaymentFormProps {
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  customerId?: string;
  bookingId: string;
  idempotencyKey: string;
}

export default function SquarePaymentForm({
  amount,
  onSuccess,
  onError,
  customerId,
  bookingId,
  idempotencyKey,
}: SquarePaymentFormProps) {
  const containerId = useId().replace(/:/g, "");
  const cardRef = useRef<SquareCard | null>(null);
  const initializedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const initializeSquare = async () => {
      if (initializedRef.current) {
        return;
      }

      const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || "";
      const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || "";
      if (!appId || !locationId) {
        onError("Square is not configured. Add the public application and location IDs.");
        return;
      }

      const square = window.Square;
      if (!square) {
        onError("Square payment form is still loading. Please wait a moment and try again.");
        return;
      }

      try {
        initializedRef.current = true;
        const payments = square.payments(appId, locationId);
        const card = await payments.card();
        await card.attach(`#${containerId}`);

        if (cancelled) {
          await card.destroy();
          return;
        }

        cardRef.current = card;
        setIsReady(true);
        setStatusMessage("Secure card field is ready.");
      } catch (error) {
        initializedRef.current = false;
        const message = error instanceof Error ? error.message : "Failed to initialize the Square payment form.";
        onError(message);
      }
    };

    const timer = window.setTimeout(() => {
      void initializeSquare();
    }, 50);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      setIsReady(false);
      initializedRef.current = false;
      const card = cardRef.current;
      cardRef.current = null;
      if (card) {
        void card.destroy();
      }
    };
  }, [containerId, onError]);

  const handlePayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cardRef.current || isProcessing) {
      return;
    }

    if (!bookingId) {
      onError("Create the booking before submitting payment.");
      return;
    }

    setIsProcessing(true);
    setStatusMessage("Processing payment…");
    onError("");

    try {
      const tokenResult = await cardRef.current.tokenize();
      if (tokenResult.status !== "OK" || !tokenResult.token) {
        throw new Error(tokenResult.errors?.[0]?.message || "Card details could not be tokenized.");
      }

      const response = await fetch("/api/square/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: tokenResult.token,
          idempotencyKey,
          customerId,
          bookingId,
          note: `Payment for booking ${bookingId}`,
        }),
      });

      const data = (await response.json()) as { success?: boolean; payment?: { id?: string }; error?: string };
      if (!response.ok || !data.success || !data.payment?.id) {
        throw new Error(data.error || "Payment failed.");
      }

      setStatusMessage("Payment processed successfully.");
      onSuccess(data.payment.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected payment error occurred.";
      setStatusMessage("");
      onError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-8 rounded-xl bg-surface-high p-6 ghost-border">
      <h3 className="mb-6 text-xl text-primary" style={{ fontFamily: "var(--font-display)" }}>
        Secure Payment
      </h3>
      <p className="mb-6 text-sm text-on-surface-variant">
        Amount due: <span className="font-bold text-lime">{formatCurrency(amount)}</span>
      </p>

      <form id="payment-form" onSubmit={handlePayment}>
        <div id={containerId} className="mb-6 min-h-[120px] rounded-lg border border-outline bg-surface-mid p-3" />

        <button
          type="submit"
          disabled={!isReady || isProcessing}
          className="btn-lime w-full py-4 text-sm uppercase tracking-wider disabled:opacity-50"
        >
          {isProcessing ? "Processing Payment…" : `Pay ${formatCurrency(amount)} Now`}
        </button>
      </form>

      <p aria-live="polite" className="mt-4 min-h-5 text-xs text-on-surface-variant">
        {statusMessage}
      </p>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-on-surface-variant opacity-70">
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <span>Square-hosted card entry keeps your site out of raw card-data scope.</span>
      </div>
    </div>
  );
}
