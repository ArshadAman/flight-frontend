"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { fetchGroupBookings } from "@/lib/b2b/groupBookings";

const LINKS = [
  { href: "/b2b/my-booking", label: "All booking", count: "all" as const },
  { href: "/b2b/my-booking?open=1", label: "Open booking", count: "open" as const },
  { href: "/b2b/my-booking/re-booking", label: "Re-booking" },
  { href: "/b2b/my-booking/refund", label: "Refund" },
  { href: "/b2b/my-booking/import-pnr", label: "Import PNR" },
  { href: "/b2b/my-booking/download", label: "Ticket Download" },
  { href: "/b2b/my-booking/prints", label: "Ticket Print/shares" },
];

export function BookingSubnav() {
  const pathname = usePathname();
  const [counts, setCounts] = useState({ all: 0, open: 0 });

  useEffect(() => {
    fetchGroupBookings().then((rows) => {
      const open = rows.filter((row) => !["COMPLETED", "TICKETED"].includes(row.status)).length;
      setCounts({ all: rows.length, open });
    });
  }, []);

  return (
    <div className="bg-[#2a1020] text-white">
      <div className="container mx-auto flex items-center gap-6 overflow-x-auto px-4 py-3 text-sm font-semibold">
        {LINKS.map((link) => {
          const path = link.href.split("?")[0];
          const active = pathname === path;
          const suffix = link.count ? ` (${counts[link.count]})` : "";
          return (
            <Link
              key={link.href}
              href={link.href}
              className={active ? "text-white underline underline-offset-8 decoration-2" : "text-white/80 hover:text-white"}
            >
              {link.label}
              {suffix}
            </Link>
          );
        })}
        <span className="ml-auto flex items-center gap-2 whitespace-nowrap text-white/80">
          <Bell className="h-4 w-4" /> Notification(0)
        </span>
      </div>
    </div>
  );
}
