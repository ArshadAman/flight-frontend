import { redirect } from "next/navigation";
import { SALE_BOOK_SEAT_PATH } from "@/lib/sale/offlineBookFlow";

export default function SaleBookIndexPage() {
  redirect(SALE_BOOK_SEAT_PATH);
}
