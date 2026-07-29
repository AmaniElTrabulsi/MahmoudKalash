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
  const [countryCode, setCountryCode] = useState("+961");

  const [medicalCoverage, setMedicalCoverage] = useState("");
  const [otherCoverage, setOtherCoverage] = useState("");
  const [insuranceProvider, setInsuranceProvider] = useState("");

const [days, setDays] = useState<any[]>([]);
const [selectedDay, setSelectedDay] = useState<any>(null);

const [weekOffset, setWeekOffset] = useState(0);
const [weekLabel, setWeekLabel] = useState("");

  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [consultationType, setConsultationType] = useState("");
const [country, setCountry] = useState("");

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
}, [weekOffset]);

  function generateDays() {
  const result: any[] = [];

  const today = new Date();

  // Move to the first Monday after today
  const start = new Date(today);

  start.setDate(
    start.getDate() +
      (weekOffset * 7)
  );

  // Find next Monday
  while (start.getDay() !== 1) {
    start.setDate(
      start.getDate() + 1
    );
  }


  const startDate = new Date(start);


  const endDate = new Date(start);

  endDate.setDate(
    endDate.getDate() + 3
  );


  setWeekLabel(
    `${startDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    )} - ${endDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    )}`
  );


  for (let i = 0; i < 4; i++) {

    const date = new Date(start);

    date.setDate(
      start.getDate() + i
    );


    const year =
      date.getFullYear();


    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");


    const dayNumber =
      String(
        date.getDate()
      ).padStart(2, "0");


    result.push({

      date:
        `${year}-${month}-${dayNumber}`,


      label:
        date.toLocaleDateString(
          "en-US",
          {
            weekday: "short",
            day: "numeric",
            month: "short",
          }
        ),

    });
  }


  setDays(result);

  // clear selected day when changing weeks
  setSelectedDay(null);
  setSelectedSlot(null);
  setSlots([]);
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
    phone.replace(/\D/g,"");


  return (
    countryCode +
    value
  );

}

  function isValidPhone(){

const value =
phone.replace(/\D/g,"");


return value.length >= 6;

}

  async function confirmBooking() {
  setMessage("");

  if (
    !firstName.trim() ||
    !lastName.trim() ||
    !dateOfBirth ||
    !phone.trim() ||
    !consultationType ||
    !selectedDay ||
    !selectedSlot ||
    (
      consultationType === "Online Consultation" &&
      !country
    )
  ) {
    setMessage(
      "Please complete all required fields"
    );

    return;
  }

  if (!isValidPhone()) {
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


        // NEW
        consultation_type:
          consultationType,


        // NEW
        country:
          consultationType ===
          "Online Consultation"
            ? country
            : null,


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

<select
className="
bg-black
text-[#BFA15F]
px-3
outline-none
border-r
border-[#BFA15F]/30
"
value={countryCode}
onChange={(e)=>
setCountryCode(e.target.value)
}
>

<option value="+961">
🇱🇧 +961
</option>

<option value="+49">
🇩🇪 +49
</option>

<option value="+33">
🇫🇷 +33
</option>

<option value="+1">
🇺🇸 +1
</option>

<option value="+44">
🇬🇧 +44
</option>

<option value="+971">
🇦🇪 +971
</option>

<option value="+966">
🇸🇦 +966
</option>

<option value="+974">
🇶🇦 +974
</option>

<option value="+965">
🇰🇼 +965
</option>

<option value="+20">
🇪🇬 +20
</option>

</select>


<input
className="
flex-1
min-w-0
bg-transparent
px-3
outline-none
text-base
"
placeholder="Phone number"
value={phone}
onChange={(e)=>
setPhone(e.target.value)
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
    value={consultationType}
    onChange={(e) => {
      const value = e.target.value;

      setConsultationType(value);

      if (value !== "Online Consultation") {
        setCountry("");
      }
    }}
  >
    <option value="">
      Appointment Type *
    </option>

    <option value="Clinic Appointment">
      🏥 Clinic Appointment
    </option>

    <option value="Online Consultation">
      💻 Online Consultation
    </option>
  </select>

  {consultationType === "Online Consultation" && (
    <select
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
      value={country}
      onChange={(e) =>
        setCountry(e.target.value)
      }
    >
      <option value="">
        Select Country *
      </option>

      <option value="Lebanon">
        Lebanon
      </option>

      <option value="United Arab Emirates">
        United Arab Emirates
      </option>

      <option value="Saudi Arabia">
        Saudi Arabia
      </option>

      <option value="Qatar">
        Qatar
      </option>

      <option value="Kuwait">
        Kuwait
      </option>

      <option value="Oman">
        Oman
      </option>

      <option value="Bahrain">
        Bahrain
      </option>

      <option value="Jordan">
        Jordan
      </option>

      <option value="Iraq">
        Iraq
      </option>

      <option value="Egypt">
        Egypt
      </option>

      <option value="Germany">
        Germany
      </option>

      <option value="France">
        France
      </option>

      <option value="United Kingdom">
        United Kingdom
      </option>

      <option value="United States">
        United States
      </option>

      <option value="Canada">
        Canada
      </option>

      <option value="Australia">
        Australia
      </option>

      <option value="Other">
        Other
      </option>
    </select>
  )}
</div>
        <div>
          <div className="flex items-center justify-between mb-3">

  <button
    type="button"
    disabled={weekOffset === 0}
    onClick={() =>
      setWeekOffset(
        weekOffset - 1
      )
    }
    className="
    w-10
    h-10
    rounded-full
    bg-black
    border
    border-[#BFA15F]/30
    text-[#BFA15F]
    disabled:opacity-30
    "
  >
    ←
  </button>


  <div className="text-center">

    <h2
      className="
      text-lg
      text-[#D6C08A]
      "
    >
      Week {weekOffset + 1}
    </h2>

    <p
      className="
      text-sm
      text-gray-400
      "
    >
      {weekLabel}
    </p>

  </div>


  <button
    type="button"
    onClick={() =>
      setWeekOffset(
        weekOffset + 1
      )
    }
    className="
    w-10
    h-10
    rounded-full
    bg-black
    border
    border-[#BFA15F]/30
    text-[#BFA15F]
    "
  >
    →
  </button>

</div>

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