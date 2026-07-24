"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

export default function AppointmentsPage() {
  const [appointments, setAppointments] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [statusFilter, setStatusFilter] =
    useState("Pending");

  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

  async function loadAppointments() {
    setLoading(true);

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        start_time,
        end_time,
        status,
        patients(
          id,
          first_name,
          last_name,
          phone,
          patient_number
        )
      `)
      .eq("status", statusFilter)
      .order("appointment_date", {
        ascending: true,
      })
      .order("start_time", {
        ascending: true,
      });

    if (error) {
      console.log(error);
    }

    setAppointments(data || []);
    setLoading(false);
  }

  async function confirmAppointment(
    appointment: any
  ) {
    const patient =
      appointment.patients;

    if (!patient) {
      alert("Patient information not found");
      return;
    }

    /*
    =====================================
    FORMAT PHONE NUMBER
    =====================================
    */

    const phone =
      patient.phone
        .replace(/\s/g, "")
        .replace(/-/g, "")
        .replace("+", "");

    /*
    =====================================
    WHATSAPP MESSAGE
    =====================================
    */

    const message =
`Hello ${patient.first_name} ${patient.last_name},

Your appointment with Dr. Mahmoud Kalash has been confirmed.

Date:
${appointment.appointment_date}

Time:
${appointment.start_time.substring(0, 5)}
-
${appointment.end_time.substring(0, 5)}

Patient ID:
${patient.patient_number}

Thank you.

Dr. Mahmoud Kalash Clinic`;

    const whatsappURL =
      `https://wa.me/${phone}?text=${encodeURIComponent(
        message
      )}`;

    /*
    =====================================
    1. CONFIRM APPOINTMENT
    =====================================
    */

    const {
      error: appointmentError,
    } = await supabase
      .from("appointments")
      .update({
        status: "Confirmed",
      })
      .eq(
        "id",
        appointment.id
      );

    if (appointmentError) {
      console.log(appointmentError);

      alert(
        "Could not confirm appointment"
      );

      return;
    }

    /*
    =====================================
    2. CREATE AUTOMATIC REMINDER
    =====================================
    */

    const appointmentDate =
      new Date(
        `${appointment.appointment_date}T00:00:00`
      );

    appointmentDate.setDate(
      appointmentDate.getDate() - 1
    );

    const reminderDate =
      appointmentDate
        .toISOString()
        .split("T")[0];

    const {
      error: reminderError,
    } = await supabase
      .from("reminders")
      .insert({
        patient_id:
          patient.id,

        title:
          "Appointment Tomorrow",

        message:
          `Reminder: ${patient.first_name} ${patient.last_name} has an appointment with Dr. Mahmoud Kalash tomorrow at ${appointment.start_time.substring(
            0,
            5
          )}.`,

        reminder_date:
          reminderDate,

        reminder_time:
          "10:00",

        reminder_type:
          "Appointment",

        status:
          "Pending",
      });

    if (reminderError) {
      console.log(
        "Reminder creation error:",
        reminderError
      );

      /*
      The appointment is still confirmed
      even if reminder creation fails.
      */

      alert(
        "Appointment confirmed, but the reminder could not be created."
      );
    }

    /*
    =====================================
    3. REFRESH APPOINTMENTS
    =====================================
    */

    await loadAppointments();

    /*
    =====================================
    4. OPEN WHATSAPP
    =====================================
    */

    window.open(
      whatsappURL,
      "_blank"
    );
  }

  async function changeStatus(
    id: string,
    status: string
  ) {
    const { error } =
      await supabase
        .from("appointments")
        .update({
          status,
        })
        .eq(
          "id",
          id
        );

    if (error) {
      console.log(error);
      return;
    }

    loadAppointments();
  }

  const tabs = [
    "Pending",
    "Confirmed",
    "Completed",
    "Cancelled",
  ];

  if (loading) {
    return (
      <main
        className="
        min-h-screen
        bg-[#080808]
        text-white
        flex
        items-center
        justify-center
        "
      >
        <DashboardMenu />

        <p>
          Loading...
        </p>
      </main>
    );
  }

  return (
    <main
      className="
      min-h-screen
      bg-[#080808]
      text-white
      p-6
      pt-32
      "
    >
      <DashboardMenu />

      <h1
        className="
        text-3xl
        font-bold
        text-[#BFA15F]
        "
      >
        Appointments
      </h1>

      <p className="text-gray-400 mt-2">
        Manage patient appointments
      </p>

      <div
        className="
        flex
        gap-3
        flex-wrap
        mt-8
        "
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() =>
              setStatusFilter(tab)
            }
            className={`
              px-5
              py-3
              rounded-xl
              border

              ${
                statusFilter === tab
                  ? "bg-[#BFA15F] text-black border-[#BFA15F]"
                  : "bg-[#171717] border-[#BFA15F]/30"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      <div
        className="
        mt-8
        space-y-5
        "
      >
        {appointments.length === 0 ? (
          <p className="text-gray-400">
            No{" "}
            {statusFilter.toLowerCase()}{" "}
            appointments.
          </p>
        ) : (
          appointments.map(
            (appointment) => (
              <div
                key={appointment.id}
                className="
                bg-[#171717]
                border
                border-[#BFA15F]/30
                rounded-xl
                p-5
                "
              >
                <div
                  className="
                  flex
                  justify-between
                  flex-wrap
                  gap-5
                  "
                >
                  <div>
                    <h2 className="text-xl font-bold">
                      {
                        appointment
                          .patients
                          ?.first_name
                      }{" "}
                      {
                        appointment
                          .patients
                          ?.last_name
                      }
                    </h2>

                    <p className="text-gray-400 mt-2">
                      Patient ID:{" "}
                      {
                        appointment
                          .patients
                          ?.patient_number
                      }
                    </p>

                    <p className="text-gray-400">
                      Phone:{" "}
                      {
                        appointment
                          .patients
                          ?.phone
                      }
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[#D6C08A]">
                      {
                        appointment.appointment_date
                      }
                    </p>

                    <p>
                      {appointment.start_time.substring(
                        0,
                        5
                      )}
                      {" - "}
                      {appointment.end_time.substring(
                        0,
                        5
                      )}
                    </p>

                    <p className="text-[#BFA15F] mt-2">
                      {appointment.status}
                    </p>
                  </div>
                </div>

                <div
                  className="
                  flex
                  gap-3
                  flex-wrap
                  mt-5
                  "
                >
                  {statusFilter ===
                    "Pending" && (
                    <>
                      <button
                        onClick={() =>
                          confirmAppointment(
                            appointment
                          )
                        }
                        className="
                        px-5
                        py-2
                        rounded-lg
                        bg-green-600
                        hover:bg-green-700
                        "
                      >
                        Confirm + WhatsApp
                      </button>

                      <button
                        onClick={() =>
                          changeStatus(
                            appointment.id,
                            "Cancelled"
                          )
                        }
                        className="
                        px-5
                        py-2
                        rounded-lg
                        bg-red-600
                        hover:bg-red-700
                        "
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {statusFilter ===
                    "Confirmed" && (
                    <button
                      onClick={() =>
                        changeStatus(
                          appointment.id,
                          "Completed"
                        )
                      }
                      className="
                      px-5
                      py-2
                      rounded-lg
                      bg-blue-600
                      hover:bg-blue-700
                      "
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            )
          )
        )}
      </div>
    </main>
  );
}