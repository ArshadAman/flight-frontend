"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BlockAirlinesModal } from "@/components/admin/modals";
import { Button } from "@/components/ui/button";

export default function BlockAirlinesPage() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex min-h-full flex-col bg-white">
      <AdminPageHeader title="Block Airlines" showSearch={false} showFilter={false} />
      <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
        <p className="max-w-md text-sm text-slate-500">
          Select airlines to hide from For Sale and search. This matches the Agent API “Select Airlines” modal.
        </p>
        <Button className="mt-4 bg-[#006aec] hover:bg-[#006aec]/90" onClick={() => setOpen(true)}>
          Select Airlines
        </Button>
      </div>
      <BlockAirlinesModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
