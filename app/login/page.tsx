"use client";

import { useState } from "react";

export default function LoginPage() {
  const [message, setMessage] = useState("");

  function testEnvironment() {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    setMessage(
      JSON.stringify(
        {
          url: supabaseUrl || "MISSING",
          keyExists: !!supabaseKey,
          keyLength: supabaseKey?.length || 0,
        },
        null,
        2
      )
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#080808",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          background: "#171717",
          padding: "30px",
          borderRadius: "16px",
        }}
      >
        <h1>
          Environment Test
        </h1>

        <button
          onClick={testEnvironment}
          style={{
            width: "100%",
            padding: "15px",
            marginTop: "20px",
            background: "#BFA15F",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
          }}
        >
          Check Environment Variables
        </button>

        <pre
          style={{
            marginTop: "20px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {message}
        </pre>
      </div>
    </main>
  );
}