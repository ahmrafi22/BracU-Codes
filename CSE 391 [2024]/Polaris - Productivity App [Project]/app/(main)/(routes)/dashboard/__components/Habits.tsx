import React from 'react';
import { Hash, Trash2,ChartLine } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
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

const DailyHabits = () => {
  const { user } = useUser();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [habitName, setHabitName] = React.useState("");
  const [daysCount, setDaysCount] = React.useState("");

  const habits = useQuery(api.habits.list, user ? { userId: user.id } : 'skip');
  const createHabit = useMutation(api.habits.create);
  const deleteHabit = useMutation(api.habits.remove);
  const updateProgress = useMutation(api.habits.update);
  

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await createHabit({
        userId: user.id,
        habit: habitName,
        daysCount: parseInt(daysCount),
        currentCount: 0
      });
      setIsAddDialogOpen(false);
      setHabitName("");
      setDaysCount("");
      toast.success("Habit created!");
    } catch (error) {
      toast.error("Failed to create habit");
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 33) return "bg-red-500";
    if (progress < 66) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="col-span-2 row-span-2 rounded-[20px] bg-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.3)] backdrop-blur-[4px] border border-white/20 p-4">
      <div className="flex justify-between items-center mb-4">
      <span className={`flex items-center text-lg mb-7 font-semibold dark:text-white ${font.className}`}>
          <ChartLine className='mr-2' /> Daily Habits Tracker
        </span>
        {(!habits || habits.length === 0) && (
          <Button 
            variant="ghost" 
            className="dark:text-white"
            onClick={() => setIsAddDialogOpen(true)}
          >
            + New Habit
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {habits?.map((habit) => {
          const progress = (habit.currentCount / habit.daysCount) * 100;
          return (
            <div key={habit._id} className="">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Hash className="text-blue-500" />
                  <span className="dark:text-white font-semibold font-medium">
                    {habit.habit}
                  </span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="text-center space-y-4">
                      <p>Are you sure you want to delete this habit?</p>
                      <Button
                        variant="destructive"
                        onClick={() => deleteHabit({ id: habit._id })}
                      >
                        Delete
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="w-full bg-white/10 rounded-full h-4 mb-2">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress)}`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between items-center mt-5">
                <span className="dark:text-white">
                  {habit.currentCount} / {habit.daysCount} days
                </span>
                <span className="dark:text-white">
                  {Math.round(progress)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  style={{borderColor: "black"}}
                  onClick={() => updateProgress({
                    id: habit._id,
                    currentCount: Math.min(habit.currentCount + 1, habit.daysCount)
                  })}
                  disabled={habit.currentCount >= habit.daysCount}
                >
                  Mark Complete
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Habit</DialogTitle>
            <DialogDescription>
              Set a goal and track your progress
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddHabit} className="space-y-4">
            <Input
              placeholder="Habit Name"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              required
            />
            <Input
              type="number"
              placeholder="Number of Days"
              value={daysCount}
              onChange={(e) => setDaysCount(e.target.value)}
              required
              min="1"
            />
            <Button type="submit" className="w-full">
              Create Habit
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyHabits;