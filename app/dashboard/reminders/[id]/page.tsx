"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

export default function ReminderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [reminder, setReminder] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [reminderDate, setReminderDate] =
    useState("");

  const [reminderTime, setReminderTime] =
    useState("");

  const [reminderType, setReminderType] =
    useState("");

  const [status, setStatus] =
    useState("Pending");

  useEffect(() => {
    if (id) {
      loadReminder();
    }
  }, [id]);

  async function loadReminder() {
    setLoading(true);

    const { data, error } =
      await supabase
        .from("reminders")
        .select(`
          *,
          patients (
            id,
            first_name,
            last_name,
            patient_number
          )
        `)
        .eq("id", id)
        .single();

    if (error) {
      console.error(error);
      alert(error.message);
      setLoading(false);
      return;
    }

    setReminder(data);

    setTitle(data.title || "");
    setMessage(data.message || "");
    setReminderDate(
      data.reminder_date || ""
    );
    setReminderTime(
      data.reminder_time
        ? data.reminder_time.substring(
            0,
            5
          )
        : ""
    );
    setReminderType(
      data.reminder_type || ""
    );
    setStatus(
      data.status || "Pending"
    );

    setLoading(false);
  }

  async function saveChanges() {
    if (!title.trim()) {
      alert("Please enter a reminder title");
      return;
    }

    if (!reminderDate) {
      alert("Please select a reminder date");
      return;
    }

    setSaving(true);

    const { error } =
      await supabase
        .from("reminders")
        .update({

          title,

          message:
            message || null,

          reminder_date:
            reminderDate,

          reminder_time:
            reminderTime || null,

          reminder_type:
            reminderType || null,

          status,

        })
        .eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      setSaving(false);
      return;
    }

    alert(
      "Reminder updated successfully"
    );

    setSaving(false);

    await loadReminder();
  }

  async function deleteReminder() {
    const confirmed =
      confirm(
        "Are you sure you want to delete this reminder?"
      );

    if (!confirmed) {
      return;
    }

    const { error } =
      await supabase
        .from("reminders")
        .delete()
        .eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    router.push(
      "/dashboard/reminders"
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <DashboardMenu />
        Loading Reminder...
      </main>
    );
  }

  if (!reminder) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        Reminder not found
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white p-6 pt-32">

      <DashboardMenu />

      <div className="max-w-3xl mx-auto">

        <button
          onClick={() =>
            router.push(
              "/dashboard/reminders"
            )
          }
          className="text-[#BFA15F] mb-6"
        >
          ← Back to Reminders
        </button>

        <div className="flex justify-between items-center flex-wrap gap-4 mb-8">

          <h1 className="text-3xl font-bold text-[#BFA15F]">
            Edit Reminder
          </h1>

          <button
            onClick={deleteReminder}
            className="bg-red-600 text-white px-5 py-3 rounded-xl font-bold"
          >
            Delete
          </button>

        </div>

        {reminder.patients && (

          <div className="mb-6 bg-[#171717] border border-[#BFA15F]/30 rounded-xl p-5">

            <p className="text-gray-400">
              Patient
            </p>

            <p className="text-xl font-bold mt-1">

              {reminder.patients.first_name}{" "}

              {reminder.patients.last_name}

            </p>

            <p className="text-[#BFA15F] mt-1">

              Patient ID:{" "}

              {reminder.patients.patient_number}

            </p>

            <button
              onClick={() =>
                router.push(
                  `/dashboard/patients/${reminder.patients.id}`
                )
              }
              className="text-[#BFA15F] underline mt-3"
            >
              Open Patient
            </button>

          </div>

        )}

        <div className="bg-[#171717] border border-[#BFA15F]/30 rounded-xl p-6 space-y-5">

          <div>

            <label className="block mb-2">
              Title *
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="w-full bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
            />

          </div>

          <div>

            <label className="block mb-2">
              Message
            </label>

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              className="w-full h-32 bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
            />

          </div>

          <div className="grid md:grid-cols-2 gap-5">

            <div>

              <label className="block mb-2">
                Date
              </label>

              <input
                type="date"
                value={reminderDate}
                onChange={(e) =>
                  setReminderDate(
                    e.target.value
                  )
                }
                className="w-full bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
              />

            </div>

            <div>

              <label className="block mb-2">
                Time
              </label>

              <input
                type="time"
                value={reminderTime}
                onChange={(e) =>
                  setReminderTime(
                    e.target.value
                  )
                }
                className="w-full bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
              />

            </div>

          </div>

          <div>

            <label className="block mb-2">
              Reminder Type
            </label>

            <select
              value={reminderType}
              onChange={(e) =>
                setReminderType(
                  e.target.value
                )
              }
              className="w-full bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
            >

              <option value="">
                Select type
              </option>

              <option value="Appointment">
                Appointment
              </option>

              <option value="Follow-up">
                Follow-up
              </option>

              <option value="Medication">
                Medication
              </option>

              <option value="General">
                General
              </option>

            </select>

          </div>

          <div>

            <label className="block mb-2">
              Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="w-full bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
            >

              <option value="Pending">
                Pending
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Cancelled">
                Cancelled
              </option>

            </select>

          </div>

          <button
            onClick={saveChanges}
            disabled={saving}
            className="w-full bg-[#BFA15F] text-black py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>

      </div>

    </main>
  );
}