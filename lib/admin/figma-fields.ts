/** Exact field labels from Figma (Agent profile / Add_agent sections) */

export const agencyInformationFields = [
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
] as const;

export const taxInformationFields = [
  "Aadhar Number",
  "PAN Number",
  "PAN Name Holder",
  "Aadhar Documents",
  "PAN Documents",
] as const;

export const bankDetailsFields = [
  "Bank Name",
  "Bank Account Number",
  "Account Number",
  "Branch Name",
  "IFSC Code",
  "Bank Documents",
] as const;

export const contactPersonFields = [
  "Name",
  "Designation",
  "Email Address",
  "Mobile Number",
  "City",
  "State",
  "Country",
  "Pincode",
  "Remark",
] as const;

export const agentApiProfileTabs = [
  "Agency Information",
  "Product",
  "Tax Information",
  "Bank Details",
  "Contact Person Information",
] as const;

export const productFields = [
  "GDS Access",
  "Inventory Type",
  "Domestic",
  "International",
  "API Enabled",
] as const;

export const bookingManagementTabs = [
  "All PNRs",
  "Refunds PNRs",
  "Cancel PNRs",
  "Voided PNRs",
  "Schedule Changes",
  "Rebooking Request",
  "Special Request",
] as const;

export const agentListTabs = ["All Agents", "Active", "Integrations Map"] as const;

export const supplierActionMarkupFields = [
  { label: "Airline type", value: "Domestic Airlines", options: ["Domestic Airlines", "International Airlines"] },
  { label: "Markup Type", value: "Percentage", options: ["Percentage", "Flat"] },
  { label: "Value", value: "2", options: ["1", "2", "3", "5", "10"] },
  { label: "Airline Name", value: "All", options: ["All"] },
  { label: "Source Type", value: "All", options: ["All"] },
] as const;

export const customerMarkupFields = [
  { label: "Airline type", value: "Domestic Airlines", options: ["Domestic Airlines", "International Airlines"] },
  { label: "Markup Type", value: "Percentage", options: ["Percentage", "Flat"] },
  { label: "Value", value: "2", options: ["1", "2", "3", "5", "10"] },
  { label: "Airline Type", value: "All", options: ["All"] },
  { label: "Source Type", value: "All", options: ["All"] },
] as const;

export const agentDiscountFields = [
  { label: "Value in %", value: "10", options: ["5", "10", "15", "20"] },
  { label: "Airline Name", value: "Percentage", options: ["Percentage", "Flat"] },
  { label: "Airline type", value: "2", options: ["1", "2", "3"] },
  { label: "Remark", value: "", type: "textarea" as const, placeholder: "Write Remark...." },
] as const;

export const supplierActionDiscountFields = [
  { label: "Value in %", value: "10", options: ["5", "10", "15", "20"] },
  { label: "Airline Name", value: "Percentage", options: ["Percentage", "Flat"] },
  { label: "Airline type", value: "2", options: ["1", "2", "3"] },
  { label: "Remark", value: "", type: "textarea" as const, placeholder: "Write Remark...." },
] as const;

export const supplierActionRemarkFields = [
  { label: "Source Type", value: "Student", options: ["Student", "Corporate", "Retail"] },
  { label: "Status", value: "Active", options: ["Active", "Inactive"] },
  { label: "Remark", value: "", type: "textarea" as const, placeholder: "Write Remark...." },
] as const;

export const supplierActionAirlineBaseFields = [
  { label: "Base Airline", value: "All", options: ["All", "Air India", "IndiGo"] },
  { label: "Base Fare Type", value: "Published", options: ["Published", "Negotiated"] },
] as const;

export const salesPromotionSalesFields = [
  { label: "Select Month", value: "May", options: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] },
  { label: "Discount %", value: "2", options: ["1", "2", "3", "5", "10"] },
  { label: "Airline Type", value: "All", options: ["All", "Domestic", "International"] },
  { label: "Airline Name", value: "All", options: ["All"] },
  {
    label: "Note for Customer",
    value: "",
    type: "textarea" as const,
    placeholder: "Write Note.... : like this sale only for May month ony please buy ticket in May month only",
  },
] as const;

export const salesPromotionTravelFields = [
  { label: "Book Before Date", value: "15 May 2026", type: "date" as const },
  { label: "Travel Before Date", value: "15 July 2026", type: "date" as const },
  { label: "Airline Type", value: "All", options: ["All", "Domestic", "International"] },
  { label: "Airline Name", value: "All", options: ["All"] },
  { label: "Discount %", value: "2", options: ["1", "2", "3", "5", "10"] },
  {
    label: "Note for Customer",
    value: "",
    type: "textarea" as const,
    placeholder: "Write Note.... : like Book ticket before this date travel before this date",
  },
] as const;
