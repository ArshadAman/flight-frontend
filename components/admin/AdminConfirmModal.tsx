"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalVariant = "approve" | "deny" | "confirm" | "delete";

const variantConfig: Record<
  ModalVariant,
  { title: string; description: string; confirmLabel: string; icon: React.ReactNode; confirmClass: string }
> = {
  approve: {
    title: "Approve Request",
    description: "Are you sure you want to approve this request? This action cannot be undone.",
    confirmLabel: "Approve",
    icon: <Check className="h-6 w-6 text-emerald-600" />,
    confirmClass: "bg-emerald-600 hover:bg-emerald-700",
  },
  deny: {
    title: "Deny Request",
    description: "Are you sure you want to deny this request? The user will be notified.",
    confirmLabel: "Deny",
    icon: <X className="h-6 w-6 text-red-600" />,
    confirmClass: "bg-red-600 hover:bg-red-700",
  },
  confirm: {
    title: "Confirm Action",
    description: "Please confirm you want to proceed with this action.",
    confirmLabel: "Confirm",
    icon: <AlertTriangle className="h-6 w-6 text-amber-600" />,
    confirmClass: "bg-[#006aec] hover:bg-[#006aec]/90",
  },
  delete: {
    title: "Delete Item",
    description: "This will permanently delete the item. This action cannot be undone.",
    confirmLabel: "Delete",
    icon: <X className="h-6 w-6 text-red-600" />,
    confirmClass: "bg-red-600 hover:bg-red-700",
  },
};

export function AdminConfirmModal({
  open,
  onOpenChange,
  variant = "confirm",
  title,
  description,
  confirmLabel,
  onConfirm,
  loading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: ModalVariant;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  loading?: boolean;
}) {
  const config = variantConfig[variant];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            {config.icon}
          </div>
          <DialogTitle>{title ?? config.title}</DialogTitle>
          <DialogDescription>{description ?? config.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            className={cn(config.confirmClass)}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Processing..." : (confirmLabel ?? config.confirmLabel)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
