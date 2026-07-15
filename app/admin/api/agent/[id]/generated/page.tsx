"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { agents } from "@/lib/admin/mock-data";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Download, ExternalLink, Filter, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const leftLinks = [
  { label: "Name of Suppliers Activate", value: "Add Supplier", href: "/admin/agents/suppliers" },
  { label: "Block Airlines", value: "Select Airlines", href: "/admin/agents/block-airlines" },
  { label: "Block Route", value: "Select Route", href: "/admin/agents/block-routes" },
  { label: "Updated Markup", value: "Add Markup", href: "/admin/agents/markup" },
  { label: "Updated Discount", value: "Add Discount", href: "/admin/agents/discounts" },
  { label: "Sales Promotion", value: "Add", href: "/admin/agents/promotions" },
];

export default function AgentApiGeneratedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const agent = agents.find((a) => a.id === id);
  if (!agent) notFound();

  const first = agent.name.split(" ")[0].toUpperCase();

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-[#e8ebef] bg-white px-6 py-5">
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/admin/api/agent/${id}`} className="rounded p-1 text-slate-500 hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-[#1c304a]">{first}_API Generated</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 border-[#e8ebef] text-slate-600">
              <Calendar className="h-4 w-4" />
              Last 24 hours
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 border-[#e8ebef]">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 border-[#e8ebef]">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 border-[#e8ebef]">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="grid flex-1 gap-8 p-6 lg:grid-cols-2">
          <div className="space-y-4">
            {[
              ["AgentID", "23853"],
              ["AgentName", agent.name],
              ["Agency Name", "Wordlight"],
              ["API Type", "Flight"],
              ["API key", "#1212VC"],
              ["Updated Date", "24, Dec 2021"],
            ].map(([label, value]) => (
              <Row key={label} label={label} value={value} />
            ))}
            <Row label="No. of Supplier Activate" value="Flight" />
            {leftLinks.map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-sm">
                <span className="w-52 text-slate-500">{item.label}</span>
                <span className="text-slate-300">→</span>
                <Link href={item.href} className="font-medium text-[#006aec] hover:underline">
                  {item.value}
                </Link>
              </div>
            ))}
          </div>

          <div className="space-y-5 border-l border-[#e8ebef] pl-8">
            <div>
              <p className="mb-2 text-sm text-slate-500">Generated API</p>
              <div className="inline-flex rounded-full border border-[#e8ebef] p-0.5">
                <button
                  type="button"
                  className={cn("rounded-full bg-[#006aec] px-4 py-1.5 text-xs font-medium text-white")}
                >
                  Automatic
                </button>
                <button type="button" className="rounded-full px-4 py-1.5 text-xs font-medium text-slate-500">
                  Self
                </button>
              </div>
            </div>
            <Row label="Pass Code" value="arn:aws:iam::7521635:identity" />
            <div className="flex items-center gap-3 text-sm">
              <span className="w-28 text-slate-500">Link</span>
              <span className="text-slate-300">→</span>
              <a href="#" className="inline-flex items-center gap-1 font-medium text-[#006aec]">
                treaddeal.flight.com/APIns..
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <Row label="API ID" value="1241325ABHA" />
            <Row label="API KEY" value="#1212VC" />
          </div>
        </div>

        <div className="flex gap-3 border-t border-[#e8ebef] bg-white px-6 py-4">
          <Button variant="outline" className="border-[#006aec] text-[#006aec]" asChild>
            <Link href={`/admin/api/agent/${id}`}>Cancel</Link>
          </Button>
          <Button className="flex-1 bg-[#006aec] hover:bg-[#006aec]/90">Send To The Agent</Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-52 shrink-0 text-slate-500 sm:w-28">{label}</span>
      <span className="hidden text-slate-300 sm:inline">→</span>
      <span className="font-medium text-[#1c304a]">{value}</span>
    </div>
  );
}
