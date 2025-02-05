"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DateDisplayProps {
  className?: string;
}

export function DateDisplay({ className }: DateDisplayProps) {
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM d, yyyy");

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "text-lg text-center mb-4 text-muted-foreground",
        className
      )}
    >
      {formattedDate}
    </motion.div>
  );
}