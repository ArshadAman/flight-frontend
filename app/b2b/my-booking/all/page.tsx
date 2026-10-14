"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AllBookingsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/b2b/my-booking");
  }, [router]);
  return null;
}
