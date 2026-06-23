"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Printer } from "lucide-react";
import type { CompletedOrder, CartItem } from "./types";
import { models } from "../../wailsjs/go/models";

interface ReceiptModalProps {
  completedOrder: CompletedOrder;
  memberName: string;
  onClose: () => void;
}

export default function ReceiptModal({ completedOrder, memberName, onClose }: ReceiptModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:bg-white print:p-0 print:items-start"
      >
        <motion.div
          id="printable-receipt"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white text-black w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-w-full print:max-h-none print:shadow-none print:overflow-visible my-print-receipt"
        >
          {/* Receipt Header */}
          <div className="bg-gray-100 p-6 text-center border-b border-gray-200 border-dashed relative">
            <div className="absolute -bottom-3 left-0 right-0 flex justify-between px-2">
              <div className="h-6 w-6 rounded-full bg-black/80 shadow-inner" />
              <div className="h-6 w-6 rounded-full bg-black/80 shadow-inner" />
            </div>
            <h3 className="text-2xl font-black tracking-tighter text-gray-900">
              ABCD WORK PLATFORM
            </h3>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">
              Official Receipt
            </p>

            <div className="mt-4 inline-flex items-center justify-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              <CheckCircle2 className="h-4 w-4" />
              Payment Successful
            </div>
          </div>

          {/* Receipt Body (Scrollable) */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Meta Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm border-b border-gray-100 pb-4">
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Order Number
                </p>
                <p className="font-mono font-bold text-gray-900">
                  {completedOrder.transaction.transactionRef}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Date &amp; Time
                </p>
                <p className="font-medium text-gray-900">
                  {new Date(completedOrder.date).toLocaleString("en-IN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Service Provider
                </p>
                <p className="font-medium text-gray-900">{memberName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Payment Method
                </p>
                <p className="font-bold text-gray-900">{completedOrder.paymentMethod}</p>
              </div>
              {completedOrder.customerName && (
                <div className="col-span-2 pt-2 border-t border-gray-50">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                    Customer Details
                  </p>
                  <p className="font-medium text-gray-900">
                    {completedOrder.customerName}{" "}
                    {completedOrder.customerPhone
                      ? `(${completedOrder.customerPhone})`
                      : ""}
                  </p>
                </div>
              )}
            </div>

            {/* Items List */}
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
                Item Details
              </p>
              <div className="space-y-3">
                {completedOrder.items.map((item: CartItem, idx: number) => {
                  // Calculate per-item price including options
                  let perItemCost = item.job.basePrice;
                  const activeOpts = item.job.options.filter(
                    (o: models.JobOption) => item.options[o.id]
                  );
                  activeOpts.forEach(
                    (o: models.JobOption) => (perItemCost += o.additionalCost)
                  );
                  const lineTotal = perItemCost * item.quantity;

                  return (
                    <div key={idx} className="flex justify-between items-start text-sm">
                      <div className="flex-1 pr-4">
                        <p className="font-bold text-gray-900">
                          {item.quantity}x {item.job.title}
                        </p>
                        {activeOpts.length > 0 && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Includes: {activeOpts.map((o: models.JobOption) => o.name).join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="font-mono font-medium text-gray-900 shrink-0">
                        ₹{lineTotal.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total */}
            <div className="border-t-2 border-dashed border-gray-200 pt-4 flex justify-between items-center">
              <p className="text-base font-bold text-gray-900 uppercase tracking-wider">
                Total Paid
              </p>
              <p className="text-2xl font-black text-blue-600 font-mono tracking-tighter">
                ₹{completedOrder.transaction.totalAmount.toFixed(2)}
              </p>
            </div>

            {/* Footer message */}
            <p className="text-center text-xs text-gray-400 italic">
              Thank you for assigning jobs with us.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex gap-3 print:hidden">
            <button
              onClick={() => window.print()}
              className="flex-1 py-3 px-4 bg-white border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm select-none"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className="flex-[2] py-3 px-4 bg-gray-900 hover:bg-black rounded-xl text-white font-bold transition-colors shadow-lg text-sm select-none"
            >
              New Order
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
