"use client";

import { useState, useEffect, useMemo } from "react";
import { JobTemplate, JobOption } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
    Plus, 
    Minus, 
    Trash2, 
    ShoppingCart, 
    CheckCircle2, 
    CreditCard, 
    Banknote, 
    Phone,
    Printer,
    MonitorSmartphone,
    User,
    Receipt,
    IndianRupee
} from "lucide-react";

interface POSDashboardProps {
    templates: (JobTemplate & { options: JobOption[] })[];
    memberId: string;
    memberName: string;
}

interface CartItem {
    id: string;
    job: JobTemplate & { options: JobOption[] };
    options: Record<string, boolean>;
    quantity: number;
}

// Framer Motion Variants for Staggered Bento Grid
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function POSDashboard({ templates, memberId, memberName }: POSDashboardProps) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CASH">("UPI");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [completedOrder, setCompletedOrder] = useState<any>(null);

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

    const handleAddJob = (job: JobTemplate & { options: JobOption[] }) => {
        setCartItems(prev => {
            const existingItemIndex = prev.findIndex(item => item.job.id === job.id);
            if (existingItemIndex >= 0) {
                // Item already in cart, just increment quantity
                const updatedItems = [...prev];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + 1
                };
                return updatedItems;
            }
            // Item not in cart, add new entry
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
        
        // Block if more than 3 digits
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

    // Memoized so it only recalculates when cart or payment method changes (O3)
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
    const adminUpi = process.env.NEXT_PUBLIC_ADMIN_UPI || "8447436163@ybl";
    const upiString = `upi://pay?pa=${adminUpi}&am=${totalAmount}&pn=ABCD%20WORK%20PLATFORM&cu=INR`;

    async function handleCompleteTransaction() {
        // Filter out any items with zero quantity
        const validItems = cartItems.filter(item => item.quantity > 0);
        if (validItems.length === 0 || totalAmount === 0) return;

        // Validate phone if provided
        if (customerPhone && customerPhone.length !== 10) return;

        const loadingToast = toast.loading("Processing transaction...");

        try {
            const res = await fetch("/api/transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // memberId is NOT sent — server reads it from the authenticated session (security)
                body: JSON.stringify({
                    jobTitle: generateJobTitleText(),
                    totalAmount,
                    customerName,
                    customerPhone,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                
                // Store order details for receipt
                setCompletedOrder({
                    transaction: data.transaction,
                    items: [...cartItems],
                    paymentMethod,
                    customerName,
                    customerPhone,
                    date: new Date().toISOString()
                });

                // Clear form
                setCartItems([]);
                setCustomerName("");
                setCustomerPhone("");
                setPaymentMethod("UPI");
                
                toast.success("Transaction Complete", {
                    id: loadingToast,
                    description: `Order ${data.transaction.transactionRef} recorded successfully.`,
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

    return (
        <>
            <div className="min-h-screen bg-[#050505] text-gray-100 font-sans tracking-tight selection:bg-blue-500/30 print:hidden">
                {/* Ambient Background Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/10 blur-[120px]" />
            </div>

            <div className="relative z-10 w-full mx-auto p-3 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">

                {/* Left Panel: Bento Grid Job Selection */}
                <div className="lg:col-span-8 space-y-6">
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                            <MonitorSmartphone className="h-6 w-6 text-blue-500" />
                            Terminal Array
                        </h2>
                        <p className="text-gray-400 mt-1">Select a service template to initiate checkout flow.</p>
                    </div>

                    <motion.div
                        className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {templates.map((job) => {
                            const isSelected = cartItems.some(item => item.job.id === job.id);
                            return (
                                <motion.div key={job.id} variants={itemVariants} whileTap={{ scale: 0.96 }}>
                                    <div
                                        onClick={() => handleAddJob(job)}
                                        className={`relative group cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 h-full select-none
                                            ${isSelected
                                                ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] backdrop-blur-md'
                                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm'
                                            }`}
                                    >
                                        <div className="p-5 flex flex-col h-full justify-between gap-4">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-lg font-semibold text-white leading-tight">{job.title}</h3>
                                                {isSelected && (
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_2px_rgba(59,130,246,0.8)]" />
                                                )}
                                            </div>

                                            <div>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-blue-500 font-medium">₹</span>
                                                    <span className={`text-3xl font-bold tracking-tighter ${isSelected ? 'text-blue-400' : 'text-gray-200'}`}>
                                                        {job.basePrice.toFixed(2)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold flex items-center gap-1">
                                                    <Printer className="h-3 w-3" /> {job.options.length} Modifiers
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>

                {/* Right Panel: The Calculator & Checkout (Glassmorphism Sidebar) */}
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
                                                        <p className="text-gray-400 text-xs mt-0.5">Base Rate: ₹{item.job.basePrice.toFixed(2)}</p>
                                                    </div>
                                                    <motion.button
                                                        whileTap={{ scale: 0.8 }}
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="text-gray-500 hover:text-red-400 transition-colors p-1 select-none"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </motion.button>
                                                </div>

                                                {/* Modifiers */}
                                                {item.job.options.length > 0 && (
                                                    <div className="space-y-2 pt-2 border-t border-white/5">
                                                        {item.job.options.map((opt) => (
                                                            <div key={opt.id} className="flex items-center space-x-3 group">
                                                                <Checkbox
                                                                    id={`${item.id}-${opt.id}`}
                                                                    checked={!!item.options[opt.id]}
                                                                    onCheckedChange={() => handleToggleOption(item.id, opt.id)}
                                                                    className="h-4 w-4 border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded bg-white/5"
                                                                />
                                                                <label
                                                                    htmlFor={`${item.id}-${opt.id}`}
                                                                    className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors cursor-pointer flex-1 select-none"
                                                                >
                                                                    {opt.name}
                                                                </label>
                                                                <span className="text-xs font-mono text-gray-400">+₹{opt.additionalCost.toFixed(2)}</span>
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
                                                            onClick={() => handleUpdateQuantity(item.id, -1)}
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
                                                            onChange={(e) => handleExactQuantityChange(item.id, e.target.value)}
                                                            onBlur={() => handleQuantityBlur(item.id)}
                                                        />
                                                        <motion.button
                                                            whileTap={{ scale: 0.9 }}
                                                            className="h-6 w-6 rounded flex items-center justify-center text-gray-300 hover:bg-white/10 transition-colors bg-white/5 select-none"
                                                            onClick={() => handleUpdateQuantity(item.id, 1)}
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
                                    {/* Payment Toggle (Apple Wallet Style Segment) */}
                                    <div className="space-y-2">
                                        <div className="flex p-1 bg-black/50 backdrop-blur-sm rounded-xl border border-white/10 relative">
                                            <motion.button
                                                whileTap={{ scale: 0.98 }}
                                                className={`flex-1 py-1.5 text-xs uppercase tracking-widest font-bold rounded-lg z-10 transition-colors select-none ${paymentMethod === "UPI" ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
                                                onClick={() => setPaymentMethod("UPI")}
                                            >
                                                UPI / QR
                                            </motion.button>
                                            <motion.button
                                                whileTap={{ scale: 0.98 }}
                                                className={`flex-1 py-1.5 text-xs uppercase tracking-widest font-bold rounded-lg z-10 transition-colors select-none ${paymentMethod === "CASH" ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
                                                onClick={() => setPaymentMethod("CASH")}
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
                                                onChange={(e) => setCustomerName(e.target.value)}
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
                                                    setCustomerPhone(val);
                                                }}
                                                placeholder="Phone Number (10 digits)"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* The Apple Wallet Transaction Card */}
                                <div className="border border-white/10 rounded-2xl bg-gradient-to-br from-gray-900 to-black p-5 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

                                    <div className="flex justify-between items-end mb-2 relative z-10">
                                        <div>
                                            <p className="text-gray-400 text-[10px] font-semibold tracking-widest uppercase mb-1">Total Due</p>
                                            <div className="flex items-baseline gap-1">
                                                <IndianRupee className="h-4 w-4 text-gray-400" />
                                                <span className="text-3xl font-bold tracking-tighter text-white">{totalAmount.toFixed(2)}</span>
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
                                                <p className="text-center text-[10px] uppercase tracking-widest text-gray-500 mt-3 font-semibold">Scan with any UPI App</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full h-12 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed select-none"
                                    onClick={handleCompleteTransaction}
                                    disabled={totalAmount === 0 || (customerPhone.length > 0 && customerPhone.length !== 10)}
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Complete Checkout
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>

        <AnimatePresence>
                {completedOrder && (
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
                                <h3 className="text-2xl font-black tracking-tighter text-gray-900">ABCD WORK PLATFORM</h3>
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">Official Receipt</p>
                                
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
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Order Number</p>
                                        <p className="font-mono font-bold text-gray-900">{completedOrder.transaction.transactionRef}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Date & Time</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(completedOrder.date).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Service Provider</p>
                                        <p className="font-medium text-gray-900">{memberName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Payment Method</p>
                                        <p className="font-bold text-gray-900">{completedOrder.paymentMethod}</p>
                                    </div>
                                    {completedOrder.customerName && (
                                        <div className="col-span-2 pt-2 border-t border-gray-50">
                                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Customer Details</p>
                                            <p className="font-medium text-gray-900">{completedOrder.customerName} {completedOrder.customerPhone ? `(${completedOrder.customerPhone})` : ''}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Items List */}
                                <div>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Item Details</p>
                                    <div className="space-y-3">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {completedOrder.items.map((item: any, idx: number) => {
                                            // Calculate per-item price including options
                                            let perItemCost = item.job.basePrice;
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            const activeOpts = item.job.options.filter((o: any) => item.options[o.id]);
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            activeOpts.forEach((o: any) => perItemCost += o.additionalCost);
                                            const lineTotal = perItemCost * item.quantity;
                                            
                                            return (
                                                <div key={idx} className="flex justify-between items-start text-sm">
                                                    <div className="flex-1 pr-4">
                                                        <p className="font-bold text-gray-900">{item.quantity}x {item.job.title}</p>
                                                        {activeOpts.length > 0 && (
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                                Includes: {activeOpts.map((o: any) => o.name).join(", ")}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="font-mono font-medium text-gray-900 shrink-0">
                                                        ₹{lineTotal.toFixed(2)}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Totals calculation isn't strictly necessary since it already matches the receipt total, but good UX */}
                                <div className="border-t-2 border-dashed border-gray-200 pt-4 flex justify-between items-center">
                                    <p className="text-base font-bold text-gray-900 uppercase tracking-wider">Total Paid</p>
                                    <p className="text-2xl font-black text-blue-600 font-mono tracking-tighter">₹{completedOrder.transaction.totalAmount.toFixed(2)}</p>
                                </div>

                                {/* Optional Footer message */}
                                <p className="text-center text-xs text-gray-400 italic">Thank you for assigning jobs with us.</p>
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
                                    onClick={() => setCompletedOrder(null)}
                                    className="flex-[2] py-3 px-4 bg-gray-900 hover:bg-black rounded-xl text-white font-bold transition-colors shadow-lg text-sm select-none"
                                >
                                    New Order
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
