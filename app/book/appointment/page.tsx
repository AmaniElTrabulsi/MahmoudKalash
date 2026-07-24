"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AppointmentBookingPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");

  const [medicalCoverage, setMedicalCoverage] = useState("");
  const [otherCoverage, setOtherCoverage] = useState("");
  const [insuranceProvider, setInsuranceProvider] = useState("");

  const [days, setDays] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<any>(null);

  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const allSlots = [
    {
      start: "15:00",
      end: "15:45",
      label: "15:00 - 15:45",
    },
    {
      start: "15:45",
      end: "16:30",
      label: "15:45 - 16:30",
    },
    {
      start: "16:30",
      end: "17:15",
      label: "16:30 - 17:15",
    },
    {
      start: "17:15",
      end: "18:00",
      label: "17:15 - 18:00",
    },
  ];

  useEffect(() => {
    generateDays();
  }, []);

  function generateDays() {
    const result: any[] = [];

    const date = new Date();

    while (result.length < 4) {
      date.setDate(date.getDate() + 1);

      const day = date.getDay();

      if (day >= 1 && day <= 4) {
        const year = date.getFullYear();

        const month = String(
          date.getMonth() + 1
        ).padStart(2, "0");

        const dayNumber = String(
          date.getDate()
        ).padStart(2, "0");

        const localDate =
          `${year}-${month}-${dayNumber}`;

        result.push({
          date: localDate,

          label: date.toLocaleDateString(
            "en-US",
            {
              weekday: "short",
              day: "numeric",
              month: "short",
            }
          ),
        });
      }
    }

    setDays(result);
  }

  async function chooseDay(day: any) {
    setSelectedDay(day);
    setSelectedSlot(null);

    const appointmentDate = day.date;

    const {
      data,
      error,
    } = await supabase
      .from("appointments")
      .select("start_time, status")
      .eq(
        "appointment_date",
        appointmentDate
      )
      .neq(
        "status",
        "Cancelled"
      );

    if (error) {
      console.error(error);

      setSlots(allSlots);

      return;
    }

    const booked =
      data?.map(
        (item: any) =>
          item.start_time.substring(0, 5)
      ) || [];

    const available =
      allSlots.filter(
        (slot) =>
          !booked.includes(slot.start)
      );

    setSlots(available);
  }

  function formatPhone() {
    let value =
      phone.replace(/\D/g, "");

    if (value.startsWith("961")) {
      value = value.substring(3);
    }

    if (value.startsWith("0")) {
      value = value.substring(1);
    }

    return `+961${value}`;
  }

  function isValidLebanesePhone() {
    let value =
      phone.replace(/\D/g, "");

    if (value.startsWith("961")) {
      value = value.substring(3);
    }

    if (value.startsWith("0")) {
      value = value.substring(1);
    }

    const allowedPrefixes = [
      "70",
      "71",
      "76",
      "78",
      "79",
      "81",
    ];

    const validPrefix =
      allowedPrefixes.some(
        (prefix) =>
          value.startsWith(prefix)
      );

    return (
      value.length === 8 &&
      validPrefix
    );
  }

  async function confirmBooking() {
    setMessage("");

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !dateOfBirth ||
      !phone.trim() ||
      !selectedDay ||
      !selectedSlot
    ) {
      setMessage(
        "Please complete all required fields"
      );

      return;
    }

    if (!isValidLebanesePhone()) {
      setMessage(
        "Please enter a valid Lebanese mobile number"
      );

      return;
    }

    setLoading(true);

    try {
      const finalPhone =
        formatPhone();

      let coverage =
        medicalCoverage;

      if (
        medicalCoverage === "Other"
      ) {
        coverage =
          "Other - " +
          otherCoverage;
      }

      /*
       * IMPORTANT:
       *
       * We ALWAYS create a new patient.
       *
       * We do not search by phone because
       * multiple patients may have the same
       * phone number.
       */

      const {
        data: newPatient,
        error: patientError,
      } = await supabase
        .from("patients")
        .insert({
          first_name:
            firstName.trim(),

          last_name:
            lastName.trim(),

          date_of_birth:
            dateOfBirth,

          phone:
            finalPhone,

          medical_coverage:
            coverage || null,

          insurance_provider:
            medicalCoverage ===
            "Insurance"
              ? insuranceProvider
              : null,
        })
        .select("id")
        .single();

      if (patientError) {
        console.error(
          "Patient creation error:",
          patientError
        );

        setMessage(
          "Could not create patient"
        );

        setLoading(false);

        return;
      }

      /*
       * Create the appointment using
       * the exact newly created patient.
       */

      const {
        data: appointment,
        error: appointmentError,
      } = await supabase
        .from("appointments")
        .insert({
          patient_id:
            newPatient.id,

          appointment_date:
            selectedDay.date,

          start_time:
            selectedSlot.start,

          end_time:
            selectedSlot.end,

          status:
            "Pending",

          booking_source:
            "Patient Booking",
        })
        .select("id")
        .single();

      if (appointmentError) {
        console.error(
          "Appointment creation error:",
          appointmentError
        );

        setMessage(
          "Could not create appointment"
        );

        setLoading(false);

        return;
      }

      /*
       * The success page receives the exact
       * appointment that was just created.
       */

      router.push(
        `/book/success?id=${appointment.id}`
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "Something went wrong. Please try again."
      );

      setLoading(false);
    }
  }

  return (
    <main
      className="
      min-h-screen
      bg-[#080808]
      text-white
      px-3
      py-6
      flex
      justify-center
      overflow-x-hidden
      "
    >
      <div
        className="
        w-full
        max-w-lg
        bg-[#171717]
        border
        border-[#BFA15F]/30
        rounded-2xl
        p-4
        sm:p-8
        space-y-5
        "
      >
        <h1
          className="
          text-2xl
          sm:text-3xl
          font-bold
          text-center
          text-[#BFA15F]
          "
        >
          Book an Appointment
        </h1>

        <p
          className="
          text-center
          text-gray-400
          text-sm
          "
        >
          Please enter your information
        </p>

        <input
          className="
          w-full
          h-14
          box-border
          bg-black
          border
          border-[#BFA15F]/30
          rounded-xl
          px-4
          text-base
          "
          placeholder="First Name"
          value={firstName}
          onChange={(e) =>
            setFirstName(
              e.target.value
            )
          }
        />

        <input
          className="
          w-full
          h-14
          box-border
          bg-black
          border
          border-[#BFA15F]/30
          rounded-xl
          px-4
          text-base
          "
          placeholder="Last Name"
          value={lastName}
          onChange={(e) =>
            setLastName(
              e.target.value
            )
          }
        />

        <div
          className="
          w-full
          min-w-0
          "
        >
          <label
            className="
            text-[#D6C08A]
            text-sm
            "
          >
            Date of Birth
          </label>

          <input
            type="date"
            className="
            mt-2
            w-full
            max-w-full
            min-w-0
            box-border
            h-14
            appearance-none
            bg-black
            border
            border-[#BFA15F]/30
            rounded-xl
            px-4
            text-base
            "
            value={dateOfBirth}
            onChange={(e) =>
              setDateOfBirth(
                e.target.value
              )
            }
          />
        </div>

        <div
          className="
          flex
          h-14
          bg-black
          border
          border-[#BFA15F]/30
          rounded-xl
          overflow-hidden
          "
        >
          <span
            className="
            flex
            items-center
            px-4
            text-[#BFA15F]
            "
          >
            +961
          </span>

          <input
            className="
            flex-1
            min-w-0
            bg-transparent
            px-3
            outline-none
            text-base
            "
            placeholder="70 123456"
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value
              )
            }
          />
        </div>

        <div
          className="
          w-full
          "
        >
          <select
            className="
            w-full
            h-14
            box-border
            bg-black
            border
            border-[#BFA15F]/30
            rounded-xl
            px-4
            text-base
            "
            value={medicalCoverage}
            onChange={(e) => {
              const value =
                e.target.value;

              setMedicalCoverage(
                value
              );

              if (
                value !== "Other"
              ) {
                setOtherCoverage(
                  ""
                );
              }

              if (
                value !== "Insurance"
              ) {
                setInsuranceProvider(
                  ""
                );
              }
            }}
          >
            <option value="">
              Medical Coverage (Optional)
            </option>

            <option value="NSSF">
              NSSF
            </option>

            <option value="Insurance">
              Insurance
            </option>

            <option value="Self Payment">
              Self Payment
            </option>

            <option value="Other">
              Other
            </option>
          </select>

          {medicalCoverage ===
            "Other" && (
            <input
              type="text"
              className="
              mt-5
              w-full
              h-14
              box-border
              bg-black
              border
              border-[#BFA15F]/30
              rounded-xl
              px-4
              text-base
              "
              placeholder="Specify medical coverage"
              value={
                otherCoverage
              }
              onChange={(e) =>
                setOtherCoverage(
                  e.target.value
                )
              }
            />
          )}

          {medicalCoverage ===
            "Insurance" && (
            <input
              type="text"
              className="
              mt-5
              w-full
              h-14
              box-border
              bg-black
              border
              border-[#BFA15F]/30
              rounded-xl
              px-4
              text-base
              "
              placeholder="Insurance Provider"
              value={
                insuranceProvider
              }
              onChange={(e) =>
                setInsuranceProvider(
                  e.target.value
                )
              }
            />
          )}
        </div>

        <div>
          <h2
            className="
            text-lg
            text-[#D6C08A]
            mb-3
            "
          >
            Choose Day
          </h2>

          <div
            className="
            grid
            grid-cols-2
            gap-3
            "
          >
            {days.map((day) => (
              <button
                type="button"
                key={day.date}
                onClick={() =>
                  chooseDay(day)
                }
                className={`
                h-16
                w-full
                rounded-xl
                border
                text-sm
                font-medium
                touch-manipulation
                select-none

                ${
                  selectedDay?.date ===
                  day.date
                    ? "bg-[#BFA15F] text-black border-[#BFA15F]"
                    : "bg-black border-[#BFA15F]/30"
                }
                `}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {selectedDay && (
          <div>
            <h2
              className="
              text-lg
              text-[#D6C08A]
              mb-3
              "
            >
              Choose Time
            </h2>

            {slots.length === 0 ? (
              <p
                className="
                text-gray-400
                "
              >
                No available times for
                this day.
              </p>
            ) : (
              <div
                className="
                grid
                grid-cols-2
                gap-3
                "
              >
                {slots.map((slot) => (
                  <button
                    type="button"
                    key={slot.start}
                    onClick={() =>
                      setSelectedSlot(
                        slot
                      )
                    }
                    className={`
                    h-16
                    w-full
                    rounded-xl
                    border
                    text-sm
                    font-medium
                    touch-manipulation

                    ${
                      selectedSlot?.start ===
                      slot.start
                        ? "bg-[#BFA15F] text-black border-[#BFA15F]"
                        : "bg-black border-[#BFA15F]/30"
                    }
                    `}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {message && (
          <p
            className="
            text-red-400
            text-center
            text-sm
            "
          >
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={confirmBooking}
          disabled={loading}
          className="
          w-full
          h-14
          bg-[#BFA15F]
          text-black
          rounded-xl
          font-bold
          text-lg
          touch-manipulation
          disabled:opacity-50
          "
        >
          {loading
            ? "Booking..."
            : "Confirm Booking"}
        </button>
      </div>
    </main>
  );
}