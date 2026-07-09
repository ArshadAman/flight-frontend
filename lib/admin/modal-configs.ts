import type { FormField } from "@/components/admin/modals/AdminFormModal";

export const addApiFields: FormField[] = [
  { name: "name", label: "API Name", placeholder: "Enter API name" },
  { name: "type", label: "Type", type: "select", options: ["Supplier", "Agent", "Customer"], defaultValue: "Supplier" },
  { name: "provider", label: "Provider", placeholder: "e.g. Amadeus" },
  { name: "endpoint", label: "Endpoint URL", placeholder: "https://api.example.com" },
];

export const generateApiFields: FormField[] = [
  { name: "agent", label: "Agent", type: "select", options: ["Ajay Travels", "Harshit B2B", "Pranshu Agency"] },
  { name: "environment", label: "Environment", type: "select", options: ["Production", "Sandbox"], defaultValue: "Production" },
  { name: "rateLimit", label: "Rate Limit (req/min)", type: "number", defaultValue: "1000" },
];

export const addAgentFields: FormField[] = [
  { name: "agencyName", label: "Agency Name", placeholder: "Enter agency name" },
  { name: "contact", label: "Contact Person", placeholder: "Full name" },
  { name: "email", label: "Email", type: "email", placeholder: "email@agency.com" },
  { name: "phone", label: "Phone", placeholder: "+91" },
  { name: "creditLimit", label: "Credit Limit", placeholder: "₹500000" },
  { name: "gst", label: "GST Number", placeholder: "GSTIN" },
];

export const addStaffFields: FormField[] = [
  { name: "name", label: "Full Name", placeholder: "Staff name" },
  { name: "email", label: "Email", type: "email" },
  { name: "role", label: "Role", type: "select", options: ["Support Lead", "Booking Agent", "API Manager", "Finance"] },
  { name: "department", label: "Department", type: "select", options: ["Queries", "Operations", "Platform", "Accounts"] },
];

export const applyLeaveFields: FormField[] = [
  { name: "staff", label: "Staff Member", type: "select", options: ["Lokesh Kumar", "Khushi Sharma", "Pranshu Mehta"] },
  { name: "type", label: "Leave Type", type: "select", options: ["Annual Leave", "Sick Leave", "Casual Leave"] },
  { name: "from", label: "From Date", type: "text", placeholder: "YYYY-MM-DD" },
  { name: "to", label: "To Date", type: "text", placeholder: "YYYY-MM-DD" },
  { name: "reason", label: "Reason", type: "textarea", placeholder: "Optional reason..." },
];

export const addCustomerFields: FormField[] = [
  { name: "name", label: "Full Name", placeholder: "Customer name" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone", placeholder: "+91" },
  { name: "apiAccess", label: "API Access", type: "select", options: ["No", "Yes"], defaultValue: "No" },
];

export const addRoleFields: FormField[] = [
  { name: "role", label: "Role Name", placeholder: "e.g. Operations Manager" },
  { name: "modules", label: "Module Access", type: "textarea", placeholder: "Bookings, Inventory, Queries" },
];

export const blockAirlineFields: FormField[] = [
  { name: "agent", label: "Agent", type: "select", options: ["Ajay Travels", "Harshit B2B", "Lokesh Flights"] },
  { name: "airline", label: "Airline", type: "select", options: ["IndiGo", "Air India", "SpiceJet", "Vistara", "GoAir"] },
  { name: "reason", label: "Reason", type: "textarea", placeholder: "Reason for blocking..." },
];

export const blockRouteFields: FormField[] = [
  { name: "agent", label: "Agent", type: "select", options: ["Ajay Travels", "Harshit B2B"] },
  { name: "route", label: "Route", placeholder: "DEL → DXB" },
  { name: "reason", label: "Reason", type: "textarea", placeholder: "Reason for blocking..." },
];

export const promotionFields: FormField[] = [
  { name: "name", label: "Promotion Name", placeholder: "Summer Sale" },
  { name: "agent", label: "Agent", type: "select", options: ["All Agents", "Ajay Travels", "Harshit B2B"] },
  { name: "discount", label: "Discount", placeholder: "5% or ₹500" },
  { name: "validTill", label: "Valid Till", placeholder: "YYYY-MM-DD" },
];

export const discountFields: FormField[] = [
  { name: "code", label: "Discount Code", placeholder: "FLYFEST25" },
  { name: "type", label: "Type", type: "select", options: ["Percentage", "Flat"], defaultValue: "Percentage" },
  { name: "value", label: "Value", placeholder: "10 or ₹750" },
  { name: "maxUsage", label: "Max Usage", type: "number", defaultValue: "500" },
];

export const fulfillBookingFields: FormField[] = [
  { name: "pnr", label: "PNR Number", placeholder: "Enter PNR" },
  { name: "ticket", label: "Ticket Number", placeholder: "Enter ticket number" },
  { name: "notes", label: "Notes", type: "textarea", placeholder: "Fulfillment notes..." },
];

export const updateLimitFields: FormField[] = [
  { name: "agent", label: "Agent", type: "select", options: ["Ajay Travels", "Harshit B2B", "Lokesh Flights"] },
  { name: "currentLimit", label: "Current Limit", defaultValue: "₹500,000" },
  { name: "newLimit", label: "New Limit", placeholder: "₹" },
];

export const bookFlightFields: FormField[] = [
  { name: "passenger", label: "Passenger Name", placeholder: "Full name" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone", placeholder: "+91" },
  { name: "seats", label: "Number of Seats", type: "number", defaultValue: "1" },
];
