import React, { useState, useEffect } from 'react';
import { Plus, Hourglass, History } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Days_One } from "next/font/google";

const font = Days_One({
  subsets: ["latin"],
  weight: ["400"],
});

const Focus = () => {
  const { user } = useUser();
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState("");
  const [showMinutesDialog, setShowMinutesDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);

  const startTimer = useMutation(api.focustime.startFocusTimer);
  const completeFocusTimer = useMutation(api.focustime.completeFocusTimer);
  const updateTotalFocusTime = useMutation(api.focustime.incrementTotalFocusTime); 
  const timerStats = useQuery(api.focustime.get, 
    user ? { userId: user.id } : 'skip'
  );

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        setNotificationPermission(permission === "granted");
      });
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let minuteTracker: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds((prev) => prev - 1);
        } else if (minutes > 0) {
          setMinutes((prev) => prev - 1);
          setSeconds(59);
        } else {
          setIsRunning(false);
          completeFocusTimer(); 
          if (notificationPermission) {
            new Notification("Focus Timer Complete!", {
              body: "Great job! Take a short break.",
            });
          }
        }
      }, 1000);

      
      minuteTracker = setInterval(() => {
        if (minutes > 0 || seconds > 0) {
          updateTotalFocusTime({ minutes: 1 }); 
        }
      }, 60000); 
    }

    return () => {
      clearInterval(interval);
      clearInterval(minuteTracker);
    };
  }, [isRunning, minutes, seconds, notificationPermission, completeFocusTimer, updateTotalFocusTime, user]);

  const handleStartTimer = async () => {
    const mins = parseInt(selectedMinutes);
    if (!user || !mins) return;

    try {
      await startTimer({ minutes: mins });
      setMinutes(mins);
      setSeconds(0);
      setIsRunning(true);
      setShowMinutesDialog(false);
    } catch (error) {
      console.error(error);
    }
  };

  const getProgress = () => {
    if (!selectedMinutes) return 0;
    const totalSeconds = parseInt(selectedMinutes) * 60;
    const currentSeconds = minutes * 60 + seconds;
    return ((totalSeconds - currentSeconds) / totalSeconds) * 100;
  };

  return (
    <div className="col-span-2 row-span-3 rounded-[20px] bg-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.3)] backdrop-blur-[4px] border border-white/20 p-4">
      <div className="flex justify-between items-center mb-8">
        <span className={`flex items-center text-lg font-semibold dark:text-white ${font.className}`}>
          <Hourglass className="mr-2" /> Study Time/Focus Timer
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowMinutesDialog(true)}
            disabled={isRunning}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowStatsDialog(true)}
          >
            <History className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center h-[300px] relative">
        <svg className="w-48 h-48 -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="88"
            className="stroke-gray-200 fill-none"
            strokeWidth="12"
          />
          <circle
            cx="96"
            cy="96"
            r="88"
            className="stroke-blue-500 fill-none"
            strokeWidth="12"
            strokeDasharray={552}
            strokeDashoffset={552 - (552 * getProgress()) / 100}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex items-baseline justify-center">
          <span className="text-4xl font-bold dark:text-white">{minutes}</span>
          <span className="text-xl ml-1 dark:text-white">:{seconds.toString().padStart(2, '0')}</span>
        </div>
      </div>

      <Dialog open={showMinutesDialog} onOpenChange={setShowMinutesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Focus Timer</DialogTitle>
            <DialogDescription>
              How many minutes would you like to focus?
            </DialogDescription>
          </DialogHeader>
          <Input
            type="number"
            placeholder="Minutes"
            value={selectedMinutes}
            onChange={(e) => setSelectedMinutes(e.target.value)}
            min="1"
          />
          <Button onClick={handleStartTimer}>Start Timer</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Focus Timer Stats</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-lg">
              Total Focus Time: <span className="font-bold">{timerStats?.totalMinutes || 0}</span> minutes
            </p>
            <p className="text-lg">
              Total Sessions: <span className="font-bold">{timerStats?.sessionCount || 0}</span>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Focus;
