"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function testSupabase() {
    setMessage("");
    setLoading(true);

    try {
      console.log("Testing Supabase connection...");

      const {
        data,
        error,
      } = await supabase
        .from("users")
        .select("id")
        .limit(1);

      console.log("TEST DATA:", data);
      console.log("TEST ERROR:", error);

      if (error) {
        setMessage(
          "Supabase error: " +
          error.message
        );

        return;
      }

      setMessage(
        "Supabase connection works!"
      );

    } catch (error: any) {
      console.error(
        "FETCH ERROR:",
        error
      );

      setMessage(
        "FETCH ERROR: " +
        (error?.message || "Failed to fetch")
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="
        min-h-screen
        bg-[#080808]
        text-white
        flex
        items-center
        justify-center
        px-4
      "
    >
      <div
        className="
          w-full
          max-w-md
          bg-[#171717]
          border
          border-[#BFA15F]/30
          rounded-2xl
          p-8
        "
      >
        <h1
          className="
            text-3xl
            text-center
            font-bold
            text-[#BFA15F]
            mb-8
          "
        >
          Supabase Connection Test
        </h1>

        <button
          onClick={testSupabase}
          disabled={loading}
          className="
            w-full
            h-14
            bg-[#BFA15F]
            text-black
            rounded-xl
            font-bold
            disabled:opacity-50
          "
        >
          {loading
            ? "Testing..."
            : "Test Supabase Connection"}
        </button>

        {message && (
          <p
            className="
              mt-6
              text-center
              break-words
              text-gray-300
            "
          >
            {message}
          </p>
        )}
      </div>
    </main>
  );
}