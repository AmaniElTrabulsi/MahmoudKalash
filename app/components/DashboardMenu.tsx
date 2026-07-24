"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const links = [
    {
      name: "Dashboard",
      path: "/dashboard",
    },

    {
      name: "Calendar",
      path: "/dashboard/calendar",
    },

    {
      name: "Appointments",
      path: "/dashboard/appointments",
    },

    {
      name: "Patients",
      path: "/dashboard/patients",
    },

    {
      name: "Reminders",
      path: "/dashboard/reminders",
    },

    {
      name: "Finance",
      path: "/dashboard/finance",
    },
  ];

  return (
    <>
      {/* TOP BAR */}

      <div
        className="
        fixed
        top-0
        left-0
        right-0
        h-16
        bg-[#080808]
        border-b
        border-[#BFA15F]/20
        z-40
        flex
        items-center
        px-4
        "
      >
        <button
          onClick={() => setOpen(true)}
          className="
          bg-[#171717]
          border
          border-[#BFA15F]/40
          rounded-xl
          w-12
          h-12
          text-2xl
          "
        >
          ☰
        </button>

        <h1
          className="
          ml-4
          text-lg
          font-bold
          text-[#BFA15F]
          "
        >
          Dr. Mahmoud Kalash
        </h1>
      </div>

      {/* OVERLAY */}

      {open && (
        <div
          className="
          fixed
          inset-0
          bg-black/70
          z-40
          "
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDE MENU */}

      <div
        className={`
        fixed
        top-0
        left-0
        h-full
        w-72
        bg-[#171717]
        border-r
        border-[#BFA15F]/30
        z-50
        p-6
        transition-transform
        duration-300
        ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }
        `}
      >
        <div className="flex justify-between items-center mb-8">
          <h1
            className="
            text-2xl
            font-bold
            text-[#BFA15F]
            "
          >
            Dr. Mahmoud Kalash
          </h1>

          <button
            onClick={() => setOpen(false)}
            className="
            text-gray-400
            text-2xl
            "
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          {links.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                router.push(item.path);
                setOpen(false);
              }}
              className="
              w-full
              text-left
              px-4
              py-3
              rounded-xl
              bg-black
              border
              border-[#BFA15F]/20
              text-white
              hover:border-[#BFA15F]
              hover:text-[#BFA15F]
              transition
              "
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}