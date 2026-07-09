import { redirect } from "next/navigation";

export default function SpecialRequestRedirect() {
  redirect("/admin/bookings/special-request/1");
}
