"use client";

import { motion } from "framer-motion";
import { MonitorSmartphone, Printer } from "lucide-react";
import type { JobWithOptions, CartItem } from "./types";

// Framer Motion Variants for Staggered Bento Grid
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

interface JobGridProps {
  templates: JobWithOptions[];
  cartItems: CartItem[];
  onAddJob: (job: JobWithOptions) => void;
}

export default function JobGrid({ templates, cartItems, onAddJob }: JobGridProps) {
  return (
    <div className="lg:col-span-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <MonitorSmartphone className="h-6 w-6 text-blue-500" />
          Terminal Array
        </h2>
        <p className="text-gray-400 mt-1">
          Select a service template to initiate checkout flow.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {templates.map((job) => {
          const isSelected = cartItems.some((item) => item.job.id === job.id);
          return (
            <motion.div key={job.id} variants={itemVariants} whileTap={{ scale: 0.96 }}>
              <div
                onClick={() => onAddJob(job)}
                className={`relative group cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 h-full select-none
                  ${
                    isSelected
                      ? "bg-blue-600/10 border-blue-500 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)] backdrop-blur-md"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 backdrop-blur-sm"
                  }`}
              >
                <div className="p-5 flex flex-col h-full justify-between gap-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-white leading-tight">
                      {job.title}
                    </h3>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_2px_rgba(59,130,246,0.8)]"
                      />
                    )}
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-blue-500 font-medium">₹</span>
                      <span
                        className={`text-3xl font-bold tracking-tighter ${
                          isSelected ? "text-blue-400" : "text-gray-200"
                        }`}
                      >
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
  );
}
