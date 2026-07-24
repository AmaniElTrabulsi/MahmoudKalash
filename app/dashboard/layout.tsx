"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("doctor_user");

    if (!user) {
      router.replace("/login");
      return;
    }

    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <p className="text-[#BFA15F] text-xl">
          Checking authentication...
        </p>
      </main>
    );
  }

  return <>{children}</>;
}