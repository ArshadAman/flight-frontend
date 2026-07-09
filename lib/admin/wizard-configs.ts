export interface WizardStep {
  id: number;
  label: string;
  subtitle?: string;
}

export const rebookingSteps: WizardStep[] = [
  { id: 1, label: "Booking", subtitle: "XYR9NF" },
  { id: 2, label: "Tickets" },
  { id: 3, label: "Reason" },
  { id: 4, label: "Details" },
  { id: 5, label: "Request/order" },
];

export const refundSteps: WizardStep[] = [
  { id: 1, label: "Booking", subtitle: "XYR9NF" },
  { id: 2, label: "Tickets" },
  { id: 3, label: "Refund Type" },
  { id: 4, label: "Amount" },
  { id: 5, label: "Reason" },
  { id: 6, label: "Confirm" },
];

export const specialRequestSteps: WizardStep[] = [
  { id: 1, label: "Booking", subtitle: "XYR9NF" },
  { id: 2, label: "Passenger" },
  { id: 3, label: "Request Type" },
  { id: 4, label: "Details" },
  { id: 5, label: "Attachments" },
  { id: 6, label: "Submit" },
];

export const agentApiProfileTabs = [
  "Agency Information",
  "Product",
  "Tax Information",
  "Bank Details",
  "Contact Person Information",
] as const;

export type AgentApiProfileTab = (typeof agentApiProfileTabs)[number];

export const agencyInfoFields = [
  "AgentID",
  "AgentName",
  "Company Name",
  "Brand Name",
  "Register Address",
  "Operation Center",
  "Company Reg. No.",
  "Vat no.",
  "Mobile No. / office No.",
  "Account Email",
  "Marketing Email",
  "Operational Email",
  "Login Id",
  "Class",
  "Currency",
  "Add Role",
];

export const bookingManagementViews = [
  { id: "all", label: "All Bookings", subtitle: "3 integrations (9 accounts)" },
  { id: "assigned", label: "Assigned", subtitle: "Bookings assigned to agents" },
  { id: "fulfillment", label: "Fulfillment", subtitle: "Pending fulfillment actions" },
] as const;
