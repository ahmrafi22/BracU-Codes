import React from 'react';
import { NewspaperIcon, ScrollText, Plus, MoreVertical, NotepadText } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "@/convex/_generated/api";
import { differenceInDays } from 'date-fns';
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Days_One } from "next/font/google";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

interface QuizItem {
  _id: Id<"quizzesAndAssignments">;
  userId: string;
  name: string;
  date: string;
  label: 'quiz' | 'assignment';
}

interface UpdateQuizParams {
  _id: string;  // Changed from id to _id to match the API
  name: string;
  date: string;
  label: 'quiz' | 'assignment';
}

const font = Days_One({
  subsets: ["latin"],
  weight: ["400"],
});

const numberToEmoji = (num: number): string => {
  const emojiMap: { [key: string]: string } = {
    '0': '0️⃣', '1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣',
    '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', '9': '9️⃣'
  };
  return num.toString().split('').map(digit => emojiMap[digit]).join('');
};

const QuizAssignment = () => {
  const { user } = useUser();
  const [name, setName] = React.useState("");
  const [date, setDate] = React.useState("");
  const [label, setLabel] = React.useState<"quiz" | "assignment">("quiz");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<QuizItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const items = useQuery(api.quiz.list, user ? { userId: user.id } : 'skip');
  const create = useMutation(api.quiz.create);
  const update = useMutation(api.quiz.update);
  const remove = useMutation(api.quiz.remove);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      await create({
        userId: user.id,
        name,
        date,
        label,
      });
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("Added successfully!");
    } catch (error) {
      toast.error("Failed to add");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    try {
      await update({
        id: selectedItem._id, 
        name,
        date,
        label,
      });
      setIsEditDialogOpen(false);
      resetForm();
      toast.success("Updated successfully!");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const resetForm = () => {
    setName("");
    setDate("");
    setLabel("quiz");
    setSelectedItem(null);
  };

  const openEditDialog = (item: QuizItem) => {
    setSelectedItem(item);
    setName(item.name);
    setDate(item.date);
    setLabel(item.label);
    setIsEditDialogOpen(true);
  };

  const getDaysLeft = (date: string): number => {
    return differenceInDays(new Date(date), new Date());
  };

  const filteredItems = items?.filter(item => getDaysLeft(item.date) >= 0) || [];
  const sortedItems = [...filteredItems].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (!user) {
    return (
      <div className="col-span-2 row-span-2 rounded-[20px] bg-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.3)] backdrop-blur-[4px] border border-white/20 p-4 flex items-center justify-center">
        <p className="dark:text-white text-lg">Please log in to view your items</p>
      </div>
    );
  }

  return (
    <div className="col-span-2 row-span-3 rounded-[20px] bg-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.3)] backdrop-blur-[4px] border border-white/20  p-4">
      <div className="flex items-center justify-between mb-4">
        <span className={`flex items-center text-lg font-semibold dark:text-white ${font.className}`}>
          <NotepadText className='mr-2' /> Quizzes & Assignments
        </span>
        <Button 
          variant="ghost" 
          className="dark:text-white"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus size={20} />
        </Button>
      </div>

      <div className="space-y-3">
        {sortedItems.map((item) => (
          <div
            key={item._id}
            className="flex items-center justify-between p-3 rounded-[12px] bg-white/15 shadow-[0_5px_10px_rgba(0,0,0,0.3)] backdrop-blur-[4px] border border-white/20"
          >
            <div className="flex items-center space-x-3 font-serif font-semibold">
              {item.label === 'quiz' ? 
                <ScrollText className="text-purple-400" /> : 
                <NewspaperIcon className="text-blue-400" />
              }
              <div>
                <p className="font-semibold dark:text-white">{item.name}</p>
                <div className="flex space-x-3 text-sm">
                  <span className="dark:text-gray-300">
                    {new Date(item.date).toLocaleString()}
                  </span>
                  <span className="text-red-400">
                    {numberToEmoji(getDaysLeft(item.date))} days left
                  </span>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => openEditDialog(item)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-500"
                  onClick={() => remove({ id: item._id })}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      <Dialog open={isAddDialogOpen || isEditDialogOpen} 
             onOpenChange={isAddDialogOpen ? setIsAddDialogOpen : setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isAddDialogOpen ? 'Add New' : 'Edit'}
            </DialogTitle>
            <DialogDescription>
              Add your quiz or assignment details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={isAddDialogOpen ? handleAdd : handleUpdate} className="space-y-4">
            <Select
              value={label}
              onValueChange={(value: "quiz" | "assignment") => setLabel(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="dark:bg-black"
            />
            
            <Input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="dark:bg-black"
              min={new Date().toISOString().slice(0, 16)}
            />
            
            <Button type="submit" className="w-full">
              {isAddDialogOpen ? 'Add' : 'Update'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizAssignment;
