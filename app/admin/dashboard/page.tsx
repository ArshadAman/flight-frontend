"use client";

import {
  IndianRupee,
  Plane,
  Users,
  MessageSquare,
  TrendingUp,
  Activity,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { AdminBarChart, AdminDonutChart } from "@/components/admin/AdminCharts";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import {
  dashboardStats,
  revenueByMonth,
  bookingsByAirline,
  bookings,
} from "@/lib/admin/mock-data";
import { AdminBadge } from "@/components/admin/AdminBadge";

export default function BusinessOverviewPage() {
  return (
    <div className="flex min-h-full flex-col">
      <AdminPageHeader title="Business Overview" showSearch={false} />
      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <AdminStatCard
            title="Total Bookings"
            value={dashboardStats.totalBookings.toLocaleString()}
            icon={Plane}
            trend={{ value: "12.5% vs last month", positive: true }}
          />
          <AdminStatCard
            title="Revenue"
            value={`₹${(dashboardStats.totalRevenue / 100000).toFixed(1)}L`}
            icon={IndianRupee}
            trend={{ value: "8.2% vs last month", positive: true }}
          />
          <AdminStatCard
            title="Active Agents"
            value={String(dashboardStats.activeAgents)}
            icon={Users}
            trend={{ value: "3 new this month", positive: true }}
          />
          <AdminStatCard
            title="Open Queries"
            value={String(dashboardStats.pendingQueries)}
            icon={MessageSquare}
          />
          <AdminStatCard
            title="API Calls"
            value={`${(dashboardStats.apiCalls / 1000000).toFixed(1)}M`}
            icon={Activity}
            trend={{ value: "15% vs last month", positive: true }}
          />
          <AdminStatCard
            title="Conversion Rate"
            value={`${dashboardStats.conversionRate}%`}
            icon={TrendingUp}
            trend={{ value: "0.4% vs last month", positive: true }}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Revenue Trend</h3>
            <AdminBarChart
              data={revenueByMonth.map((m) => ({
                label: m.month,
                value: m.value,
              }))}
            />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Bookings by Airline</h3>
            <AdminDonutChart
              segments={bookingsByAirline.map((a, i) => ({
                label: a.airline,
                value: a.share,
                color: ["#D60D26", "#2563EB", "#F59E0B", "#10B981", "#8B5CF6"][i],
              }))}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-slate-800">Recent Bookings</h3>
          <AdminDataTable
            keyField="id"
            data={bookings}
            columns={[
              { key: "id", header: "Booking ID" },
              { key: "pnr", header: "PNR" },
              { key: "passenger", header: "Passenger" },
              { key: "route", header: "Route" },
              { key: "airline", header: "Airline" },
              { key: "amount", header: "Amount", render: (r) => `₹${r.amount}` },
              {
                key: "status",
                header: "Status",
                render: (r) => <AdminBadge status={r.status} />,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
