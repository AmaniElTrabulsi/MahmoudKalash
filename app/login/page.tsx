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
      const {
        data,
        error,
      } = await supabase.rpc(
        "check_user_password",
        {
          input_username:
            username.trim(),

          input_password:
            password,
        }
      );

      console.log(
        "LOGIN DATA:",
        data
      );

      console.log(
        "LOGIN ERROR:",
        error
      );

      if (error) {
        console.error(
          "LOGIN DATABASE ERROR:",
          error
        );

        setMessage(
          `Database error: ${
            error.message
          }`
        );

        return;
      }

      if (!data) {
        setMessage(
          "Invalid username or password"
        );

        return;
      }

      localStorage.setItem(
        "doctor_user",
        JSON.stringify(data)
      );

      router.push(
        "/dashboard"
      );

    } catch (error: any) {
      console.error(
        "NETWORK ERROR:",
        error
      );

      setMessage(
        `Network error: ${
          error?.message ||
          "Failed to connect to database"
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

        <p
          className="
            text-center
            text-gray-500
            text-sm
            mb-6
          "
        >
          Medical Management System
        </p>

        <input
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
            if (e.key === "Enter") {
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
          "
        >
          {loading
            ? "Checking..."
            : "Login"}
        </button>

      </div>

    </main>
  );
}