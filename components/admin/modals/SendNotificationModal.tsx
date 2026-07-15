"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function SendNotificationModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden border-0 p-0 sm:rounded-xl [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between bg-[#e6f0ff] px-5 py-3">
          <DialogTitle className="text-base font-semibold text-[#006aec]">
            Send Notification
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full bg-[#006aec]/15 p-1 text-[#006aec]"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        <div className="space-y-5 px-5 py-5">
          <p className="text-sm leading-relaxed text-slate-600">
            In this Request Supplier change the Schedule of{" "}
            <strong>PNR:23124 and flight no AI 121</strong> time change{" "}
            <strong>Old flight time 22, Dec 2021 &apos;12:30PM&apos;</strong> to{" "}
            <strong>New Flight time 22, Dec 2021 &apos;4:30PM&apos;</strong> sorry for
            the inconvenience. Please confirm this and send to users. Thank you !
          </p>
          <Button
            className="h-11 w-full bg-[#006aec] hover:bg-[#006aec]/90"
            onClick={() => onOpenChange(false)}
          >
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
