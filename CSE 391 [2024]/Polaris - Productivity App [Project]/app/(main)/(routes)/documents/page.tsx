"use client"
import React from 'react';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PlusCircle, LayoutDashboard, Palette, Pen, Grid2x2Check, Paintbrush} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ClockDisplay } from "@/components/clock-and-weather/clock-display";
import { WeatherDisplay } from "@/components/clock-and-weather/weather-display";
import { DateDisplay } from "@/components/clock-and-weather/date-display";
import QuoteOfTheDay from '@/components/clock-and-weather/Quotes';
import { Days_One } from "next/font/google"
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';


const font = Days_One({
    subsets: ["latin"],
    weight:["400"]
});

const DocumentPage = () => {
    const router = useRouter();
    const { user } = useUser();
    const create = useMutation(api.documents.create);
    const [time, setTime] = useState({
        hours: 12,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = now.getHours();
            const twelveHour = hours % 12 || 12;
            setTime({
                hours: twelveHour,
                minutes: now.getMinutes(),
                seconds: now.getSeconds(),
            });
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const onCreate = () => {
        const promise = create({ title: "untitled" }).then((documentId) => router.push(`/documents/${documentId}`));;

        toast.promise(promise, {
            loading: "Creating a new document...",
            success: "New Note created!",
            error: "Failed to create a document"
        });
    };

    return (
        <div className="min-h-screen flex flex-col py-12 dark:bg-[#1F1F1F] bg-gray-200">
            {/* Header */}
            <h2 className={cn("text-3xl font-semibold text-center mb-16 text-gray-800 dark:text-white",font.className)}>
                Welcome to {user?.firstName}&apos;s Polaris
            </h2>

            {/* Grid Layout */}
            <div className="grid grid-cols-3 gap-8 w-[70%] mx-auto px-4 flex-1">
                {/* Create Document Button Card */}
                <div
                    style={{
                        borderWidth: "5px",
                        borderRadius: "25% 25% 25% 25% / 25% 25% 25% 0%",
                    }}
                    className="border-black dark:border-[rgba(255,255,255,0.2)] bg-white dark:bg-transparent p-8 flex flex-col items-center justify-center hover:opacity-90 transition shadow-lg min-h-[250px] relative overflow-hidden"
                >
                     <h1 className={cn('text-gray-800 dark:text-white text-2xl font-semibold mb-10 flex items-center gap-4', font.className)}>
                         <Pen className="w-6 h-6" /> 
                            Create a dynamic document
                     </h1>
                    <Button
                        onClick={onCreate}
                        className="absolute bottom-6 hover:rotate-180 left-8 w-12 h-12 rounded-full bg-black dark:bg-white flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200 transition"
                    >
                        <PlusCircle className="h-9 w-9 text-white dark:text-gray-800" />
                    </Button>
                </div>

                {/* Dashboard Button Card */}
                <div
                    style={{
                        borderWidth: "5px",
                        borderRadius: "25% 25% 25% 25% / 25% 25% 25% 0%",
                    }}
                    className="border-black dark:border-[rgba(255,255,255,0.2)] bg-white dark:bg-transparent p-8 flex flex-col items-center justify-center hover:opacity-90 transition shadow-lg min-h-[250px] relative overflow-hidden"
                >
                    <h1 className={cn('text-gray-800 dark:text-white text-2xl font-semibold mb-10 flex items-center gap-4', font.className)}>
                        <Grid2x2Check className="w-6 h-6" /> View your dashboard 
                    </h1>
                    <Link href="/dashboard">
                        <Button
                            className="absolute bottom-6 hover:rotate-180 left-8 w-12 h-12 rounded-full bg-black dark:bg-white flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200 transition"
                        >
                            <LayoutDashboard className="h-9 w-9 text-white dark:text-gray-800" />
                        </Button>
                    </Link>
                </div>

                {/* Clock Card */}
                <div 
                    style={{
                        borderWidth: "5px",
                        borderRadius: "25% 25% 25% 25% / 25% 25% 0% 25% ",
                    }}
                    className="border-black dark:border-[rgba(255,255,255,0.2)] bg-white dark:bg-transparent  flex items-center justify-center hover:opacity-90 transition min-h-[250px] relative overflow-visible"
                >
                    <div className="space-y-6">
                        <DateDisplay  />
                        <ClockDisplay  time={time} />
                        <div className="pt-4 border-t">
                            <WeatherDisplay />
                        </div>
                    </div>
                </div>

                {/* Canvas Playground Button Card */}
                <div 
                    style={{
                        borderWidth: "5px",
                        borderRadius: "25% 25% 25% 25% / 25% 0% 25% 25%",
                    }}
                    className="border-black dark:border-[rgba(255,255,255,0.2)] bg-white dark:bg-transparent p-8 flex flex-col items-center justify-center hover:opacity-90 transition shadow-lg min-h-[250px] relative overflow-hidden"
                >
                    <h1 className={cn('text-gray-800 dark:text-white text-2xl font-semibold mb-10 flex items-center gap-4', font.className)}>
                        <Paintbrush className="w-6 h-6" />Explore the canvas playground
                    </h1>
                    <Link href="/playground">
                        <Button
                            className="absolute bottom-6 hover:rotate-180 left-8 w-12 h-12 rounded-full bg-black dark:bg-white flex items-center justify-center hover:bg-gray-800 dark:hover:bg-gray-200 transition"
                        >
                            <Palette className="h-9 w-9 text-white dark:text-gray-800" />
                        </Button>
                    </Link>
                </div>

                {/* Quotes Section */}

                    <QuoteOfTheDay />

            </div>
        </div>
    );
};

export default DocumentPage;