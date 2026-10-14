"use client";

import { useEffect, useState } from "react";
import { Plane, Coins, Contact2, Settings } from "lucide-react";
import { getPublicApiUrl } from "@/lib/apiConfig";
import { unwrapList } from "@/lib/apiEnvelope";

type Notice = {
  id: string;
  category: "airline" | "finance" | "contact" | "other";
  label: string;
  title: string;
  body: string;
};

const COLUMNS: Array<{ key: Notice["category"]; title: string; icon: typeof Plane }> = [
  { key: "airline", title: "Airline information", icon: Plane },
  { key: "finance", title: "Finance Information", icon: Coins },
  { key: "contact", title: "Contact Information", icon: Contact2 },
  { key: "other", title: "Others", icon: Settings },
];

export function NoticeBoard() {
  const [items, setItems] = useState<Notice[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    fetch(`${getPublicApiUrl()}/agents/notices/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((json) => setItems(unwrapList<Notice>(json)))
      .catch(() => setItems([]))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
        {COLUMNS.map((column) => {
          const Icon = column.icon;
          const rows = items.filter((item) => item.category === column.key);
          return (
            <div key={column.key} className="flex flex-col border border-slate-200/80 rounded-xl overflow-hidden shadow-sm bg-white min-h-[420px]">
              <div className="text-[#D60D26] font-extrabold text-[14px] py-3.5 px-5 border-b uppercase tracking-wide flex items-center gap-2">
                <Icon className="w-4 h-4 text-[#D60D26]" />
                <span>{column.title}</span>
              </div>
              <div className="p-5 flex-1 flex flex-col gap-4 text-[13px] font-semibold text-slate-700">
                {loaded && rows.length === 0 && <p className="text-slate-400">No notices.</p>}
                {rows.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    {item.label && <span className="text-[11px] font-extrabold text-[#D60D26] block mb-1">{item.label}</span>}
                    <p className="font-bold text-slate-800 mb-1">{item.title}</p>
                    <p className="text-[12.5px] leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
