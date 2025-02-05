"use client";
import { Days_One } from "next/font/google";
import Todo from "./__components/ToDo";
import UpExam from "./__components/UpcomingExam";
import DailyClasses from "./__components/Classes";
import { useUser } from "@clerk/clerk-react";
import DailyHabits from "./__components/Habits";
import QuizAssignment from "./__components/Quizassinment";
import Focus from "./__components/Focus";

const font = Days_One({
  subsets: ["latin"],
  weight: ["400"],
});

const Dashboard = () => {
  const { user } = useUser();
  return (
    <>
      <h1
        className={`flex text-5xl scroll-smooth pt-6 items-center justify-center bg-neutral-300 dark:bg-secondary ${font.className} md:text-5xl text-3xl px-4 text-center`}
      >
        Hello {user?.firstName} <span className="ml-4">🎉</span>
      </h1>
      <div
        className="flex min-h-screen w-full items-start justify-center bg-neutral-300 dark:bg-secondary"
      >
        <div className="w-full max-w-[85%] p-4 md:p-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-6 md:gap-6">
            <Todo />
            <DailyClasses />
            <UpExam />
            <QuizAssignment />
            <Focus />
            <DailyHabits />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;