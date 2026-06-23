"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { CreateTransaction } from "../../wailsjs/go/main/App";

import type { JobWithOptions, CartItem, CompletedOrder, PaymentMethod, JobOption } from "./types";
import JobGrid from "./JobGrid";
import CheckoutPanel from "./CheckoutPanel";
import ReceiptModal from "./ReceiptModal";

interface POSDashboardProps {
    templates: JobWithOptions[];
    memberId: string;
    memberName: string;
    adminUpiId?: string;
}

export default function POSDashboard({ templates, memberId, memberName, adminUpiId }: POSDashboardProps) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
    const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);

    // Load cart from local storage on mount, discarding any items whose
    // job template no longer exists (template was deleted/deactivated remotely).
    useEffect(() => {
        setIsMounted(true);
        const savedCart = localStorage.getItem(`pos_cart_${memberId}`);
        if (savedCart) {
            try {
                const parsed: CartItem[] = JSON.parse(savedCart);
                const validTemplateIds = new Set(templates.map((t) => t.id));
                const filtered = parsed.filter((item) => validTemplateIds.has(item.job.id));
                setCartItems(filtered);
            } catch (e) {
                console.error("Failed to parse cart from local storage", e);
                localStorage.removeItem(`pos_cart_${memberId}`);
            }
        }
    }, [memberId, templates]);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem(`pos_cart_${memberId}`, JSON.stringify(cartItems));
        }
    }, [cartItems, isMounted, memberId]);

    // ── Cart Operations ──────────────────────────────────────────────────────

    const handleAddJob = (job: JobWithOptions) => {
        setCartItems(prev => {
            const existingItemIndex = prev.findIndex(item => item.job.id === job.id);
            if (existingItemIndex >= 0) {
                const updatedItems = [...prev];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + 1
                };
                return updatedItems;
            }
            const newItem: CartItem = {
                id: Math.random().toString(36).substring(2, 9),
                job,
                options: {},
                quantity: 1
            };
            return [...prev, newItem];
        });
    };

    const handleToggleOption = (itemId: string, optionId: string) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === itemId) {
                return { ...item, options: { ...item.options, [optionId]: !item.options[optionId] } };
            }
            return item;
        }));
    };

    const handleUpdateQuantity = (itemId: string, delta: number) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === itemId) {
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
        }));
    };

    const handleExactQuantityChange = (itemId: string, value: string) => {
        if (value === "") {
            setCartItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: 0 } : item));
            return;
        }
        if (value.length > 3) return;
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 999) {
            setCartItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: parsed } : item));
        }
    };

    const handleQuantityBlur = (itemId: string) => {
        setCartItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: Math.max(1, item.quantity) } : item));
    };

    const handleRemoveItem = (itemId: string) => {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
    };

    // ── Computed Values ──────────────────────────────────────────────────────

    const totalAmount = useMemo(() => {
        return cartItems.reduce((acc, item) => {
            let itemTotal = item.job.basePrice;
            item.job.options.forEach((opt: JobOption) => {
                if (item.options[opt.id]) itemTotal += opt.additionalCost;
            });
            return acc + itemTotal * item.quantity;
        }, 0);
    }, [cartItems]);

    const generateJobTitleText = () => {
        const itemsText = cartItems.map(item => {
            const opts = item.job.options.filter(o => item.options[o.id]).map(o => o.name);
            const optString = opts.length > 0 ? ` (${opts.join(", ")})` : "";
            return `${item.quantity}x ${item.job.title}${optString}`;
        }).join(" + ");
        return `${itemsText} [${paymentMethod}]`;
    };

    const effectiveUpiId = (adminUpiId || process.env.NEXT_PUBLIC_ADMIN_UPI || "8447436163@ybl").trim();
    const upiString = `upi://pay?pa=${effectiveUpiId}&am=${totalAmount}&pn=ABCD%20WORK%20PLATFORM&cu=INR`;

    // ── Transaction Completion ────────────────────────────────────────────────

    async function handleCompleteTransaction() {
        const validItems = cartItems.filter(item => item.quantity > 0);
        if (validItems.length === 0 || totalAmount === 0) return;
        if (customerPhone && customerPhone.length !== 10) return;

        const loadingToast = toast.loading("Processing transaction...");

        try {
            const data = await CreateTransaction({
                jobTitle: generateJobTitleText(),
                totalAmount,
                customerName,
                customerPhone,
                memberId: memberId,
            });

            if (data && data.transactionRef) {

                setCompletedOrder({
                    transaction: data,
                    items: [...cartItems],
                    paymentMethod,
                    customerName,
                    customerPhone,
                    date: new Date().toISOString()
                });

                setCartItems([]);
                setCustomerName("");
                setCustomerPhone("");
                setPaymentMethod("UPI");

                toast.success("Transaction Complete", {
                    id: loadingToast,
                    description: `Order ${data.transactionRef} recorded successfully.`,
                    icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                });
            } else {
                throw new Error("Server rejected transaction");
            }
        } catch (e) {
            console.error(e);
            toast.error("Transaction Failed", {
                id: loadingToast,
                description: "Could not record payment to database. Please retry.",
            });
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            <div className="min-h-screen bg-[#050505] text-gray-100 font-sans tracking-tight selection:bg-blue-500/30 print:hidden">
                {/* Ambient Background Glow */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/10 blur-[120px]" />
                </div>

                <div className="relative z-10 w-full mx-auto p-3 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">
                    <JobGrid
                        templates={templates}
                        cartItems={cartItems}
                        onAddJob={handleAddJob}
                    />

                    <CheckoutPanel
                        cartItems={cartItems}
                        totalAmount={totalAmount}
                        paymentMethod={paymentMethod}
                        customerName={customerName}
                        customerPhone={customerPhone}
                        upiString={upiString}
                        onToggleOption={handleToggleOption}
                        onUpdateQuantity={handleUpdateQuantity}
                        onExactQuantityChange={handleExactQuantityChange}
                        onQuantityBlur={handleQuantityBlur}
                        onRemoveItem={handleRemoveItem}
                        onSetPaymentMethod={setPaymentMethod}
                        onSetCustomerName={setCustomerName}
                        onSetCustomerPhone={setCustomerPhone}
                        onCompleteTransaction={handleCompleteTransaction}
                    />
                </div>
            </div>

            <AnimatePresence>
                {completedOrder && (
                    <ReceiptModal
                        completedOrder={completedOrder}
                        memberName={memberName}
                        onClose={() => setCompletedOrder(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
