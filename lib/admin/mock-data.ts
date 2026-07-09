import type { AdminStatus } from "./types";

export const dashboardStats = {
  totalBookings: 12847,
  totalRevenue: 48200000,
  activeAgents: 156,
  pendingQueries: 23,
  apiCalls: 2840000,
  conversionRate: 3.8,
};

export const revenueByMonth = [
  { month: "Jan", value: 320 },
  { month: "Feb", value: 380 },
  { month: "Mar", value: 410 },
  { month: "Apr", value: 390 },
  { month: "May", value: 450 },
  { month: "Jun", value: 520 },
  { month: "Jul", value: 480 },
];

export const bookingsByAirline = [
  { airline: "IndiGo", bookings: 4200, share: 32 },
  { airline: "Air India", bookings: 3100, share: 24 },
  { airline: "SpiceJet", bookings: 2100, share: 16 },
  { airline: "Vistara", bookings: 1800, share: 14 },
  { airline: "Others", bookings: 1800, share: 14 },
];

export const agents = [
  { id: "AGT-001", name: "Ajay Travels", email: "ajay@travels.com", phone: "+91 98765 43210", status: "active" as AdminStatus, balance: 245000, bookings: 342, joined: "2024-03-12" },
  { id: "AGT-002", name: "Harshit B2B", email: "harshit@b2b.com", phone: "+91 98765 43211", status: "active" as AdminStatus, balance: 189000, bookings: 278, joined: "2024-05-20" },
  { id: "AGT-003", name: "Khushi Tours", email: "khushi@tours.in", phone: "+91 98765 43212", status: "pending" as AdminStatus, balance: 0, bookings: 0, joined: "2025-01-08" },
  { id: "AGT-004", name: "Pranshu Agency", email: "pranshu@agency.com", phone: "+91 98765 43213", status: "active" as AdminStatus, balance: 92000, bookings: 156, joined: "2024-08-15" },
  { id: "AGT-005", name: "Lokesh Flights", email: "lokesh@flights.com", phone: "+91 98765 43214", status: "inactive" as AdminStatus, balance: 12000, bookings: 45, joined: "2023-11-02" },
];

export const staffMembers = [
  { id: "STF-001", name: "Lokesh Kumar", role: "Support Lead", department: "Queries", status: "active" as AdminStatus, email: "lokesh@fyrefly.com", phone: "+91 90000 11111" },
  { id: "STF-002", name: "Khushi Sharma", role: "Booking Agent", department: "Operations", status: "active" as AdminStatus, email: "khushi@fyrefly.com", phone: "+91 90000 22222" },
  { id: "STF-003", name: "Pranshu Mehta", role: "API Manager", department: "Platform", status: "active" as AdminStatus, email: "pranshu@fyrefly.com", phone: "+91 90000 33333" },
  { id: "STF-004", name: "Harshit Singh", role: "Finance", department: "Accounts", status: "active" as AdminStatus, email: "harshit@fyrefly.com", phone: "+91 90000 44444" },
];

export const customers = [
  { id: "CUS-001", name: "Harshit B2C", email: "harshit.b2c@gmail.com", phone: "+91 88888 11111", status: "active" as AdminStatus, bookings: 12, apiAccess: true },
  { id: "CUS-002", name: "Rahul Verma", email: "rahul.v@gmail.com", phone: "+91 88888 22222", status: "active" as AdminStatus, bookings: 5, apiAccess: false },
  { id: "CUS-003", name: "Priya Nair", email: "priya.n@gmail.com", phone: "+91 88888 33333", status: "pending" as AdminStatus, bookings: 0, apiAccess: false },
];

export const apiIntegrations = [
  { id: "API-001", name: "Amadeus GDS", type: "Supplier", provider: "Amadeus", status: "approved" as AdminStatus, requests: 12400, lastSync: "2 min ago" },
  { id: "API-002", name: "Sabre Connect", type: "Supplier", provider: "Sabre", status: "approved" as AdminStatus, requests: 8900, lastSync: "5 min ago" },
  { id: "API-003", name: "TravelPort", type: "Supplier", provider: "TravelPort", status: "pending" as AdminStatus, requests: 0, lastSync: "Never" },
  { id: "API-004", name: "Ajay Travels API", type: "Agent", provider: "Ajay Travels", status: "approved" as AdminStatus, requests: 3200, lastSync: "1 min ago" },
  { id: "API-005", name: "B2C Public API", type: "Customer", provider: "FyreFly", status: "approved" as AdminStatus, requests: 15600, lastSync: "30 sec ago" },
];

export const supplierRequests = [
  { id: "SR-001", supplier: "SkyLink Aviation", contact: "Rajesh Patel", email: "rajesh@skylink.com", status: "pending" as AdminStatus, submitted: "2025-07-05", inventory: 120 },
  { id: "SR-002", supplier: "CloudWings", contact: "Meera Joshi", email: "meera@cloudwings.in", status: "approved" as AdminStatus, submitted: "2025-06-28", inventory: 85 },
  { id: "SR-003", supplier: "JetStream India", contact: "Vikram Rao", email: "vikram@jetstream.com", status: "denied" as AdminStatus, submitted: "2025-06-20", inventory: 0 },
];

export const bookings = [
  { id: "BK-88421", pnr: "X7K9M2", passenger: "Amit Sharma", route: "DEL → BOM", airline: "IndiGo", date: "2025-07-15", amount: 8450, status: "approved" as AdminStatus },
  { id: "BK-88422", pnr: "P3N8L1", passenger: "Sneha Reddy", route: "BLR → HYD", airline: "Air India", date: "2025-07-18", amount: 6200, status: "pending" as AdminStatus },
  { id: "BK-88423", pnr: "Q5R2T9", passenger: "Vikram Patel", route: "MAA → CCU", airline: "SpiceJet", date: "2025-07-20", amount: 5100, status: "approved" as AdminStatus },
  { id: "BK-88424", pnr: "W8Y4H6", passenger: "Neha Gupta", route: "DEL → GOI", airline: "Vistara", date: "2025-07-22", amount: 9800, status: "closed" as AdminStatus },
];

