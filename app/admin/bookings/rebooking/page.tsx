import { redirect } from "next/navigation";

export default function RebookingRedirect() {
  redirect("/admin/bookings/rebooking/1");
}
