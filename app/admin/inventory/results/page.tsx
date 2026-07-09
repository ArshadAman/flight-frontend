"use client";

import { useState } from "react";
import { AdminListPage } from "@/components/admin/AdminListPage";
import { AdminFormModal } from "@/components/admin/modals/AdminFormModal";
import { inventoryFlights } from "@/lib/admin/mock-data";
import { bookFlightFields } from "@/lib/admin/modal-configs";
import { Button } from "@/components/ui/button";

export default function InventoryResultsPage() {
  const [bookOpen, setBookOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<string>();

  return (
    <AdminListPage
      title="Supplier Inventory Results"
      subtitle="DEL → BOM · 15 Jul 2025 · 3 flights found"
      tabs={["All", "Economy", "Premium", "Business"]}
      keyField="id"
      data={inventoryFlights}
      columns={[
        { key: "airline", header: "Airline" },
        { key: "flight", header: "Flight" },
        { key: "route", header: "Route" },
        { key: "departure", header: "Departure" },
        { key: "cabin", header: "Cabin" },
        { key: "seats", header: "Seats" },
        {
          key: "price",
          header: "Price",
          render: (r) => `₹${r.price}`,
        },
        {
          key: "action",
          header: "",
          render: (r) => (
            <Button
              size="sm"
              className="h-8"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFlight(`${r.airline} ${r.flight}`);
                setBookOpen(true);
              }}
            >
              Book
            </Button>
          ),
        },
      ]}
    >
      <AdminFormModal
        open={bookOpen}
        onOpenChange={setBookOpen}
        title={`Book Flight${selectedFlight ? `: ${selectedFlight}` : ""}`}
        fields={bookFlightFields}
        submitLabel="Book Now"
      />
    </AdminListPage>
  );
}
