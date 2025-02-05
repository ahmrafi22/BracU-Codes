import React from 'react';
import { CalendarDays, Plus, MoreVertical, CalendarDaysIcon, University } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { Id } from '@/convex/_generated/dataModel';
import { api } from '@/convex/_generated/api';
import { format, isToday } from 'date-fns';
import { Days_One } from "next/font/google";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const font = Days_One({
  subsets: ["latin"],
  weight: ["400"],
});

type Class = {
  _id: Id<"classes">;
  userId: string;
  day: string;
  className: string;
  time: number;
  endDate: string;
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DailyClasses = () => {
  const { user } = useUser();
  const [className, setClassName] = React.useState("");
  const [day, setDay] = React.useState("");
  const [time, setTime] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [selectedClass, setSelectedClass] = React.useState<Class | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isAllClassesDialogOpen, setIsAllClassesDialogOpen] = React.useState(false);

  const classes = useQuery(api.classes.list, user ? { userId: user.id } : 'skip');
  const addClass = useMutation(api.classes.create);
  const updateClass = useMutation(api.classes.update);
  const deleteClass = useMutation(api.classes.remove);

  const validateEndDate = (endDateString: string): boolean => {
    const selectedEndDate = new Date(endDateString);
    return selectedEndDate > new Date();
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      console.error("No user logged in");
      return;
    }

    if (!validateEndDate(endDate)) {
      toast.error("End date must be in the future");
      return;
    }

    try {
      await addClass({
        userId: user.id,
        day,
        className,
        time: parseFloat(time),
        endDate,
      });
      resetForm();
      setIsAddDialogOpen(false);
      toast.success("Class added successfully!");
    } catch (error) {
      toast.error("Failed to add class");
      console.error("Failed to add class:", error);
    }
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedClass) {
      console.error("No user or selected class");
      return;
    }

    if (!validateEndDate(endDate)) {
      toast.error("End date must be in the future");
      return;
    }

    try {
      await updateClass({
        id: selectedClass._id,
        day,
        className,
        time: parseFloat(time),
        endDate,
      });
      resetForm();
      setIsEditDialogOpen(false);
      toast.success("Class updated successfully!");
    } catch (error) {
      toast.error("Failed to update class");
      console.error("Failed to update class:", error);
    }
  };

  const handleDeleteClass = async () => {
    if (!user || !selectedClass) {
      console.error("No user or selected class");
      return;
    }

    try {
      await deleteClass({
        id: selectedClass._id,
      });
      resetForm();
      setIsEditDialogOpen(false);
      toast.success("Class deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete class");
      console.error("Failed to delete class:", error);
    }
  };

  const resetForm = () => {
    setClassName("");
    setDay("");
    setTime("");
    setEndDate("");
    setSelectedClass(null);
  };

  const openEditDialog = (classItem: Class) => {
    setSelectedClass(classItem);
    setClassName(classItem.className);
    setDay(classItem.day);
    setTime(classItem.time.toString());
    setEndDate(classItem.endDate);
    setIsEditDialogOpen(true);
  };

  if (!user) {
    return (
      <div className="col-span-2 row-span-3 rounded-[20px] bg-white/15 shadow-[0_10px_10px_rgba(0,0,0,0.3)] backdrop-blur-[4px] border border-white/20 p-4 flex items-center justify-center">
        <p className="text-white text-lg ">Please log in to view your classes</p>
      </div>
    );
  }

  // Filter classes for today and not expired
  const todayClasses = (classes || [])
    .filter(classItem => 
      isToday(new Date()) && 
      classItem.day === DAYS[new Date().getDay()] && 
      new Date(classItem.endDate) > new Date()
    )
    .sort((a, b) => a.time - b.time);

  // Filter all classes not expired for the all classes dialog
  const activeClasses = (classes || [])
    .filter(classItem => new Date(classItem.endDate) > new Date())
    .sort((a, b) => {
      const dayOrder = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
      return dayOrder !== 0 ? dayOrder : a.time - b.time;
    });

  return (
    <div className="col-span-2 row-span-3 rounded-[20px] bg-white/15 shadow-[0_10px_10px_rgba(0,0,0,0.3)] backdrop-blur-[4px] border border-white/20 p-4 relative flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
      <span className={`flex items-center text-lg font-semibold dark:text-white ${font.className}`}> <CalendarDaysIcon className="mr-2" /> Today's Classes</span>
        
        <div className="absolute top-4 right-4 flex space-x-2">
          <Dialog open={isAllClassesDialogOpen} onOpenChange={setIsAllClassesDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="dark:text-white">
                <CalendarDays size={20} className="mr-2" /> 
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[500px] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>All Active Classes</DialogTitle>
              </DialogHeader>
              {activeClasses.length === 0 ? (
                <p className="text-center ">No active classes</p>
              ) : (
                activeClasses.map((classItem) => (
                  <div 
                    key={classItem._id} 
                    className="flex justify-between items-center p-3 bg-gray-100 dark:bg-black rounded-lg mb-2"
                  >
                    <div>
                      <div className="font-bold">{classItem.day}</div>
                      <div>{classItem.className}</div>
                      <div className="text-sm text-gray-500">
                        {classItem.time.toFixed(2)} hrs
                      </div>
                    </div>
                  </div>
                ))
              )}
            </DialogContent>
          </Dialog>

          <Button 
            variant="ghost" 
            className="dark:text-white" 
            onClick={() => setIsAddDialogOpen(true)}
          > 
            <Plus size={20} className="mr-2" />
          </Button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
        <div className="space-y-4">
          {todayClasses.length === 0 ? (
            <p className="dark:text-white text-center">No classes today</p>
          ) : (
            todayClasses.map((classItem) => (
              <div
                key={classItem._id}
                className="flex items-center mt-3  justify-between p-2.5 rounded-[12px] bg-white/15 shadow-[1px_5px_10px_rgba(0,0,0,0.3)] backdrop-blur-[4px] border border-white/20 "
              >
                <div className="flex flex-col space-y-2 font-serif">
                  <div className="flex items-center space-x-3">
                    <span className='font-bold'> <University /></span>
                    <span className="font-bold text-xl dark:text-green-50">
                      {classItem.className}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="dark:text-gray-200 text-sm">
                      {classItem.time.toFixed(2)} hrs
                    </span>
                    <span className="dark:text-gray-200 text-sm">
                      Ends on: {format(new Date(classItem.endDate), 'PPP')}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="dark:text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => openEditDialog(classItem)}>
                      Edit Class
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Class</DialogTitle>
            <DialogDescription>
              Enter class details for your schedule
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddClass} className="space-y-4">
            <Input
              placeholder="Class Name"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
              className="dark:bg-black"
            />
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              required
              className="w-full p-2 border rounded dark:bg-black"
            >
              <option value="">Select Day</option>
              {DAYS.map(dayOption => (
                <option key={dayOption} value={dayOption}>
                  {dayOption}
                </option>
              ))}
            </select>
            <Input
              type="number"
              step="0.01"
              placeholder="(24-hour format) if time is 4:30pm write like this: 16.30"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="dark:bg-black"
              min="0"
              max="23.59"
            />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select class end date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="dark:bg-black"
              min={new Date().toISOString().split('T')[0]}
            />
            <Button type="submit" className="w-full">Add Class</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>Update or delete class details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateClass} className="space-y-4">
            <Input
              placeholder="Class Name"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
              className="dark:bg-black"
            />
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              required
              className="w-full p-2 border rounded dark:bg-black"
            >
              <option value="">Select Day</option>
              {DAYS.map(dayOption => (
                <option key={dayOption} value={dayOption}>
                  {dayOption}
                </option>
              ))}
            </select>
            <Input
              type="number"
              step="0.01"
              placeholder="(24-hour format) if time is 4:30pm write like this: 16.30"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="dark:bg-black"
              min="0"
              max="23.59"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="dark:bg-black"
              min={new Date().toISOString().split('T')[0]}
            />
            <div className="flex space-x-4">
              <Button type="submit" className="w-full">Update Class</Button>
              <Button 
                type="button" 
                variant="destructive" 
                className="w-full" 
                onClick={handleDeleteClass}
              >
                Delete Class
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DailyClasses;