"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { QRCodeSVG } from "qrcode.react";
import {
  Trash2,
  CheckCircle2,
  Phone,
  MonitorSmartphone,
  User,
  Receipt,
  IndianRupee,
} from "lucide-react";
import type { CartItem, PaymentMethod } from "./types";
import { models } from "../../wailsjs/go/models";

interface CheckoutPanelProps {
  cartItems: CartItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string;
  upiString: string;
  onToggleOption: (itemId: string, optionId: string) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onExactQuantityChange: (itemId: string, value: string) => void;
  onQuantityBlur: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
  onSetPaymentMethod: (method: PaymentMethod) => void;
  onSetCustomerName: (name: string) => void;
  onSetCustomerPhone: (phone: string) => void;
  onCompleteTransaction: () => void;
}

export default function CheckoutPanel({
  cartItems,
  totalAmount,
  paymentMethod,
  customerName,
  customerPhone,
  upiString,
  onToggleOption,
  onUpdateQuantity,
  onExactQuantityChange,
  onQuantityBlur,
  onRemoveItem,
  onSetPaymentMethod,
  onSetCustomerName,
  onSetCustomerPhone,
  onCompleteTransaction,
}: CheckoutPanelProps) {
  return (
    <div className="lg:col-span-4 lg:sticky lg:top-8">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl p-6 relative overflow-hidden"
      >
        {/* Shimmer effect inside card */}
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
          <Receipt className="h-5 w-5 text-gray-400" />
          <h2 className="text-xl font-semibold text-white tracking-tight">Current Order</h2>
        </div>

        {cartItems.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-gray-500 space-y-3">
            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <MonitorSmartphone className="h-5 w-5 opacity-50" />
            </div>
            <p className="text-sm font-medium tracking-wide">Empty Cart</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Scrollable Cart Items */}
            <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-4 pb-2 border-b border-white/5 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.2 }}
                    className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-3"
                  >
                    {/* Header & Removal */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-md font-bold text-white">{item.job.title}</h3>
                        <p className="text-gray-400 text-xs mt-0.5">
                          Base Rate: ₹{item.job.basePrice.toFixed(2)}
                        </p>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => onRemoveItem(item.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1 select-none"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>

                    {/* Modifiers */}
                    {item.job.options.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        {item.job.options.map((opt: models.JobOption) => (
                          <div key={opt.id} className="flex items-center space-x-3 group">
                            <Checkbox
                              id={`${item.id}-${opt.id}`}
                              checked={!!item.options[opt.id]}
                              onCheckedChange={() => onToggleOption(item.id, opt.id)}
                              className="h-4 w-4 border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded bg-white/5"
                            />
                            <label
                              htmlFor={`${item.id}-${opt.id}`}
                              className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors cursor-pointer flex-1 select-none"
                            >
                              {opt.name}
                            </label>
                            <span className="text-xs font-mono text-gray-400">
                              +₹{opt.additionalCost.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quantity Control within Item */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
                      <label className="text-xs font-medium text-gray-400">Qty / Multiplier</label>
                      <div className="flex items-center space-x-2 bg-black/60 rounded-md p-0.5 border border-white/5">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          className="h-6 w-6 rounded flex items-center justify-center text-gray-300 hover:bg-white/10 transition-colors bg-white/5 select-none"
                          onClick={() => onUpdateQuantity(item.id, -1)}
                        >
                          -
                        </motion.button>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={3}
                          className="font-mono text-sm font-medium w-8 text-center text-white bg-transparent outline-none focus:bg-white/10 rounded transition-colors cursor-text"
                          value={item.quantity === 0 ? "" : item.quantity}
                          onChange={(e) => onExactQuantityChange(item.id, e.target.value)}
                          onBlur={() => onQuantityBlur(item.id)}
                        />
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          className="h-6 w-6 rounded flex items-center justify-center text-gray-300 hover:bg-white/10 transition-colors bg-white/5 select-none"
                          onClick={() => onUpdateQuantity(item.id, 1)}
                        >
                          +
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Metadata Form */}
            <div className="space-y-4 pt-2">
              {/* Payment Toggle */}
              <div className="space-y-2">
                <div className="flex p-1 bg-black/50 backdrop-blur-sm rounded-xl border border-white/10 relative">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 py-1.5 text-xs uppercase tracking-widest font-bold rounded-lg z-10 transition-colors select-none ${
                      paymentMethod === "UPI" ? "text-white" : "text-gray-400 hover:text-gray-200"
                    }`}
                    onClick={() => onSetPaymentMethod("UPI")}
                  >
                    UPI / QR
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 py-1.5 text-xs uppercase tracking-widest font-bold rounded-lg z-10 transition-colors select-none ${
                      paymentMethod === "CASH" ? "text-white" : "text-gray-400 hover:text-gray-200"
                    }`}
                    onClick={() => onSetPaymentMethod("CASH")}
                  >
                    CASH
                  </motion.button>
                  <motion.div
                    className="absolute inset-y-1 w-[calc(50%-4px)] bg-white/10 rounded-lg border border-white/5 shadow-sm pointer-events-none"
                    initial={false}
                    animate={{ left: paymentMethod === "UPI" ? "4px" : "calc(50%)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                </div>
              </div>

              {/* Customer Meta */}
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                  <input
                    type="text"
                    className="w-full bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-gray-600 transition-all outline-none"
                    value={customerName}
                    onChange={(e) => onSetCustomerName(e.target.value)}
                    placeholder="Customer Name (Opt)"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    className="w-full bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-gray-600 transition-all outline-none"
                    value={customerPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      onSetCustomerPhone(val);
                    }}
                    placeholder="Phone Number (10 digits)"
                  />
                </div>
              </div>
            </div>

            {/* Transaction Card */}
            <div className="border border-white/10 rounded-2xl bg-gradient-to-br from-gray-900 to-black p-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

              <div className="flex justify-between items-end mb-2 relative z-10">
                <div>
                  <p className="text-gray-400 text-[10px] font-semibold tracking-widest uppercase mb-1">
                    Total Due
                  </p>
                  <div className="flex items-baseline gap-1">
                    <IndianRupee className="h-4 w-4 text-gray-400" />
                    <span className="text-3xl font-bold tracking-tighter text-white">
                      {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
                {paymentMethod === "CASH" && (
                  <div className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold tracking-widest uppercase">
                    Cash Acceptable
                  </div>
                )}
              </div>

              <AnimatePresence>
                {paymentMethod === "UPI" && totalAmount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-3 bg-white rounded-xl shadow-inner flex flex-col items-center justify-center relative">
                      <QRCodeSVG value={upiString} size={140} level="H" />
                      <div className="absolute inset-0 border border-white/20 rounded-xl pointer-events-none" />
                    </div>
                    <p className="text-center text-[10px] uppercase tracking-widest text-gray-500 mt-3 font-semibold">
                      Scan with any UPI App
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              className="w-full h-12 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed select-none"
              onClick={onCompleteTransaction}
              disabled={totalAmount === 0 || (customerPhone.length > 0 && customerPhone.length !== 10)}
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete Checkout
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
