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
  { id: 3, label: "Type" },
  { id: 4, label: "Payment" },
  { id: 5, label: "Summary" },
];

export const specialRequestSteps: WizardStep[] = [
  { id: 1, label: "Booking", subtitle: "XYR9NF" },
  { id: 2, label: "Tickets" },
  { id: 3, label: "Type" },
  { id: 4, label: "Payment" },
  { id: 5, label: "Summary" },
];

export {
  agentApiProfileTabs,
  agencyInformationFields as agencyInfoFields,
  bookingManagementTabs,
} from "./figma-fields";

export type AgentApiProfileTab =
  | "Agency Information"
  | "Product"
  | "Tax Information"
  | "Bank Details"
  | "Contact Person Information";

export const bookingManagementViews = [
  { id: "all", label: "All PNRs", subtitle: "3 integrations (9 accounts)" },
  { id: "refunds", label: "Refunds PNRs", subtitle: "Refund requests" },
  { id: "cancel", label: "Cancel PNRs", subtitle: "Cancelled PNRs" },
  { id: "voided", label: "Voided PNRs", subtitle: "Voided PNRs" },
  { id: "rebooking", label: "Rebooking Request", subtitle: "Rebooking queue" },
  { id: "special", label: "Special Request", subtitle: "Special requests" },
] as const;
