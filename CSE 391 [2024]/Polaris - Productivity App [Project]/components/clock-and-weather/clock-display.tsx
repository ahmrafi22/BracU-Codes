"use client";

import { FlipNumber } from "./flip-number";

interface ClockDisplayProps {
  time: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export function ClockDisplay({ time }: ClockDisplayProps) {
  return (
    <div className="flex bg-transparent items-center gap-4">
      <FlipNumber value={time.hours} label="Hours" max={12} />
      <FlipNumber value={time.minutes} label="Minutes" />
      <FlipNumber value={time.seconds} label="Seconds" />
    </div>
  );
}