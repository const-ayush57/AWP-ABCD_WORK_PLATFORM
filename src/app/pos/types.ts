// ──────────────────────────────────────────────────────────────────────────────
// Shared types for the POS subsystem.
// Single source of truth for all POS component props and data structures.
// ──────────────────────────────────────────────────────────────────────────────

export interface JobOption {
  id: string;
  name: string;
  additionalCost: number;
  jobTemplateId: string;
}

export interface JobTemplate {
  id: string;
  title: string;
  basePrice: number;
  category?: string | null;
  isActive: boolean;
  createdAt: Date;
}

/** A job template with its options eagerly loaded. */
export type JobWithOptions = JobTemplate & { options: JobOption[] };

/** A single item in the shopping cart. */
export interface CartItem {
  id: string;
  job: JobWithOptions;
  options: Record<string, boolean>;
  quantity: number;
}

/** Data stored after a successful transaction completes. */
export interface CompletedOrder {
  transaction: {
    id: string;
    transactionRef: string;
    totalAmount: number;
    jobTitle: string;
    status: string;
  };
  items: CartItem[];
  paymentMethod: "UPI" | "CASH";
  customerName: string;
  customerPhone: string;
  date: string;
}

/** Payment method options. */
export type PaymentMethod = "UPI" | "CASH";
