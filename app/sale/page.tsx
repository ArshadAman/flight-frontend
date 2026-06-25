import { redirect } from "next/navigation";

export default function SaleRedirect() {
    redirect("/sale/inventory");
}
