import { redirect } from "next/navigation";

export default function RefundRedirect() {
  redirect("/admin/bookings/refund/1");
}
