"use client"

import { Spinner } from "@/components/spinners";
import { useConvexAuth, useQuery } from "convex/react";
import { redirect } from "next/navigation";
import { Navigation } from "./__components/Navigation";
import { SearchCommand } from "@/components/search-command";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

const MainLayout = ({
    children
}: {
    children: React.ReactNode;
}) => {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const user = useQuery(api.users.getCurrentUser);

    useEffect(() => {
        if (user?.isBanned) {
            redirect("/banned");
        }
    }, [user]);

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Spinner size={"lg"}/>
            </div>
        );
    }

    if (!isAuthenticated) {
        return redirect("/");
    }

    return (
        <div className="h-full flex dark:bg-[#1F1F1F]">
            <Navigation />
            <main className="flex-1 h-full overflow-y-auto">
                <SearchCommand />
                {children}
            </main>
        </div>
    );
}
 
export default MainLayout;
