"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function InventorySearchPage() {
  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader title="Supplier Inventory Search" showSearch={false} />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-slate-800">Search Flights</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">From</label>
              <Input placeholder="DEL - Delhi" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">To</label>
              <Input placeholder="BOM - Mumbai" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Departure</label>
              <Input type="date" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Return</label>
              <Input type="date" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Passengers</label>
              <Input placeholder="1 Adult" defaultValue="1 Adult" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Cabin Class</label>
              <Input placeholder="Economy" defaultValue="Economy" />
            </div>
          </div>
          <Button className="mt-6 w-full gap-2 sm:w-auto">
            <Search className="h-4 w-4" />
            Search Flights
          </Button>
        </div>
      </div>
    </div>
  );
}
