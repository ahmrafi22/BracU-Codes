import React from 'react';
import { Plus, MoreVertical, NotebookPen, BookAIcon } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { Id } from '@/convex/_generated/dataModel';
import { api } from '@/convex/_generated/api';
import { differenceInDays, addDays, isFuture, } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Days_One } from "next/font/google";
import { toast } from "sonner";

const font = Days_One({
  subsets: ["latin"],
  weight: ["400"],
});

type Exam = {
  _id: Id<"exams">;
  userId: string;
  examName: string;
  date: string;
};

const numberToEmoji = (num: number): string => {
  const emojiMap: { [key: string]: string } = {
    '0': '0️⃣',
    '1': '1️⃣',
    '2': '2️⃣',
    '3': '3️⃣',
    '4': '4️⃣',
    '5': '5️⃣',
    '6': '6️⃣',
    '7': '7️⃣',
    '8': '8️⃣',
    '9': '9️⃣'
  };
  
  return num.toString().split('').map(digit => emojiMap[digit]).join('');
};

const UpExam = () => {
  const { user } = useUser();
  const [examName, setExamName] = React.useState("");
  const [examDate, setExamDate] = React.useState("");
  const [selectedExam, setSelectedExam] = React.useState<Exam | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  const exams = useQuery(api.upexam.list, user ? { userId: user.id } : 'skip');
  const addExam = useMutation(api.upexam.create);
  const updateExam = useMutation(api.upexam.update);
  const deleteExam = useMutation(api.upexam.remove);

  const validateDate = (date: string): boolean => {
    const selectedDate = new Date(date);
    const maxDate = addDays(new Date(), 1000);
    return isFuture(selectedDate) && selectedDate <= maxDate;
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      console.error("No user logged in");
      return;
    }

    if (!validateDate(examDate)) {
      toast.error("Please select a future date within 1000 days");
      return;
    }

    try {
      await addExam({
        userId: user.id,
        examName,
        date: examDate,
      });
      setExamName("");
      setExamDate("");
      setIsAddDialogOpen(false);
      toast.success("Exam added successfully!");
    } catch (error) {
      toast.error("Failed to add exam");
      console.error("Failed to add exam:", error);
    }
  };

  const handleUpdateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedExam) {
      console.error("No user or selected exam");
      return;
    }

    if (!validateDate(examDate)) {
      toast.error("Please select a future date within 1000 days");
      return;
    }

    try {
      await updateExam({
        id: selectedExam._id,
        examName,
        date: examDate,
      });
      setSelectedExam(null);
      setExamName("");
      setExamDate("");
      setIsEditDialogOpen(false);
      toast.success("Exam updated successfully!");
    } catch (error) {
      toast.error("Failed to update exam");
      console.error("Failed to update exam:", error);
    }
  };

  const handleDeleteExam = async () => {
    if (!user || !selectedExam) {
      console.error("No user or selected exam");
      return;
    }

    try {
      await deleteExam({
        id: selectedExam._id,
      });
      setSelectedExam(null);
      setExamName("");
      setExamDate("");
      setIsEditDialogOpen(false);
      toast.success("Exam deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete exam");
      console.error("Failed to delete exam:", error);
    }
  };

  const getDaysRemaining = (date: string) => {
    const daysLeft = differenceInDays(new Date(date), new Date());
    return daysLeft >= 0 ? daysLeft : 0;
  };

  const openEditDialog = (exam: Exam) => {
    setSelectedExam(exam);
    setExamName(exam.examName);
    setExamDate(exam.date);
    setIsEditDialogOpen(true);
  };

  if (!user) {
    return (
      <div className="col-span-2 row-span-4 rounded-[20px] bg-white/15 shadow-[10px_10px_10px_rgba(0,0,0,0.3)] backdrop-blur-[4px] border border-white/20 p-4 flex items-center justify-center">
        <p className="dark:text-white text-lg">Please log in to view your exams</p>
      </div>
    );
  }

  const examList = exams || [];
  const sortedExams = [...examList].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="col-span-2 row-span-4 rounded-[20px] bg-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.3)] backdrop-blur-[4px] border border-white/20 p-4 relative flex flex-col h-full">

      <div className="flex items-center mb-4 flex-shrink-0">
      <span
         className={`flex items-center text-lg font-semibold dark:text-white ${font.className}`}
       >
         <NotebookPen className="mr-2" /> 
         Upcoming Exams
       </span>
        
        <Button 
          variant="ghost" 
          className="absolute top-4 right-4 dark:text-white" 
          onClick={() => setIsAddDialogOpen(true)}
        > 
          <Plus size={20} /> 
        </Button>
      </div>

      <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
        <div className="space-y-4 mt-3">
          {sortedExams.length === 0 ? (
            <p className="dark:text-white text-center">No exams found</p>
          ) : (
            sortedExams.map((exam) => {
              const daysLeft = getDaysRemaining(exam.date);
              return (
                <div
                  key={exam._id}
                  className="flex items-center justify-between p-3 rounded-[12px] bg-white/15 shadow-[0_5px_10px_rgba(0,0,0,0.3)] backdrop-blur-[4px] border border-white/20"
                >
                  <div className="flex flex-col space-y-2 font-serif">
                    <div className="flex items-center space-x-3">
                      <span ><BookAIcon  className="text-blue-400" /></span>
                      <span className="font-bold text-xl dark:text-green-50">
                        {exam.examName || 'Unnamed Exam'}
                      </span>
                    </div>
                    <div className="flex flex-row space-y-1">
                      <span className="dark:text-gray-200 text-sm mt-1.5">
                        {new Date(exam.date).toLocaleString()}
                      </span>
                      <span className="text-red-500 dark:text-red-400 ml-2">
                        {numberToEmoji(daysLeft)} days left
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
                      <DropdownMenuItem onClick={() => openEditDialog(exam)}>
                        Edit Exam
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Exam</DialogTitle>
            <DialogDescription>
              Select a date within the next 1000 days
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddExam} className="space-y-4">
            <Input
              placeholder="Exam Name"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              required
              className="dark:bg-black"
            />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Exam date
            </label>
            <Input
              type="datetime-local"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
              className="dark:bg-black"
              min={new Date().toISOString().slice(0, 16)}
              max={addDays(new Date(), 1000).toISOString().slice(0, 16)}
            />
            <Button type="submit" className="w-full">Add Exam</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
            <DialogDescription>Update or delete your exam details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateExam} className="space-y-4">
            <Input
              placeholder="Exam Name"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              required
              className="dark:bg-black"
            />
            <Input
              type="datetime-local"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
              className="dark:bg-black"
              min={new Date().toISOString().slice(0, 16)}
              max={addDays(new Date(), 1000).toISOString().slice(0, 16)}
            />
            <div className="flex space-x-4">
              <Button type="submit" className="w-full">Update Exam</Button>
              <Button 
                type="button" 
                variant="destructive" 
                className="w-full" 
                onClick={handleDeleteExam}
              >
                Delete Exam
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpExam;