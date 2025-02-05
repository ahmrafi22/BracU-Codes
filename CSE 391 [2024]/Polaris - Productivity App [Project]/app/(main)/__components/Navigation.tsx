"use client"

import { cn } from "@/lib/utils";
import { ChevronsLeft, MenuIcon, PlusCircleIcon, Search, Settings, Trash, HomeIcon, MessageSquare, LayoutDashboard, Play } from "lucide-react";
import { ElementRef, useRef, useState } from "react";
import { useMediaQuery } from "usehooks-ts";
import { UserItem } from "./user_item";
import { Item } from "./item";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { DocumentList } from "./document-list";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TrashBox } from "./trashbox";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "./navbar";
import Link from "next/link";

export const Navigation = () => {
    const router = useRouter();
    const params = useParams();
    const search = useSearch();
    const settings = useSettings();
    const create = useMutation(api.documents.create);
    const isMobile = useMediaQuery("(max-width: 768px)");
    const isResizeingRef = useRef(false);
    const sidebarRef = useRef<ElementRef<"aside">>(null);
    const navbarRef = useRef<ElementRef<"div">>(null);

    const [isResetting, setisResetting] = useState(false);
    const [isCollapsed, setisCollapsed] = useState(isMobile);

    const handleMouseDown = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        event.preventDefault();
        event.stopPropagation();

        isResizeingRef.current = true;
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isResizeingRef.current) return;
        let newWidth = e.clientX;

        if (newWidth < 240) newWidth = 240;
        if (newWidth > 480) newWidth = 480;

        if (sidebarRef.current && navbarRef.current) {
            sidebarRef.current.style.width = `${newWidth}px`;
            navbarRef.current.style.setProperty("left", `${newWidth}px`);
            navbarRef.current.style.setProperty("width", `calc(100% - ${newWidth}px`);
        }
    };

    const handleMouseUp = () => {
        isResizeingRef.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    };

    const resetWidth = () => {
        if (sidebarRef.current && navbarRef.current) {
            setisCollapsed(false);
            setisResetting(true);

            sidebarRef.current.style.width = isMobile ? "100%" : "240px";
            navbarRef.current.style.setProperty("width", isMobile ? "0" : "calc(100% - 240px)");
            navbarRef.current.style.setProperty("left", isMobile ? "100%" : "240px");

            setTimeout(() => setisResetting(false), 300);
        }
    };

    const collapse = () => {
        if (sidebarRef.current && navbarRef.current) {
            setisCollapsed(true);
            setisResetting(true);

            sidebarRef.current.style.width = "0";
            navbarRef.current.style.setProperty("width", "100%");
            navbarRef.current.style.setProperty("left", "0");

            setTimeout(() => setisResetting(false), 300);
        }
    };

    const handleCreate = () => {
        const promise = create({
            title: "Untitled",
        }).then((documentId) => router.push(`/documents/${documentId}`));

        toast.promise(promise, {
            loading: "Creating a new Document...",
            success: "New Document Created",
            error: "Failed to create a document"
        });
    };

    return (
        <>
            <aside
                ref={sidebarRef}
                className={cn("group/sidebar h-full bg-secondary overflow-y-auto relative flex w-60 flex-col z-[99999]",
                    isResetting && "transition-all ease-in-out duration-300",
                    isMobile && "w-0"
                )}>

                <div
                    onClick={collapse}
                    role="button"
                    className={cn("h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition-all",
                        isMobile && 'opacity-100'
                    )}
                >
                    <ChevronsLeft className="h-6 w-6" />
                </div>

                <div className="mt-3">
                    <UserItem />
                    <Item
                        label="Search"
                        icon={Search}
                        isSearch
                        onClick={search.onOpen}
                    />
                    <Item
                        label="Settings"
                        icon={Settings}
                        onClick={settings.onOpen}
                    />
                    <Item
                        onClick={handleCreate}
                        label="New Page"
                        icon={PlusCircleIcon}
                    />
                </div>

                <div className="mt-1  space-y-2.5">
                    <Link href="/documents" className="block">
                            <span className=" text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600  flex items-center ">
                                <HomeIcon className="mr-2 h-5 w-5 ml-3" /> Home
                            </span>
                    </Link>

                    <Link href="/aichat" className="block">
                    <span className=" text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600  flex items-center ">
                                <MessageSquare className="mr-2 h-5 w-5 ml-3" /> Ai Chat
                            </span>
                    </Link>

                    <Link href="/dashboard" className="block">
                      <span className=" text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600  flex items-center ">
                                  <LayoutDashboard className="mr-2 h-5 w-5 ml-3" /> Dashboard
                              </span>
                    </Link>

                    <Link href="/playground" className="block">
                    <span className=" text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600  flex items-center ">
                                <Play className="mr-2 h-5 w-5 ml-3" /> Canvas 
                            </span>
                    </Link>
                </div>

                <div className="mt-4 ml-0.7">
                    <DocumentList />
                    <Popover>
                        <PopoverTrigger className="w-full mt-4">
                            <Item label="Trash" icon={Trash}/>
                        </PopoverTrigger>
                        <PopoverContent 
                            className="p-0 w-72"
                            side={isMobile ? "bottom" : "right"}>
                            <TrashBox />
                        </PopoverContent>
                    </Popover>
                </div>

                <div
                    onMouseDown={handleMouseDown}
                    onClick={resetWidth}
                    className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
                />
            </aside>

            <div
                ref={navbarRef}
                className={cn(
                    "absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]",
                    isResetting && "transition-all ease-in-out duration-300",
                    isMobile && "left-0 w-full"
                )}
            >
                {!!params.documentId ? (
                    <Navbar isCollapsed={isCollapsed} onResetWidth={resetWidth} />
                ) : (
                    <nav className="bg-transparent px-3 py-2 w-full">
                        {isCollapsed && (
                            <MenuIcon
                                onClick={resetWidth}
                                role="button"
                                className="h-6 w-6 text-muted-foreground"
                            />
                        )}
                    </nav>
                )}
            </div>
        </>
    );
};