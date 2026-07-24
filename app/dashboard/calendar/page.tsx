"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

type Patient = {
  first_name: string;
  last_name: string;
  patient_number: number;
  phone: string;
};

type Appointment = {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  patient_id: string;
  patients: Patient[] | null;
};

export default function CalendarPage() {
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(
    new Date()
  );

  const [appointments, setAppointments] = useState<
    Appointment[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, [currentDate]);

  async function loadAppointments() {
    setLoading(true);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(
      year,
      month,
      1
    );

    const lastDay = new Date(
      year,
      month + 1,
      0
    );

    const startDate =
      formatDateForDatabase(firstDay);

    const endDate =
      formatDateForDatabase(lastDay);

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        start_time,
        end_time,
        status,
        patient_id,
        patients (
          first_name,
          last_name,
          patient_number,
          phone
        )
      `)
      .gte(
        "appointment_date",
        startDate
      )
      .lte(
        "appointment_date",
        endDate
      )
      .order("appointment_date", {
        ascending: true,
      })
      .order("start_time", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Calendar appointments error:",
        error
      );

      setAppointments([]);
      setLoading(false);

      return;
    }

    setAppointments(
      (data || []) as unknown as Appointment[]
    );

    setLoading(false);
  }

  function formatDateForDatabase(
    date: Date
  ) {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function getMonthName() {
    return currentDate.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );
  }

  function previousMonth() {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      )
    );
  }

  function nextMonth() {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      )
    );
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  function getCalendarDays() {
    const year =
      currentDate.getFullYear();

    const month =
      currentDate.getMonth();

    const firstDay = new Date(
      year,
      month,
      1
    );

    const lastDay = new Date(
      year,
      month + 1,
      0
    );

    const firstDayOfWeek =
      firstDay.getDay();

    const totalDays =
      lastDay.getDate();

    const days: (
      Date | null
    )[] = [];

    for (
      let i = 0;
      i < firstDayOfWeek;
      i++
    ) {
      days.push(null);
    }

    for (
      let day = 1;
      day <= totalDays;
      day++
    ) {
      days.push(
        new Date(
          year,
          month,
          day
        )
      );
    }

    return days;
  }

  function getAppointmentsForDay(
    date: Date
  ) {
    const dateString =
      formatDateForDatabase(date);

    return appointments.filter(
      (appointment) =>
        appointment.appointment_date ===
        dateString
    );
  }

  function formatTime(
    time: string
  ) {
    if (!time) return "";

    return new Date(
      `1970-01-01T${time}`
    ).toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
    );
  }

  function isToday(
    date: Date
  ) {
    const today = new Date();

    return (
      date.getDate() ===
        today.getDate() &&
      date.getMonth() ===
        today.getMonth() &&
      date.getFullYear() ===
        today.getFullYear()
    );
  }

  function getStatusClass(
    status: string
  ) {
    switch (status) {
      case "Confirmed":
        return "border-green-500/50 bg-green-900/20";

      case "Completed":
        return "border-blue-500/50 bg-blue-900/20";

      case "Cancelled":
        return "border-red-500/50 bg-red-900/20";

      default:
        return "border-yellow-500/50 bg-yellow-900/20";
    }
  }

  const calendarDays =
    getCalendarDays();

  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <main
      className="
      min-h-screen
      bg-[#080808]
      text-white
      p-4
      sm:p-6
      pt-32
      "
    >
      <DashboardMenu />

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div
          className="
          flex
          justify-between
          items-center
          flex-wrap
          gap-4
          mb-8
          "
        >
          <div>
            <h1
              className="
              text-3xl
              font-bold
              text-[#BFA15F]
              "
            >
              Calendar
            </h1>

            <p className="text-gray-400 mt-2">
              Manage your appointments
            </p>
          </div>

          <button
            onClick={() =>
              router.push(
                "/dashboard/appointments"
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
            View Appointments
          </button>
        </div>

        {/* CALENDAR CONTROLS */}

        <div
          className="
          bg-[#171717]
          border
          border-[#BFA15F]/30
          rounded-xl
          p-4
          sm:p-6
          mb-6
          "
        >
          <div
            className="
            flex
            justify-between
            items-center
            gap-3
            "
          >
            <button
              onClick={previousMonth}
              className="
              bg-[#080808]
              border
              border-[#BFA15F]/30
              px-4
              py-2
              rounded-lg
              text-[#D6C08A]
              "
            >
              ←
            </button>

            <div className="text-center">
              <h2
                className="
                text-2xl
                sm:text-3xl
                font-bold
                text-[#D6C08A]
                "
              >
                {getMonthName()}
              </h2>

              <button
                onClick={goToToday}
                className="
                text-sm
                text-[#BFA15F]
                mt-2
                hover:underline
                "
              >
                Today
              </button>
            </div>

            <button
              onClick={nextMonth}
              className="
              bg-[#080808]
              border
              border-[#BFA15F]/30
              px-4
              py-2
              rounded-lg
              text-[#D6C08A]
              "
            >
              →
            </button>
          </div>
        </div>

        {/* CALENDAR */}

        <div
          className="
          bg-[#171717]
          border
          border-[#BFA15F]/30
          rounded-xl
          overflow-hidden
          "
        >

          {/* WEEK DAYS */}

          <div
            className="
            grid
            grid-cols-7
            bg-[#0d0d0d]
            border-b
            border-[#BFA15F]/30
            "
          >
            {weekDays.map(
              (day) => (
                <div
                  key={day}
                  className="
                  p-2
                  sm:p-4
                  text-center
                  text-xs
                  sm:text-sm
                  font-bold
                  text-[#BFA15F]
                  "
                >
                  <span className="hidden sm:inline">
                    {day}
                  </span>

                  <span className="sm:hidden">
                    {day.substring(0, 3)}
                  </span>
                </div>
              )
            )}
          </div>

          {/* DAYS */}

          {loading ? (

            <div
              className="
              p-12
              text-center
              text-gray-400
              "
            >
              Loading appointments...
            </div>

          ) : (

            <div
              className="
              grid
              grid-cols-7
              "
            >
              {calendarDays.map(
                (date, index) => {

                  if (!date) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="
                        min-h-[120px]
                        sm:min-h-[160px]
                        bg-[#101010]
                        border-r
                        border-b
                        border-[#BFA15F]/10
                        "
                      />
                    );
                  }

                  const dayAppointments =
                    getAppointmentsForDay(
                      date
                    );

                  return (
                    <div
                      key={date.toISOString()}
                      className={`
                      min-h-[120px]
                      sm:min-h-[160px]
                      p-1
                      sm:p-2
                      border-r
                      border-b
                      border-[#BFA15F]/10
                      ${
                        isToday(date)
                          ? "bg-[#BFA15F]/10"
                          : "bg-[#171717]"
                      }
                      `}
                    >

                      {/* DAY NUMBER */}

                      <div
                        className="
                        flex
                        justify-between
                        items-center
                        mb-2
                        "
                      >
                        <span
                          className={`
                          text-sm
                          sm:text-base
                          font-bold
                          ${
                            isToday(date)
                              ? "bg-[#BFA15F] text-black rounded-full w-7 h-7 flex items-center justify-center"
                              : "text-gray-300"
                          }
                          `}
                        >
                          {date.getDate()}
                        </span>

                        {dayAppointments.length >
                          0 && (
                            <span
                              className="
                              text-[10px]
                              sm:text-xs
                              text-[#BFA15F]
                              "
                            >
                              {
                                dayAppointments.length
                              }
                            </span>
                          )}
                      </div>

                      {/* APPOINTMENTS */}

                      <div className="space-y-1">

                        {dayAppointments.map(
                          (
                            appointment
                          ) => {

                            const patient =
                              appointment
                                .patients?.[0];

                            return (
                              <button
                                key={
                                  appointment.id
                                }
                                onClick={() =>
                                  router.push(
                                    `/dashboard/patients/${appointment.patient_id}`
                                  )
                                }
                                className={`
                                w-full
                                text-left
                                rounded-md
                                border
                                p-1
                                sm:p-2
                                ${getStatusClass(
                                  appointment.status
                                )}
                                hover:border-[#BFA15F]
                                transition
                                `}
                              >
                                <p
                                  className="
                                  text-[9px]
                                  sm:text-xs
                                  text-[#D6C08A]
                                  font-bold
                                  truncate
                                  "
                                >
                                  {formatTime(
                                    appointment.start_time
                                  )}
                                </p>

                                <p
                                  className="
                                  text-[9px]
                                  sm:text-xs
                                  truncate
                                  "
                                >
                                  {patient
                                    ?.first_name ||
                                    "Patient"}{" "}
                                  {patient
                                    ?.last_name ||
                                    ""}
                                </p>

                                <p
                                  className="
                                  hidden
                                  sm:block
                                  text-[10px]
                                  text-gray-400
                                  truncate
                                  "
                                >
                                  {
                                    appointment.status
                                  }
                                </p>
                              </button>
                            );
                          }
                        )}

                      </div>

                    </div>
                  );
                }
              )}
            </div>
          )}

        </div>

        {/* LEGEND */}

        <div
          className="
          flex
          flex-wrap
          gap-4
          mt-6
          text-sm
          text-gray-400
          "
        >
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-yellow-500/50" />
            Pending
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-green-500/50" />
            Confirmed
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-blue-500/50" />
            Completed
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-500/50" />
            Cancelled
          </div>
        </div>

      </div>
    </main>
  );
}