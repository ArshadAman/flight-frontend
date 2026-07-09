"use client";

import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function AdminFigmaModal({
  open,
  onOpenChange,
  title,
  children,
  className,
  width = "max-w-[580px]",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  width?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "gap-0 overflow-hidden rounded-[10px] border-0 p-0 shadow-xl",
          width,
          className
        )}
      >
        <div className="relative bg-[#b3d2f9] px-7 py-5">
          <DialogTitle className="text-base font-semibold text-[#006aec]">
            {title}
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-[#006aec] text-white hover:bg-[#006aec]/90"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        {children}
      </DialogContent>
    </Dialog>
  );
}
