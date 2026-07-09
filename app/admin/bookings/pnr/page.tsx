import { redirect } from "next/navigation";
import { bookings } from "@/lib/admin/mock-data";

export default function PnrDetailsRedirect() {
  redirect(`/admin/bookings/${bookings[0].id}`);
}
