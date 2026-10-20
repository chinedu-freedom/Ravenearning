"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Lucky Spin functionality has been disabled/removed as requested.
export default function SpinPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return null;
}
