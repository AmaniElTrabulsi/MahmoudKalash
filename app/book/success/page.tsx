"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import html2canvas from "html2canvas";
import { createEvent } from "ics";
import { supabase } from "@/lib/supabase";

function BookingSuccessContent() {
  const searchParams = useSearchParams();

  const appointmentId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      if (!appointmentId) {
        setLoading(false);
        return;
      }

      const {
        data: appointmentData,
        error: appointmentError,
      } = await supabase
        .from("appointments")
        .select("*")
        .eq("id", appointmentId)
        .single();

      if (appointmentError || !appointmentData) {
        console.error("Appointment error:", appointmentError);
        setLoading(false);
        return;
      }

      setAppointment(appointmentData);

      const {
        data: patientData,
        error: patientError,
      } = await supabase
        .from("patients")
        .select("*")
        .eq("id", appointmentData.patient_id)
        .single();

      if (patientError) {
        console.error("Patient error:", patientError);
      } else {
        setPatient(patientData);
      }

      setLoading(false);
    }

    loadData();
  }, [appointmentId]);

  function formatDate(date: string) {
    if (!date) return "-";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  }

  function formatTime(time: string) {
    if (!time) return "-";

    return new Date(`1970-01-01T${time}`).toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
    );
  }

  function addToCalendar() {
    if (!appointment) return;

    const start = new Date(
      `${appointment.appointment_date}T${appointment.start_time}`
    );

    const end = new Date(
      `${appointment.appointment_date}T${appointment.end_time}`
    );

    createEvent(
      {
        title:
          "Appointment - Dr. Mahmoud Kalash Clinic",

        description:
          `Patient ID: ${patient?.patient_number || ""}\n` +
          `Patient: ${patient?.first_name || ""} ${
            patient?.last_name || ""
          }\n` +
          `Status: ${appointment?.status || ""}`,

        location:
          "Dr. Mahmoud Kalash Clinic",

        start: [
          start.getFullYear(),
          start.getMonth() + 1,
          start.getDate(),
          start.getHours(),
          start.getMinutes(),
        ],

        end: [
          end.getFullYear(),
          end.getMonth() + 1,
          end.getDate(),
          end.getHours(),
          end.getMinutes(),
        ],
      },

      (error, value) => {
        if (error) {
          console.error(error);
          return;
        }

        const blob = new Blob([value], {
          type: "text/calendar",
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download =
          "Dr-Mahmoud-Kalash-Appointment.ics";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
      }
    );
  }

  async function saveConfirmation() {
    if (!appointment || !patient) return;

    const imageCard = document.createElement("div");

    imageCard.style.position = "fixed";
    imageCard.style.left = "-9999px";
    imageCard.style.top = "0";
    imageCard.style.width = "420px";
    imageCard.style.padding = "30px";
    imageCard.style.background = "#171717";
    imageCard.style.color = "#ffffff";
    imageCard.style.borderRadius = "20px";
    imageCard.style.fontFamily = "Arial";

    imageCard.innerHTML = `
      <div style="text-align:center">

        <div style="
          font-size:50px;
          color:#BFA15F;
        ">
          ✓
        </div>

        <h1 style="
          color:#BFA15F;
          font-size:28px;
        ">
          Appointment Requested
        </h1>

        <p style="
          color:#aaaaaa;
          line-height:1.5;
        ">
          Your appointment request has been received.
          The clinic will confirm your appointment shortly.
        </p>

        <div style="
          margin-top:25px;
          background:#000;
          border:1px solid #5f5030;
          border-radius:15px;
          padding:20px;
          text-align:left;
        ">

          <p style="color:#D6C08A">
            Patient
          </p>

          <p style="
            font-size:22px;
            font-weight:bold;
          ">
            ${patient.first_name || ""}
            ${patient.last_name || ""}
          </p>

          <p style="
            color:#D6C08A;
            margin-top:20px;
          ">
            Patient ID
          </p>

          <p style="
            font-size:20px;
            font-weight:bold;
          ">
            ${patient.patient_number || ""}
          </p>

          <p style="
            color:#D6C08A;
            margin-top:20px;
          ">
            Date
          </p>

          <p>
            ${formatDate(appointment.appointment_date)}
          </p>

          <p style="
            color:#D6C08A;
            margin-top:20px;
          ">
            Time
          </p>

          <p>
            ${formatTime(appointment.start_time)}
            -
            ${formatTime(appointment.end_time)}
          </p>

          <p style="
            color:#D6C08A;
            margin-top:20px;
          ">
            Status
          </p>

          <p>
            ${appointment.status || "Pending"}
          </p>

        </div>

        <p style="
          margin-top:25px;
          color:#888;
          font-size:14px;
        ">
          Dr. Mahmoud Kalash Clinic
        </p>

      </div>
    `;

    document.body.appendChild(imageCard);

    try {
      const canvas = await html2canvas(imageCard, {
        scale: 2,
        backgroundColor: "#171717",
      });

      const link = document.createElement("a");

      link.download =
        "Dr-Mahmoud-Kalash-Appointment.png";

      link.href = canvas.toDataURL("image/png");

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    } catch (error) {
      console.error(
        "Could not save confirmation:",
        error
      );
    } finally {
      document.body.removeChild(imageCard);
    }
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
        Loading...
      </main>
    );
  }

  if (!appointment || !patient) {
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
            bg-[#171717]
            border
            border-red-500/30
            rounded-2xl
            p-8
            text-center
          "
        >
          <h1 className="text-xl font-bold text-red-400">
            Appointment Not Found
          </h1>

          <p className="text-gray-400 mt-3">
            We could not find this appointment.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="
        min-h-screen
        bg-[#080808]
        text-[#F5F5F5]
        flex
        items-center
        justify-center
        px-4
        py-6
      "
    >
      <div
        className="
          w-full
          max-w-xl
          bg-[#171717]
          border
          border-[#BFA15F]/30
          rounded-2xl
          p-8
          text-center
        "
      >
        <div className="text-5xl mb-6">
          ✓
        </div>

        <h1
          className="
            text-3xl
            font-bold
            text-[#BFA15F]
          "
        >
          Appointment Requested
        </h1>

        <p
          className="
            mt-4
            text-gray-400
          "
        >
          Your appointment request has been received.
          The clinic will confirm your appointment shortly.
        </p>

        <div
          className="
            mt-8
            bg-black
            rounded-xl
            border
            border-[#BFA15F]/20
            p-5
            text-left
          "
        >
          <p className="text-[#D6C08A]">
            Patient
          </p>

          <p className="text-xl font-bold mt-1">
            {patient.first_name}{" "}
            {patient.last_name}
          </p>

          <p className="text-[#D6C08A] mt-5">
            Patient ID
          </p>

          <p className="text-xl font-bold mt-1">
            {patient.patient_number}
          </p>

          <p className="text-[#D6C08A] mt-5">
            Date
          </p>

          <p className="mt-1">
            {formatDate(
              appointment.appointment_date
            )}
          </p>

          <p className="text-[#D6C08A] mt-5">
            Time
          </p>

          <p className="mt-1">
            {formatTime(
              appointment.start_time
            )}
            {" - "}
            {formatTime(
              appointment.end_time
            )}
          </p>

          <p className="text-[#D6C08A] mt-5">
            Status
          </p>

          <p className="mt-1">
            {appointment.status}
          </p>
        </div>

        <p
          className="
            mt-6
            text-sm
            text-gray-400
          "
        >
          Please save this confirmation.
          Bring your Patient ID and appointment
          details with you when you visit the clinic.
        </p>

        <button
          onClick={saveConfirmation}
          className="
            mt-5
            w-full
            h-14
            bg-[#BFA15F]
            text-black
            rounded-xl
            font-bold
            text-lg
          "
        >
          📥 Save Appointment
        </button>

        <button
          onClick={addToCalendar}
          className="
            mt-3
            w-full
            h-14
            border
            border-[#BFA15F]
            text-[#BFA15F]
            rounded-xl
            font-bold
            text-lg
          "
        >
          📅 Add to Calendar
        </button>
      </div>
    </main>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
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
          Loading...
        </main>
      }
    >
      <BookingSuccessContent />
    </Suspense>
  );
}