"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center px-6">

      <div className="text-center max-w-xl">

        <h1 className="text-4xl md:text-5xl font-bold text-[#BFA15F]">
          Doctor Mahmoud Kalash
        </h1>

        <p className="mt-4 text-gray-400 text-lg">
          Medical Management System
        </p>

        <button
          onClick={() => router.push("/login")}
          className="
            mt-8
            bg-[#BFA15F]
            text-black
            px-8
            py-3
            rounded-xl
            font-bold
            hover:bg-[#D6C08A]
            transition
          "
        >
          Go to Login
        </button>

      </div>

    </main>
  );
}