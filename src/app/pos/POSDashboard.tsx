"use client";

import { useState } from "react";
import { JobTemplate, JobOption } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { MonitorSmartphone, Printer, Receipt, CheckCircle2, User, Phone, IndianRupee } from "lucide-react";

interface POSDashboardProps {
    templates: (JobTemplate & { options: JobOption[] })[];
    memberId: string;
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

export default function POSDashboard({ templates, memberId }: POSDashboardProps) {
    const [selectedJob, setSelectedJob] = useState<(JobTemplate & { options: JobOption[] }) | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CASH">("UPI");

    const handleSelectJob = (job: JobTemplate & { options: JobOption[] }) => {
        setSelectedJob(job);
        setSelectedOptions({});
        setQuantity(1);
    };

    const handleToggleOption = (optionId: string) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [optionId]: !prev[optionId],
        }));
    };

    const calculateTotal = () => {
        if (!selectedJob) return 0;
        let total = selectedJob.basePrice;
        selectedJob.options.forEach((opt: JobOption) => {
            if (selectedOptions[opt.id]) {
                total += opt.additionalCost;
            }
        });
        return total * quantity;
    };

    const totalAmount = calculateTotal();
    const adminUpi = process.env.NEXT_PUBLIC_ADMIN_UPI || "8447436163@ybl";
    const upiString = `upi://pay?pa=${adminUpi}&am=${totalAmount}&pn=CyberTrack&cu=INR`;

    async function handleCompleteTransaction() {
        if (!selectedJob || totalAmount === 0) return;

        // Optimistic UX feedback
        const loadingToast = toast.loading("Processing transaction...");

        try {
            const res = await fetch("/api/transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobId: selectedJob.id,
                    jobTitle: quantity > 1 ? `${selectedJob.title} (x${quantity}) [${paymentMethod}]` : `${selectedJob.title} [${paymentMethod}]`,
                    memberId,
                    totalAmount,
                    customerName,
                    customerPhone,
                }),
            });

            if (res.ok) {
                setSelectedJob(null);
                setSelectedOptions({});
                setCustomerName("");
                setCustomerPhone("");
                setPaymentMethod("UPI");
                toast.success("Transaction Complete", {
                    id: loadingToast,
                    description: `${quantity}x ${selectedJob.title} for ₹${totalAmount.toFixed(2)} recorded.`,
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
        <div className="min-h-screen bg-[#050505] text-gray-100 font-sans tracking-tight selection:bg-blue-500/30">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/10 blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

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
                        className="grid grid-cols-2 md:grid-cols-3 gap-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {templates.map((job) => {
                            const isSelected = selectedJob?.id === job.id;
                            return (
                                <motion.div key={job.id} variants={itemVariants} whileTap={{ scale: 0.96 }}>
                                    <div
                                        onClick={() => handleSelectJob(job)}
                                        className={`relative group cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 h-full
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

                        {!selectedJob ? (
                            <div className="h-48 flex flex-col items-center justify-center text-gray-500 space-y-3">
                                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <MonitorSmartphone className="h-5 w-5 opacity-50" />
                                </div>
                                <p className="text-sm font-medium tracking-wide">Awaiting Selection</p>
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                <motion.div
                                    key={selectedJob.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="space-y-6"
                                >
                                    {/* Line Item */}
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{selectedJob.title}</h3>
                                        <p className="text-gray-400 text-sm">Base Rate: ₹{selectedJob.basePrice.toFixed(2)}</p>
                                    </div>

                                    {/* Modifiers */}
                                    {selectedJob.options.length > 0 && (
                                        <div className="space-y-3 pt-4 border-t border-white/10">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Modifiers</h4>
                                            {selectedJob.options.map((opt) => (
                                                <div key={opt.id} className="flex items-center space-x-3 group">
                                                    <Checkbox
                                                        id={opt.id}
                                                        checked={!!selectedOptions[opt.id]}
                                                        onCheckedChange={() => handleToggleOption(opt.id)}
                                                        className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                    />
                                                    <label
                                                        htmlFor={opt.id}
                                                        className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors cursor-pointer flex-1"
                                                    >
                                                        {opt.name}
                                                    </label>
                                                    <span className="text-sm font-mono text-gray-400">+₹{opt.additionalCost.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Quantity & Toggles */}
                                    <div className="pt-4 border-t border-white/10 space-y-5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-gray-400">Multiplier</label>
                                            <div className="flex items-center space-x-2 bg-black/40 rounded-lg p-1 border border-white/5">
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    className="h-8 w-8 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 transition-colors"
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                >
                                                    -
                                                </motion.button>
                                                <span className="font-mono font-medium w-8 text-center text-white">{quantity}</span>
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    className="h-8 w-8 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-300 transition-colors"
                                                    onClick={() => setQuantity(quantity + 1)}
                                                >
                                                    +
                                                </motion.button>
                                            </div>
                                        </div>

                                        {/* Payment Toggle (Apple Wallet Style Segment) */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Payment Form</label>
                                            <div className="flex p-1 bg-black/50 backdrop-blur-sm rounded-xl border border-white/10 relative">
                                                <motion.button
                                                    whileTap={{ scale: 0.98 }}
                                                    className={`flex-1 py-2 text-sm font-medium rounded-lg z-10 transition-colors ${paymentMethod === "UPI" ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
                                                    onClick={() => setPaymentMethod("UPI")}
                                                >
                                                    UPI / QR
                                                </motion.button>
                                                <motion.button
                                                    whileTap={{ scale: 0.98 }}
                                                    className={`flex-1 py-2 text-sm font-medium rounded-lg z-10 transition-colors ${paymentMethod === "CASH" ? "text-white" : "text-gray-400 hover:text-gray-200"}`}
                                                    onClick={() => setPaymentMethod("CASH")}
                                                >
                                                    CASH
                                                </motion.button>
                                                {/* Sliding Selection Pill */}
                                                <motion.div
                                                    className="absolute inset-y-1 w-[calc(50%-4px)] bg-white/10 rounded-lg border border-white/5 shadow-sm"
                                                    initial={false}
                                                    animate={{ left: paymentMethod === "UPI" ? "4px" : "calc(50%)" }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                />
                                            </div>
                                        </div>

                                        {/* Customer Meta */}
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                <input
                                                    type="text"
                                                    className="w-full bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-gray-600 transition-all outline-none"
                                                    value={customerName}
                                                    onChange={(e) => setCustomerName(e.target.value)}
                                                    placeholder="Customer Name (Opt)"
                                                />
                                            </div>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                                <input
                                                    type="text"
                                                    className="w-full bg-black/40 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-gray-600 transition-all outline-none"
                                                    value={customerPhone}
                                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                                    placeholder="Phone Number (Opt)"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* The Apple Wallet Transaction Card */}
                                    <div className="pt-6 border-t border-white/10">
                                        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/10 p-5 shadow-2xl overflow-hidden relative">
                                            {/* Decorative shine */}
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />

                                            <div className="flex justify-between items-end mb-4 relative z-10">
                                                <div>
                                                    <p className="text-gray-400 text-xs font-semibold tracking-widest uppercase mb-1">Total Due</p>
                                                    <div className="flex items-baseline gap-1">
                                                        <IndianRupee className="h-5 w-5 text-gray-300" />
                                                        <span className="text-4xl font-bold tracking-tighter text-white">{totalAmount.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                {paymentMethod === "CASH" && (
                                                    <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold tracking-wide uppercase">
                                                        Cash Valid
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
                                                        <div className="mt-4 p-4 bg-white rounded-xl flex flex-col items-center justify-center relative shadow-inner">
                                                            <QRCodeSVG value={upiString} size={160} level="H" className="drop-shadow-sm" />
                                                            <div className="absolute inset-0 border-2 border-white/20 rounded-xl pointer-events-none" />
                                                        </div>
                                                        <p className="text-center text-xs text-gray-500 mt-3 font-medium tracking-wide">Scan with any UPI App</p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full h-14 rounded-xl text-md font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        onClick={handleCompleteTransaction}
                                        disabled={totalAmount === 0}
                                    >
                                        <CheckCircle2 className="h-5 w-5" />
                                        Complete Entry
                                    </motion.button>
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
