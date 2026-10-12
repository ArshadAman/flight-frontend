import { redirect } from "next/navigation";

/** Legacy agent dashboard → Figma Agent Business Overview in sale panel. */
export default function AgentDashboardRedirect() {
  redirect("/sale/dashboard");
}
