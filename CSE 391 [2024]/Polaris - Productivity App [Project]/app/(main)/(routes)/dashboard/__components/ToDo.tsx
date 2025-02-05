import React from 'react';
import { Plus, MoreVertical, Coins, CheckIcon } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { Id } from '@/convex/_generated/dataModel';
import { api } from '@/convex/_generated/api';
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Days_One } from "next/font/google";

const font = Days_One({
  subsets: ["latin"],
  weight: ["400"],
});

type Task = {
  _id: Id<"tasks">;
  userId: string;
  task: string;
  description?: string;
  priority: "high" | "mid" | "low";
  isCompleted: boolean;
  rewardPoints: number;
};

const ToDo = () => {
  const { user } = useUser();
  const [taskName, setTaskName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<"high" | "mid" | "low">("mid");
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isPointsDialogOpen, setIsPointsDialogOpen] = React.useState(false);

  const tasks = useQuery(api.todo.list, user ? { userId: user.id } : 'skip');
  const totalPoints = useQuery(api.todo.getTotalPoints, user ? { userId: user.id } : 'skip');
  const addTask = useMutation(api.todo.create);
  const updateTask = useMutation(api.todo.update);
  const deleteTask = useMutation(api.todo.remove);
  const toggleComplete = useMutation(api.todo.toggleComplete);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addTask({
        userId: user.id,
        task: taskName,
        description,
        priority,
      });
      toast.success("Task added successfully!");
      setTaskName("");
      setDescription("");
      setPriority("mid");
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add task:", error);
      toast.error("Failed to add task");
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTask) return;

    try {
      await updateTask({
        id: selectedTask._id,
        task: taskName,
        description,
        priority,
      });
      setSelectedTask(null);
      setTaskName("");
      setDescription("");
      setPriority("mid");
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleToggleComplete = async (taskId: Id<"tasks">) => {
    try {
      await toggleComplete({ id: taskId });
      toast.success("Task completed! You've earned 5 points! 🎉");
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  const openEditDialog = (task: Task) => {
    setSelectedTask(task);
    setTaskName(task.task);
    setDescription(task.description || "");
    setPriority(task.priority);
    setIsEditDialogOpen(true);
  };

  const getPriorityDots = (priority: string) => {
    switch (priority) {
      case "high":
        return <span className="ml-2">🔴</span>;
      case "mid":
        return <span className="ml-2">🟡</span>;
      case "low":
        return <span className="ml-2">🔵</span>;
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="col-span-2 row-span-3 rounded-[20px] bg-white/15 shadow-[0_10px_20px_rgba(0,0,0,0.3)] backdrop-blur-[4px] border border-white/20 p-4 relative flex flex-col h-full items-center justify-center">
        <p className="dark:text-white text-lg">Please log in to view your tasks</p>
      </div>
    );
  }

  const incompleteTasks = (tasks || []).filter(task => !task.isCompleted);

  return (
    <div className="col-span-2 row-span-3 rounded-[20px] bg-white/15 shadow-[0_10px_20px_rgba(0,0,0,0.3)] backdrop-blur-[4px] border border-white/20 p-4 relative flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <span className={`flex items-center text-lg font-semibold dark:text-white ${font.className}`}>
          <CheckIcon className="mr-2"/> To-Do List
        </span>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            className="dark:text-white" 
            onClick={() => setIsPointsDialogOpen(true)}
          >
            <Coins className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            className="dark:text-white" 
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
        <div className="space-y-4">
          {incompleteTasks.length === 0 ? (
            <p className="dark:text-white text-center">No tasks found</p>
          ) : (
            incompleteTasks.map((task) => (
              <div
                key={task._id}
                className="flex items-center justify-between p-2 rounded-[12px] bg-white/15 shadow-[1px_5px_10px_rgba(0,0,0,0.3)] backdrop-blur-[4px] border border-white/20 "
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div 
                    className="flex items-center"
                    onClick={() => handleToggleComplete(task._id)}
                  >
                    <Checkbox 
                      className="h-5 w-5"
                      checked={task.isCompleted}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold dark:text-white flex items-center">
                      {task.task}
                      {getPriorityDots(task.priority)}
                    </span>
                    {task.description && (
                      <span className="dark:text-gray-200 text-sm">
                        {task.description}
                      </span>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="dark:text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => openEditDialog(task)}>
                      Edit Task
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
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTask} className="space-y-4">
            <Input
              placeholder="Task Name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
              className="dark:bg-black"
            />
            <Textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="dark:bg-black"
            />
            <Select
              value={priority}
              onValueChange={(value: "high" | "mid" | "low") => setPriority(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="mid">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="w-full">Add Task</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTask} className="space-y-4">
            <Input
              placeholder="Task Name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
              className="dark:bg-black"
            />
            <Textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="dark:bg-black"
            />
            <Select
              value={priority}
              onValueChange={(value: "high" | "mid" | "low") => setPriority(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="mid">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex space-x-4">
              <Button type="submit" className="w-full">Update Task</Button>
              <Button 
                type="button" 
                variant="destructive" 
                className="w-full" 
                onClick={() => {
                  if (selectedTask) {
                    deleteTask({ id: selectedTask._id });
                    setIsEditDialogOpen(false);
                  }
                }}
              >
                Delete Task
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPointsDialogOpen} onOpenChange={setIsPointsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Reward Points</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <span className="text-4xl">🪙</span>
            <p className="text-2xl font-bold">{totalPoints || 0} points</p>
            <p className="text-sm dark:text-gray-500 text-center">
              Complete tasks to earn more points!
              Each task is worth 5 points.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ToDo;