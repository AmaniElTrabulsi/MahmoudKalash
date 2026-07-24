"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setMessage("");

    if (!username.trim() || !password) {
      setMessage(
        "Please enter username and password"
      );

      return;
    }

    setLoading(true);

    try {
      console.log(
        "Supabase URL:",
        process.env.NEXT_PUBLIC_SUPABASE_URL
      );

      console.log(
        "Starting login..."
      );

      const result =
        await supabase.rpc(
          "check_user_password",
          {
            input_username:
              username.trim(),

            input_password:
              password,
          }
        );

      console.log(
        "RPC RESULT:",
        result
      );

      if (result.error) {
        console.error(
          "DATABASE ERROR:",
          result.error
        );

        setMessage(
          `Database error: ${
            result.error.message
          }`
        );

        return;
      }

      if (!result.data) {
        setMessage(
          "Invalid username or password"
        );

        return;
      }

      console.log(
        "LOGIN SUCCESS:",
        result.data
      );

      localStorage.setItem(
        "doctor_user",
        JSON.stringify(
          result.data
        )
      );

      router.push(
        "/dashboard"
      );

    } catch (error: any) {
      console.error(
        "FULL LOGIN ERROR:",
        error
      );

      console.error(
        "ERROR MESSAGE:",
        error?.message
      );

      console.error(
        "ERROR NAME:",
        error?.name
      );

      setMessage(
        `Network error: ${
          error?.message ||
          "Load failed"
        }`
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
          Dr. Mahmoud Kalash
        </h1>


        <input
          type="text"
          autoComplete="username"
          className="
            w-full
            h-14
            bg-black
            border
            border-[#BFA15F]/30
            rounded-xl
            px-4
            mb-4
            outline-none
            focus:border-[#BFA15F]
          "
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(
              e.target.value
            )
          }
        />


        <input
          type="password"
          autoComplete="current-password"
          className="
            w-full
            h-14
            bg-black
            border
            border-[#BFA15F]/30
            rounded-xl
            px-4
            mb-4
            outline-none
            focus:border-[#BFA15F]
          "
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          onKeyDown={(e) => {

            if (
              e.key === "Enter" &&
              !loading
            ) {
              login();
            }

          }}
        />


        {message && (

          <p
            className="
              text-red-400
              text-center
              mb-4
              break-words
            "
          >
            {message}
          </p>

        )}


        <button
          onClick={login}
          disabled={loading}
          className="
            w-full
            h-14
            bg-[#BFA15F]
            text-black
            rounded-xl
            font-bold
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >

          {loading
            ? "Checking..."
            : "Login"
          }

        </button>

      </div>

    </main>
  );
}