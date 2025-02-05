"use client";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useSettings } from "@/hooks/use-settings";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@clerk/clerk-react";

export const SettingsModal = () => {
  const settings = useSettings();

  return (
    <Dialog open={settings.isOpen} onOpenChange={settings.onClose}>
      <DialogContent className="max-w-md gap-6">
        <DialogHeader className="border-b pb-3">
          <h2 className="text-lg font-medium">
            My settings
          </h2>
        </DialogHeader>

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-1">
            <Label>
              Appearance
            </Label>
            <span className="text-[0.8rem] text-muted-foreground">
              Change your theme
            </span>
          </div>
          <ModeToggle />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-1">
            <Label>
              User Settings
            </Label>
            <span className="text-[0.8rem] text-muted-foreground">
              Profile settings
            </span>
          </div>
          <div className="relative z-[99999]">
            <UserButton
              appearance={{
                elements: {
                  rootBox: "relative z-[99999]",
                  userButtonPopoverCard: "relative z-[99999]",
                  userButtonPopoverActions: "relative z-[99999]",
                  userButtonPopover: "relative z-[99999]"
                }
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};