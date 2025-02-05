"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Days_One } from "next/font/google"

interface FlipNumberProps {
  value: number;
  label: string;
  max?: number;
  className?: string;
}



const font = Days_One({
    subsets: ["latin"],
    weight:["400"]
});

export function FlipNumber({ value, label,  className }: FlipNumberProps) {
  const formattedValue = value.toString().padStart(2, "0");

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative h-24 w-20 bg-transparent">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={value}
            initial={{ rotateX: -90, position: "absolute", top: 0 }}
            animate={{ rotateX: 0 }}
            exit={{ rotateX: 90 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className={cn(
              "w-full h-full flex items-center justify-center text-4xl",
              font.className
            )}
            style={{ transformOrigin: "bottom", backfaceVisibility: "hidden" }}
          >
            {formattedValue}
          </motion.div>
        </AnimatePresence>
      </div>
      <span className="text-sm text-muted-foreground mt-2">{label}</span>
    </div>
  );
}