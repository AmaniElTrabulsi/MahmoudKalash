"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

type Patient = {
  first_name: string;
  last_name: string;
  phone?: string;
};

type Appointment = {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  patients: Patient[] | null;
};

export default function DashboardPage() {
  const router = useRouter();

  const [patients, setPatients] = useState(0);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [pending, setPending] = useState(0);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);

    // PATIENTS COUNT
    const { count: patientCount } = await supabase
      .from("patients")
      .select("*", {
        count: "exact",
        head: true,
      });

    setPatients(patientCount || 0);

    // TODAY
    const today = new Date().toISOString().split("T")[0];

    // TODAY'S APPOINTMENTS
    const {
      data: todayData,
      error: todayError,
    } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        start_time,
        end_time,
        status,
        patients (
          first_name,
          last_name,
          phone
        )
      `)
      .eq("appointment_date", today)
      .order("start_time");

    if (todayError) {
      console.error("Today's appointments error:", todayError);
      setTodayAppointments([]);
    } else {
      setTodayAppointments(
        (todayData || []) as unknown as Appointment[]
      );
    }

    // ALL APPOINTMENTS FOR CALENDAR
    const {
      data: allData,
      error: allError,
    } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        start_time,
        end_time,
        status,
        patients (
          first_name,
          last_name,
          phone
        )
      `)
      .order("appointment_date")
      .order("start_time");

    if (allError) {
      console.error("All appointments error:", allError);
      setAllAppointments([]);
    } else {
      setAllAppointments(
        (allData || []) as unknown as Appointment[]
      );
    }

    // PENDING APPOINTMENTS
    const { count: pendingCount } = await supabase
      .from("appointments")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "Pending");

    setPending(pendingCount || 0);

    setLoading(false);
  }

  function formatTime(time: string) {
    if (!time) return "";

    return time.substring(0, 5);
  }

  function getMonthName(date: Date) {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  function getDaysInMonth(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    return new Date(
      year,
      month + 1,
      0
    ).getDate();
  }

  function getFirstDayOfMonth(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    return new Date(
      year,
      month,
      1
    ).getDay();
  }

  function goToPreviousMonth() {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1
      )
    );
  }

  function goToNextMonth() {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      )
    );
  }

  function goToCurrentMonth() {
    setCurrentMonth(new Date());
  }

  function getAppointmentsForDay(day: number) {
    const year = currentMonth.getFullYear();

    const month = String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0");

    const formattedDay = String(day).padStart(2, "0");

    const dateString =
      `${year}-${month}-${formattedDay}`;

    return allAppointments.filter(
      (appointment) =>
        appointment.appointment_date === dateString
    );
  }

  function isToday(day: number) {
    const today = new Date();

    return (
      today.getFullYear() ===
        currentMonth.getFullYear() &&
      today.getMonth() ===
        currentMonth.getMonth() &&
      today.getDate() === day
    );
  }

  const daysInMonth =
    getDaysInMonth(currentMonth);

  const firstDay =
    getFirstDayOfMonth(currentMonth);

  const calendarCells = [];

  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    calendarCells.push(day);
  }

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

        <p className="text-[#BFA15F] text-xl">
          Loading dashboard...
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

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <h1
          className="
            text-3xl
            font-bold
            text-[#BFA15F]
          "
        >
          Dr. Mahmoud Kalash Dashboard
        </h1>

        <p className="text-gray-400 mt-2">
          Welcome back
        </p>

        {/* STATISTICS */}

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-5
            mt-8
          "
        >

          {/* PATIENTS */}

          <div
            onClick={() =>
              router.push(
                "/dashboard/patients"
              )
            }
            className="
              bg-[#171717]
              border
              border-[#BFA15F]/30
              rounded-xl
              p-6
              cursor-pointer
              hover:border-[#BFA15F]
              transition
            "
          >
            <p className="text-gray-400">
              Patients
            </p>

            <p
              className="
                text-4xl
                font-bold
                text-[#BFA15F]
              "
            >
              {patients}
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Click to view
            </p>
          </div>

          {/* PENDING APPOINTMENTS */}

          <div
            onClick={() =>
              router.push(
                "/dashboard/appointments"
              )
            }
            className="
              bg-[#171717]
              border
              border-[#BFA15F]/30
              rounded-xl
              p-6
              cursor-pointer
              hover:border-[#BFA15F]
              transition
            "
          >
            <p className="text-gray-400">
              Pending Appointments
            </p>

            <p
              className="
                text-4xl
                font-bold
                text-[#BFA15F]
              "
            >
              {pending}
            </p>

            <p className="text-sm text-gray-500 mt-2">
              Click to view
            </p>
          </div>

          {/* TODAY'S VISITS */}

          <div
            onClick={() =>
              router.push(
                "/dashboard/appointments"
              )
            }
            className="
              bg-[#171717]
              border
              border-[#BFA15F]/30
              rounded-xl
              p-6
              cursor-pointer
              hover:border-[#BFA15F]
              transition
            "
          >
            <p className="text-gray-400">
              Today's Visits
            </p>

            <p
              className="
                text-4xl
                font-bold
                text-[#BFA15F]
              "
            >
              {todayAppointments.length}
            </p>
          </div>

        </div>

        {/* MONTHLY CALENDAR */}

        <section className="mt-10">

          <div
            className="
              flex
              justify-between
              items-center
              flex-wrap
              gap-4
              mb-5
            "
          >

            <h2
              className="
                text-2xl
                font-bold
                text-[#D6C08A]
              "
            >
              Appointments Calendar
            </h2>

            <div className="flex gap-2">

              <button
                onClick={goToPreviousMonth}
                className="
                  bg-[#171717]
                  border
                  border-[#BFA15F]/30
                  px-4
                  py-2
                  rounded-xl
                  hover:border-[#BFA15F]
                "
              >
                ←
              </button>

              <button
                onClick={goToCurrentMonth}
                className="
                  bg-[#BFA15F]
                  text-black
                  px-4
                  py-2
                  rounded-xl
                  font-bold
                "
              >
                Today
              </button>

              <button
                onClick={goToNextMonth}
                className="
                  bg-[#171717]
                  border
                  border-[#BFA15F]/30
                  px-4
                  py-2
                  rounded-xl
                  hover:border-[#BFA15F]
                "
              >
                →
              </button>

            </div>

          </div>

          <h3
            className="
              text-xl
              text-center
              font-bold
              text-[#BFA15F]
              mb-5
            "
          >
            {getMonthName(currentMonth)}
          </h3>

          <div
            className="
              bg-[#171717]
              border
              border-[#BFA15F]/30
              rounded-xl
              overflow-hidden
            "
          >

            {/* DAYS OF WEEK */}

            <div
              className="
                grid
                grid-cols-7
                border-b
                border-[#BFA15F]/20
              "
            >

              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map((day) => (

                <div
                  key={day}
                  className="
                    p-3
                    text-center
                    text-[#BFA15F]
                    font-bold
                    text-sm
                  "
                >
                  {day}
                </div>

              ))}

            </div>

            {/* CALENDAR */}

            <div
              className="
                grid
                grid-cols-7
              "
            >

              {calendarCells.map(
                (day, index) => {

                  if (day === null) {

                    return (
                      <div
                        key={`empty-${index}`}
                        className="
                          min-h-[130px]
                          border-r
                          border-b
                          border-[#BFA15F]/10
                          bg-[#0f0f0f]
                        "
                      />
                    );

                  }

                  const dayAppointments =
                    getAppointmentsForDay(day);

                  return (

                    <div
                      key={day}
                      className={`
                        min-h-[130px]
                        p-2
                        border-r
                        border-b
                        border-[#BFA15F]/10
                        ${
                          isToday(day)
                            ? "bg-[#BFA15F]/10"
                            : ""
                        }
                      `}
                    >

                      <div
                        className={`
                          w-8
                          h-8
                          rounded-full
                          flex
                          items-center
                          justify-center
                          mb-2
                          ${
                            isToday(day)
                              ? "bg-[#BFA15F] text-black font-bold"
                              : "text-gray-300"
                          }
                        `}
                      >
                        {day}
                      </div>

                      <div className="space-y-1">

                        {dayAppointments.map(
                          (appointment) => {

                            const patient =
                              appointment
                                .patients?.[0];

                            return (

                              <div
                                key={appointment.id}
                                onClick={() =>
                                  router.push(
                                    `/dashboard/appointments`
                                  )
                                }
                                className="
                                  bg-[#0d0d0d]
                                  border
                                  border-[#BFA15F]/30
                                  rounded-lg
                                  p-2
                                  cursor-pointer
                                  hover:border-[#BFA15F]
                                  text-xs
                                "
                              >

                                <p
                                  className="
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
                                    text-white
                                    truncate
                                  "
                                >
                                  {patient
                                    ? `${patient.first_name} ${patient.last_name}`
                                    : "Unknown Patient"}
                                </p>

                                <p
                                  className={`
                                    truncate
                                    ${
                                      appointment.status ===
                                      "Completed"
                                        ? "text-green-400"
                                        : appointment.status ===
                                          "Cancelled"
                                        ? "text-red-400"
                                        : "text-yellow-400"
                                    }
                                  `}
                                >
                                  {appointment.status}
                                </p>

                              </div>

                            );

                          }
                        )}

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          </div>

        </section>

        {/* TODAY'S APPOINTMENTS */}

        <section className="mt-10">

          <h2
            className="
              text-2xl
              font-bold
              text-[#D6C08A]
              mb-5
            "
          >
            Today's Appointments
          </h2>

          {todayAppointments.length === 0 ? (

            <p className="text-gray-400">
              No appointments today
            </p>

          ) : (

            <div className="space-y-4">

              {todayAppointments.map(
                (item) => {

                  const patient =
                    item.patients?.[0];

                  return (

                    <div
                      key={item.id}
                      className="
                        bg-[#171717]
                        border
                        border-[#BFA15F]/20
                        rounded-xl
                        p-5
                      "
                    >

                      <p
                        className="
                          text-xl
                          font-bold
                        "
                      >
                        {patient
                          ? `${patient.first_name} ${patient.last_name}`
                          : "Unknown Patient"}
                      </p>

                      <p
                        className="
                          text-gray-400
                          mt-2
                        "
                      >
                        {formatTime(
                          item.start_time
                        )}
                        {" - "}
                        {formatTime(
                          item.end_time
                        )}
                      </p>

                      <p
                        className="
                          text-[#BFA15F]
                          mt-2
                        "
                      >
                        {item.status}
                      </p>

                    </div>

                  );

                }
              )}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}