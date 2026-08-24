"use client";

import { Bell } from "lucide-react";

type FlightTab = {
  name: string;
  count?: number;
};

export function OfflinePortalSubNav({
  variant,
  activeTab,
  onTabChange,
  flightTabs,
  inventoryTabs,
  onNotification,
  notificationCount = 0,
}: {
  variant: "flight" | "booking" | "inventory";
  activeTab: string;
  onTabChange: (tab: string) => void;
  flightTabs?: FlightTab[];
  inventoryTabs?: FlightTab[];
  onNotification?: () => void;
  notificationCount?: number;
}) {
  const bookingTabs = ["Upcoming", "Departed", "Travel"];
  const tabs =
    variant === "flight"
      ? flightTabs ?? [
          { name: "All booking", count: 0 },
          { name: "Pending booking", count: 0 },
          { name: "Bookable" },
          { name: "Sold Out" },
          { name: "Export" },
        ]
      : variant === "inventory"
        ? inventoryTabs ?? [
            { name: "All PNR", count: 0 },
            { name: "Open for sale", count: 0 },
          ]
        : bookingTabs.map((name) => ({ name }));

  return (
    <div className="w-full bg-gradient-to-r from-[#D60D26] to-[#121121] text-white">
      <div className="container mx-auto px-6 lg:px-10 flex justify-between items-center h-14">
        <div className="flex items-center gap-5 sm:gap-8 text-[14px] h-full overflow-x-auto whitespace-nowrap no-scrollbar flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              type="button"
              onClick={() => onTabChange(tab.name)}
              className={`relative h-full flex items-center transition-colors shrink-0 ${
                activeTab === tab.name ? "text-white font-bold" : "text-white/70 hover:text-white"
              }`}
            >
              {tab.name}
              {"count" in tab && tab.count !== undefined ? ` (${tab.count})` : ""}
              {activeTab === tab.name && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
        {(variant === "flight" || variant === "booking") && onNotification && (
          <button
            type="button"
            onClick={onNotification}
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors text-[14px] shrink-0"
          >
            <Bell className="w-4 h-4" /> Notification({notificationCount})
          </button>
        )}
      </div>
    </div>
  );
}
