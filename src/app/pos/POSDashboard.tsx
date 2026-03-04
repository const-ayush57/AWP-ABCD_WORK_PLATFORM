"use client";

import { useState } from "react";
import { JobTemplate, JobOption } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { QRCodeSVG } from "qrcode.react";

interface POSDashboardProps {
    templates: (JobTemplate & { options: JobOption[] })[];
    memberId: string;
}

export default function POSDashboard({ templates, memberId }: POSDashboardProps) {
    const [selectedJob, setSelectedJob] = useState<(JobTemplate & { options: JobOption[] }) | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [quantity, setQuantity] = useState(1);

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

    // Define Server Action inline strictly for submission
    async function handleCompleteTransaction() {
        if (!selectedJob || totalAmount === 0) return;
        try {
            const res = await fetch("/api/transaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jobId: selectedJob.id,
                    jobTitle: quantity > 1 ? `${selectedJob.title} (x${quantity})` : selectedJob.title,
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
                alert("Transaction Recorded Successfully!");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to record transaction.");
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold">Select Service</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {templates.map((job) => (
                        <Card
                            key={job.id}
                            className={`cursor-pointer transition-all ${selectedJob?.id === job.id ? 'border-blue-600 ring-2 ring-blue-600 shadow-md' : 'hover:border-blue-300'}`}
                            onClick={() => handleSelectJob(job)}
                        >
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-lg line-clamp-2">{job.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-2xl font-bold text-blue-600">₹{job.basePrice.toFixed(2)}</p>
                                <p className="text-sm text-gray-500">{job.options.length} options available</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-1">
                <Card className="sticky top-6">
                    <CardHeader className="bg-gray-50 border-b">
                        <CardTitle>Current Order</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {!selectedJob ? (
                            <div className="text-center py-8 text-gray-500">
                                Please select a service from the left.
                            </div>
                        ) : (
                            <>
                                <div>
                                    <h3 className="font-semibold text-lg">{selectedJob.title}</h3>
                                    <p className="text-gray-600">Base Price: ₹{selectedJob.basePrice.toFixed(2)}</p>
                                </div>

                                {selectedJob.options.length > 0 && (
                                    <div className="space-y-3 pt-4 border-t">
                                        <h4 className="font-medium text-sm text-gray-700">Additional Options</h4>
                                        {selectedJob.options.map((opt: JobOption) => (
                                            <div key={opt.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={opt.id}
                                                    checked={!!selectedOptions[opt.id]}
                                                    onCheckedChange={() => handleToggleOption(opt.id)}
                                                />
                                                <label
                                                    htmlFor={opt.id}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                                                >
                                                    {opt.name}
                                                </label>
                                                <span className="text-sm text-gray-600">+₹{opt.additionalCost.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="pt-4 border-t space-y-4">
                                    <div className="flex items-center justify-between pb-2">
                                        <label className="text-sm font-medium">Quantity</label>
                                        <div className="flex items-center space-x-3">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            >
                                                -
                                            </Button>
                                            <span className="font-semibold w-4 text-center">{quantity}</span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setQuantity(quantity + 1)}
                                            >
                                                +
                                            </Button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Customer Name (Optional)</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 border rounded-md p-2 text-sm"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="e.g. John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Customer Phone (Optional)</label>
                                        <input
                                            type="text"
                                            className="w-full mt-1 border rounded-md p-2 text-sm"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            placeholder="e.g. 9876543210"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t flex flex-col items-center space-y-4">
                                    <div className="w-full flex justify-between items-center bg-blue-50 p-4 rounded-lg">
                                        <span className="font-medium text-blue-900">Total Amount</span>
                                        <span className="text-2xl font-bold text-blue-700">₹{totalAmount.toFixed(2)}</span>
                                    </div>

                                    {totalAmount > 0 && (
                                        <div className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center">
                                            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Scan to Pay via UPI</p>
                                            <QRCodeSVG value={upiString} size={150} level="H" />
                                        </div>
                                    )}

                                    <Button
                                        className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 mt-4"
                                        onClick={handleCompleteTransaction}
                                        disabled={totalAmount === 0}
                                    >
                                        Complete Transaction
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
