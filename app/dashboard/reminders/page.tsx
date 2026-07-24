"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

export default function RemindersPage() {
  const router = useRouter();

  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    loadReminders();
  }, []);

  async function loadReminders() {
    setLoading(true);

    const { data, error } = await supabase
      .from("reminders")
      .select(`
        *,
        patients (
          id,
          first_name,
          last_name,
          phone,
          patient_number
        )
      `)
      .order("reminder_date", {
        ascending: true,
      })
      .order("reminder_time", {
        ascending: true,
      });

    if (error) {
      console.error(error);
      setReminders([]);
      setLoading(false);
      return;
    }

    const appointmentReminders =
      (data || []).filter(
        (reminder) =>
          reminder.reminder_type === "Appointment" &&
          reminder.patient_id
      );

    let appointments: any[] = [];

    if (appointmentReminders.length > 0) {
      const patientIds = appointmentReminders.map(
        (reminder) => reminder.patient_id
      );

      const { data: appointmentData, error: appointmentError } =
        await supabase
          .from("appointments")
          .select(`
            id,
            patient_id,
            appointment_date,
            start_time,
            end_time,
            status
          `)
          .in("patient_id", patientIds)
          .in("status", ["Confirmed", "Pending"])
          .order("appointment_date", {
            ascending: true,
          });

      if (appointmentError) {
        console.error(appointmentError);
      }

      appointments = appointmentData || [];
    }

    const updatedReminders = (data || []).map(
      (reminder) => {
        if (
          reminder.reminder_type !== "Appointment" ||
          !reminder.patient_id
        ) {
          return reminder;
        }

        const appointment = appointments.find(
          (item) =>
            item.patient_id === reminder.patient_id &&
            item.appointment_date >=
              new Date().toISOString().split("T")[0]
        );

        return {
          ...reminder,
          appointment,
        };
      }
    );

    setReminders(updatedReminders);
    setLoading(false);
  }

  async function markCompleted(id: string) {
    const { error } = await supabase
      .from("reminders")
      .update({
        status: "Completed",
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadReminders();
  }

  function formatDate(date: string) {
    if (!date) return "-";

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatTime(time: string) {
    if (!time) return "-";

    return new Date(
      `1970-01-01T${time}`
    ).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatPhone(phone: string) {
    if (!phone) return "";

    return phone
      .replace(/\s/g, "")
      .replace(/-/g, "")
      .replace(/\+/g, "");
  }

  function sendWhatsAppReminder(reminder: any) {
    const patient = reminder.patients;
    const appointment = reminder.appointment;

    if (!patient?.phone) {
      alert("This patient does not have a phone number.");
      return;
    }

    if (!appointment) {
      alert(
        "No appointment was found for this patient."
      );
      return;
    }

    setSendingId(reminder.id);

    const phone = formatPhone(patient.phone);

    const message = `Hello ${patient.first_name} ${patient.last_name},

This is a reminder about your appointment with Dr. Mahmoud Kalash.

Date:
${formatDate(appointment.appointment_date)}

Time:
${formatTime(appointment.start_time)}
-
${formatTime(appointment.end_time)}

Patient ID:
${patient.patient_number}

We look forward to seeing you.

Dr. Mahmoud Kalash Clinic`;

    const whatsappURL =
      `https://wa.me/${phone}?text=${encodeURIComponent(
        message
      )}`;

    window.open(
      whatsappURL,
      "_blank"
    );

    setSendingId(null);
  }

  function isAppointmentReminder(reminder: any) {
    return (
      reminder.reminder_type === "Appointment" &&
      reminder.patients &&
      reminder.appointment
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">

        <DashboardMenu />

        <p>
          Loading Reminders...
        </p>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white p-6 pt-24">

      <DashboardMenu />

      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center flex-wrap gap-4 mb-8">

          <div>

            <h1 className="text-3xl font-bold text-[#BFA15F]">
              Reminders
            </h1>

            <p className="text-gray-400 mt-2">
              Manage patient and clinic reminders
            </p>

          </div>

          <button
            onClick={() =>
              router.push(
                "/dashboard/reminders/new"
              )
            }
            className="
            bg-[#BFA15F]
            text-black
            px-5
            py-3
            rounded-xl
            font-bold
            "
          >
            + New Reminder
          </button>

        </div>

        {reminders.length === 0 ? (

          <div
            className="
            bg-[#171717]
            border
            border-[#BFA15F]/30
            rounded-xl
            p-8
            text-center
            "
          >

            <p className="text-gray-400">
              No reminders found
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {reminders.map((reminder) => {

              const appointment =
                reminder.appointment;

              const displayDate =
                appointment?.appointment_date ||
                reminder.reminder_date;

              const displayStartTime =
                appointment?.start_time ||
                reminder.reminder_time;

              const displayEndTime =
                appointment?.end_time ||
                null;

              return (

                <div
                  key={reminder.id}
                  onClick={() =>
                    router.push(
                      `/dashboard/reminders/${reminder.id}`
                    )
                  }
                  className="
                  bg-[#171717]
                  border
                  border-[#BFA15F]/30
                  rounded-xl
                  p-5
                  cursor-pointer
                  hover:border-[#BFA15F]
                  transition
                  "
                >

                  <div
                    className="
                    flex
                    justify-between
                    items-start
                    flex-wrap
                    gap-5
                    "
                  >

                    <div className="flex-1">

                      <div className="flex items-center gap-3 flex-wrap">

                        <h2 className="text-xl font-bold">
                          {reminder.title}
                        </h2>

                        {reminder.reminder_type ===
                          "Appointment" && (

                          <span
                            className="
                            bg-[#BFA15F]/20
                            text-[#D6C08A]
                            border
                            border-[#BFA15F]/30
                            px-3
                            py-1
                            rounded-full
                            text-xs
                            font-bold
                            "
                          >
                            Appointment Reminder
                          </span>

                        )}

                      </div>

                      {reminder.patients && (

                        <p className="text-[#BFA15F] mt-3">

                          Patient:{" "}

                          {reminder.patients.first_name}{" "}

                          {reminder.patients.last_name}

                          {" "}•

                          {" "}

                          #{reminder.patients.patient_number}

                        </p>

                      )}

                      <p className="text-gray-400 mt-2">

                        Appointment Date:{" "}

                        {formatDate(
                          displayDate
                        )}

                      </p>

                      {displayStartTime && (

                        <p className="text-gray-400">

                          Appointment Time:{" "}

                          {formatTime(
                            displayStartTime
                          )}

                          {displayEndTime && (

                            <>
                              {" - "}
                              {formatTime(
                                displayEndTime
                              )}
                            </>

                          )}

                        </p>

                      )}

                      {reminder.message && (

                        <p className="mt-3 text-gray-300">

                          {reminder.message}

                        </p>

                      )}

                    </div>

                    <div
                      className="
                      flex
                      flex-col
                      items-end
                      gap-3
                      "
                    >

                      <span
                        className={`
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        font-bold
                        ${
                          reminder.status ===
                          "Completed"
                            ? "bg-green-900/40 text-green-400"
                            : reminder.status ===
                              "Cancelled"
                            ? "bg-red-900/40 text-red-400"
                            : "bg-yellow-900/40 text-yellow-400"
                        }
                        `}
                      >
                        {reminder.status}
                      </span>

                      {isAppointmentReminder(
                        reminder
                      ) && (

                        <button
                          onClick={(e) => {

                            e.stopPropagation();

                            sendWhatsAppReminder(
                              reminder
                            );

                          }}
                          disabled={
                            sendingId ===
                            reminder.id
                          }
                          className="
                          bg-green-600
                          hover:bg-green-500
                          text-white
                          px-4
                          py-2
                          rounded-lg
                          text-sm
                          font-bold
                          whitespace-nowrap
                          disabled:opacity-50
                          "
                        >
                          {sendingId ===
                          reminder.id
                            ? "Opening..."
                            : "📱 Send WhatsApp Reminder"}
                        </button>

                      )}

                      {reminder.status ===
                        "Pending" && (

                        <button
                          onClick={(e) => {

                            e.stopPropagation();

                            markCompleted(
                              reminder.id
                            );

                          }}
                          className="
                          bg-green-700
                          hover:bg-green-600
                          text-white
                          px-4
                          py-2
                          rounded-lg
                          text-sm
                          font-bold
                          "
                        >
                          Mark Completed
                        </button>

                      )}

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        )}

      </div>

    </main>
  );
}