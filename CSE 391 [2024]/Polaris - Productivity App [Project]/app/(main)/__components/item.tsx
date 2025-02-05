"use client"
import { Skeleton } from "@/components/ui/skeleton";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, LucideIcon, MoreHorizontal, Plus, Trash } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { 
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenu
} from "@/components/ui/dropdown-menu";

interface ItemProps {
    id?: Id<"documents">;
    documentIcon?: string;
    active?: boolean;
    expanded?: boolean;
    isSearch?: boolean;
    level?: number;
    onExpand?: () => void;
    label: string;
    onClick?: () => void;
    icon: LucideIcon;
}

export const Item = ({
    id,
    label,
    onClick,
    icon: Icon,
    active,
    documentIcon,
    isSearch,
    level = 0,
    onExpand,
    expanded,
}: ItemProps) => {
    const { user } = useUser();
    const router = useRouter();
    const create = useMutation(api.documents.create);
    const archive = useMutation(api.documents.archiveDocument);
    const childDocumentsCount = useQuery(api.documents.getNestedDocumentsCount, {
        parentDocument: id || undefined
    });

    const handleExpand = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        event.stopPropagation();
        onExpand?.();
    };

    const onArchive = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation();
        if (!id) return;
        const promise = archive({ id }).then(() => {
            router.push("/documents");
        });
        toast.promise(promise, {
            loading: "Moving To Trash...",
            success: "Note Moved To Trash",
            error: "Failed To Move To Trash",
        });
    };

    const onCreate = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation();

        if (!id || childDocumentsCount === undefined || childDocumentsCount >= 3) {
            if (childDocumentsCount !== undefined && childDocumentsCount >= 3) {
                toast.error("Maximum of 3 child documents allowed");
            }
            return;
        }

        const promise = create({ title: "Untitled", parentDocument: id }).then(
            (documentId) => {
                if (!expanded) {
                    onExpand?.();
                }
                router.push(`/documents/${documentId}`)
            }
        );

        toast.promise(promise, {
            loading: "Creating a new note...",
            success: "New note created!",
            error: "Failed to create a new note.",
        });
    };

    const ChevronIcon = expanded ? ChevronDown : ChevronRight;

    return (
        <div
            onClick={onClick}
            role="button"
            style={{ paddingLeft: level ? `${(level * 12)}px` : "12px" }}
            className={cn("group min-h-[27px] text-sm px-3 py-1 pr-3 w-full hover:bg-primary/5 flex items-center text-muted-foreground font-medium mb-2",
                active && "bg-primary/5 text-primary")}
        >
            {!!id && childDocumentsCount !== undefined && childDocumentsCount > 0 && (
                <div
                    role="button"
                    className="h-full rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 mr-1"
                    onClick={handleExpand}>
                    <ChevronIcon
                        className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                </div>
            )}

            {documentIcon ? (
                <div className="h-5 w-5 mr-2 text-muted-foreground">
                    {documentIcon}
                </div>
            ) : (
                <Icon className="h-5 w-5 mr-2 " />
            )}

            <span className="truncate">{label}</span>

            {isSearch && (
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted
                                px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span>Ctrl</span>k
                </kbd>
            )}

            {!!id && (
                <div className="ml-auto flex items-center gap-x-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            onClick={(e) => e.stopPropagation()}
                            asChild>
                            <div
                                role="button"
                                className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-60"
                            align="start"
                            side="right"
                            forceMount>
                            <DropdownMenuItem onClick={onArchive}>
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <div className="text-xs text-muted-foreground p-2">
                                Last Edited by: {user?.fullName}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {childDocumentsCount !== undefined && childDocumentsCount < 3 && (
                        <div
                            role="button"
                            onClick={onCreate}
                            className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600">
                            <Plus className="h-4 w-4 text-muted-foreground" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

Item.Skeleton = function ItemSkeleton({ level }: { level?: number } = {}) {
    return (
        <div
            style={{ paddingLeft: level ? `${level * 12 + 15}px` : "12px" }}
            className="flex gap-x-2 p-y-[3px]"
        >
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-[30%]" />
        </div>
    );
};