export const queries = [
  { id: "QRY-001", subject: "Refund not processed", customer: "Amit Sharma", agent: "Ajay Travels", status: "open" as AdminStatus, priority: "High", created: "2025-07-08", assignee: "Lokesh" },
  { id: "QRY-002", subject: "API key not working", customer: "Harshit B2C", agent: "-", status: "open" as AdminStatus, priority: "Medium", created: "2025-07-07", assignee: "Pranshu" },
  { id: "QRY-003", subject: "Booking confirmation delay", customer: "Priya Nair", agent: "Khushi Tours", status: "closed" as AdminStatus, priority: "Low", created: "2025-07-05", assignee: "Khushi" },
];

export const depositRequests = [
  { id: "DEP-001", agent: "Ajay Travels", amount: 50000, method: "NEFT", status: "pending" as AdminStatus, date: "2025-07-09", ref: "UTR123456789" },
  { id: "DEP-002", agent: "Harshit B2B", amount: 25000, method: "UPI", status: "approved" as AdminStatus, date: "2025-07-08", ref: "UPI987654321" },
  { id: "DEP-003", agent: "Pranshu Agency", amount: 100000, method: "RTGS", status: "pending" as AdminStatus, date: "2025-07-07", ref: "RTGS456789012" },
];

export const creditAccounts = [
  { id: "ACC-001", agent: "Ajay Travels", creditLimit: 500000, used: 245000, available: 255000, status: "active" as AdminStatus },
  { id: "ACC-002", agent: "Harshit B2B", creditLimit: 300000, used: 189000, available: 111000, status: "active" as AdminStatus },
  { id: "ACC-003", agent: "Lokesh Flights", creditLimit: 100000, used: 88000, available: 12000, status: "active" as AdminStatus },
];

export const holidays = [
  { id: "HL-001", staff: "Lokesh Kumar", type: "Annual Leave", from: "2025-07-20", to: "2025-07-25", days: 5, status: "approved" as AdminStatus },
  { id: "HL-002", staff: "Khushi Sharma", type: "Sick Leave", from: "2025-07-10", to: "2025-07-11", days: 2, status: "pending" as AdminStatus },
  { id: "HL-003", staff: "Pranshu Mehta", type: "Casual Leave", from: "2025-08-01", to: "2025-08-02", days: 2, status: "approved" as AdminStatus },
];

export const inventoryFlights = [
  { id: "FLT-001", airline: "IndiGo", flight: "6E-204", route: "DEL → BOM", departure: "2025-07-15 06:00", seats: 42, price: 4200, cabin: "Economy" },
  { id: "FLT-002", airline: "Air India", flight: "AI-131", route: "BLR → DEL", departure: "2025-07-16 14:30", seats: 18, price: 6800, cabin: "Economy" },
  { id: "FLT-003", airline: "Vistara", flight: "UK-945", route: "BOM → GOI", departure: "2025-07-17 09:15", seats: 8, price: 5400, cabin: "Premium" },
];

export const permissions = [
  { role: "Super Admin", users: 2, modules: "All", lastUpdated: "2025-06-01" },
  { role: "Operations Manager", users: 4, modules: "Bookings, Inventory, Queries", lastUpdated: "2025-06-15" },
  { role: "Finance Admin", users: 3, modules: "Balance, Accounts, Deposits", lastUpdated: "2025-05-20" },
  { role: "API Manager", users: 2, modules: "API, Platform", lastUpdated: "2025-07-01" },
];

export const agentMarkups = [
  { agent: "Ajay Travels", domestic: "2.5%", international: "3.0%", serviceFee: "₹150", status: "active" as AdminStatus },
  { agent: "Harshit B2B", domestic: "2.0%", international: "2.5%", serviceFee: "₹100", status: "active" as AdminStatus },
  { agent: "Pranshu Agency", domestic: "3.0%", international: "3.5%", serviceFee: "₹200", status: "active" as AdminStatus },
];

export const blockedAirlines = [
  { agent: "Lokesh Flights", airline: "SpiceJet", reason: "Payment default", blockedOn: "2025-05-10" },
  { agent: "Pranshu Agency", airline: "GoAir", reason: "Contract expired", blockedOn: "2025-06-01" },
];

export const blockedRoutes = [
  { agent: "Ajay Travels", route: "DEL → DXB", reason: "Regulatory", blockedOn: "2025-04-15" },
  { agent: "Harshit B2B", route: "BOM → LHR", reason: "Capacity limit", blockedOn: "2025-05-22" },
];

export const promotions = [
  { id: "PROMO-001", name: "Summer Sale", agent: "All Agents", discount: "5%", validTill: "2025-08-31", status: "active" as AdminStatus },
  { id: "PROMO-002", name: "Weekend Special", agent: "Ajay Travels", discount: "₹500 flat", validTill: "2025-07-31", status: "active" as AdminStatus },
];

export const discounts = [
  { id: "DISC-001", code: "FLYFEST25", type: "Percentage", value: "10%", usage: 142, maxUsage: 500, status: "active" as AdminStatus },
  { id: "DISC-002", code: "NEWUSER", type: "Flat", value: "₹750", usage: 89, maxUsage: 200, status: "active" as AdminStatus },
];
