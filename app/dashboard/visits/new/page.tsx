"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

export default function NewVisitPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const patient_id = searchParams.get("patient_id");
  const appointment_id = searchParams.get("appointment_id");

  const [patient, setPatient] = useState<any>(null);

  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [oxygenLevel, setOxygenLevel] = useState("");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!patient_id) {
      setLoading(false);
      return;
    }

    loadPatient();
  }, [patient_id]);

  async function loadPatient() {
    if (!patient_id) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("patients")
      .select(`
        first_name,
        last_name,
        patient_number
      `)
      .eq("id", patient_id)
      .single();

    if (error) {
      console.error(error);
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setPatient(data);
    setLoading(false);
  }

  async function saveVisit() {
    setMessage("");
    setErrorMessage("");

    if (!patient_id) {
      setErrorMessage("Patient not selected.");
      return;
    }

    setSaving(true);

    try {
      // 1. CREATE VISIT
      const { data: visit, error: visitError } = await supabase
        .from("visits")
        .insert({
          patient_id: patient_id,

          // Urgent visit = null
          // Appointment visit = appointment ID
          appointment_id: appointment_id || null,

          visit_date: new Date()
            .toISOString()
            .split("T")[0],

          symptoms: symptoms || null,

          diagnosis: diagnosis || null,

          doctor_notes: doctorNotes || null,

          treatment_plan: treatmentPlan || null,

          follow_up_date: followUpDate || null,

          visit_status: "Completed",
        })
        .select()
        .single();

      if (visitError) {
        console.error("Visit error:", visitError);
        setErrorMessage(visitError.message);
        setSaving(false);
        return;
      }

      // 2. CREATE VITAL SIGNS
      const { error: vitalError } = await supabase
        .from("vital_signs")
        .insert({
          visit_id: visit.id,

          weight: weight || null,

          height: height || null,

          blood_pressure: bloodPressure || null,

          heart_rate: heartRate || null,

          temperature: temperature || null,

          oxygen_level: oxygenLevel || null,
        });

      if (vitalError) {
        console.error("Vital signs error:", vitalError);

        setErrorMessage(vitalError.message);

        setSaving(false);

        return;
      }

      // 3. COMPLETE APPOINTMENT ONLY IF THERE IS ONE
      if (appointment_id) {
        const { error: appointmentError } = await supabase
          .from("appointments")
          .update({
            status: "Completed",
          })
          .eq("id", appointment_id);

        if (appointmentError) {
          console.error(
            "Appointment update error:",
            appointmentError
          );
        }
      }

      setMessage("Visit saved successfully.");

      setTimeout(() => {
        router.push(
          `/dashboard/patients/${patient_id}`
        );
      }, 1000);

    } catch (error: any) {
      console.error(error);

      setErrorMessage(
        error?.message ||
        "Something went wrong while saving the visit."
      );

      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="
        min-h-screen
        bg-[#080808]
        text-white
        flex
        items-center
        justify-center
      ">

        <p className="text-[#BFA15F] text-xl">
          Loading patient...
        </p>

      </main>
    );
  }

  return (
    <main className="
      min-h-screen
      bg-[#080808]
      text-white
      p-6
      pt-24
    ">

      <DashboardMenu />

      <div className="
        max-w-6xl
        mx-auto
      ">

        {/* HEADER */}

        <div className="
          flex
          justify-between
          items-start
          flex-wrap
          gap-4
          mb-8
        ">

          <div>

            <h1 className="
              text-3xl
              font-bold
              text-[#BFA15F]
            ">

              New Visit

            </h1>

            {patient && (

              <p className="
                text-gray-400
                mt-2
              ">

                Patient:{" "}

                <span className="text-white">

                  {patient.first_name}{" "}
                  {patient.last_name}

                </span>

                {" | ID: "}

                {patient.patient_number}

              </p>

            )}

          </div>


          <div className="
            bg-[#171717]
            border
            border-[#BFA15F]/30
            rounded-xl
            px-4
            py-2
          ">

            <p className="
              text-sm
              text-gray-400
            ">

              Visit Type

            </p>

            <p className="
              text-[#D6C08A]
              font-bold
            ">

              {appointment_id
                ? "Appointment Visit"
                : "Urgent / Walk-in Visit"
              }

            </p>

          </div>

        </div>


        {/* VISIT INFORMATION */}

        <section className="
          bg-[#171717]
          border
          border-[#BFA15F]/30
          rounded-xl
          p-6
          mb-8
        ">

          <h2 className="
            text-xl
            font-bold
            text-[#D6C08A]
            mb-6
          ">

            Visit Information

          </h2>


          <div className="
            grid
            md:grid-cols-2
            gap-5
          ">

            <div className="md:col-span-2">

              <label className="
                block
                text-gray-400
                mb-2
              ">

                Symptoms

              </label>

              <textarea
                value={symptoms}
                onChange={(e) =>
                  setSymptoms(e.target.value)
                }
                placeholder="Describe the patient's symptoms..."
                className="
                  w-full
                  bg-[#0d0d0d]
                  border
                  border-[#BFA15F]/30
                  rounded-xl
                  p-4
                  text-white
                  min-h-[130px]
                  outline-none
                  focus:border-[#BFA15F]
                "
              />

            </div>


            <div>

              <label className="
                block
                text-gray-400
                mb-2
              ">

                Diagnosis

              </label>

              <textarea
                value={diagnosis}
                onChange={(e) =>
                  setDiagnosis(e.target.value)
                }
                placeholder="Diagnosis..."
                className="
                  w-full
                  bg-[#0d0d0d]
                  border
                  border-[#BFA15F]/30
                  rounded-xl
                  p-4
                  text-white
                  min-h-[130px]
                  outline-none
                  focus:border-[#BFA15F]
                "
              />

            </div>


            <div>

              <label className="
                block
                text-gray-400
                mb-2
              ">

                Doctor Notes

              </label>

              <textarea
                value={doctorNotes}
                onChange={(e) =>
                  setDoctorNotes(e.target.value)
                }
                placeholder="Additional notes..."
                className="
                  w-full
                  bg-[#0d0d0d]
                  border
                  border-[#BFA15F]/30
                  rounded-xl
                  p-4
                  text-white
                  min-h-[130px]
                  outline-none
                  focus:border-[#BFA15F]
                "
              />

            </div>


            <div>

              <label className="
                block
                text-gray-400
                mb-2
              ">

                Treatment Plan

              </label>

              <textarea
                value={treatmentPlan}
                onChange={(e) =>
                  setTreatmentPlan(e.target.value)
                }
                placeholder="Treatment plan..."
                className="
                  w-full
                  bg-[#0d0d0d]
                  border
                  border-[#BFA15F]/30
                  rounded-xl
                  p-4
                  text-white
                  min-h-[130px]
                  outline-none
                  focus:border-[#BFA15F]
                "
              />

            </div>


            <div>

              <label className="
                block
                text-gray-400
                mb-2
              ">

                Follow Up Date

              </label>

              <input
                type="date"
                value={followUpDate}
                onChange={(e) =>
                  setFollowUpDate(e.target.value)
                }
                className="
                  w-full
                  bg-[#0d0d0d]
                  border
                  border-[#BFA15F]/30
                  rounded-xl
                  p-4
                  text-white
                  outline-none
                  focus:border-[#BFA15F]
                "
              />

            </div>

          </div>

        </section>


        {/* VITAL SIGNS */}

        <section className="
          bg-[#171717]
          border
          border-[#BFA15F]/30
          rounded-xl
          p-6
          mb-8
        ">

          <h2 className="
            text-xl
            font-bold
            text-[#D6C08A]
            mb-6
          ">

            Vital Signs

          </h2>


          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-5
          ">

            <input
              placeholder="Weight"
              value={weight}
              onChange={(e) =>
                setWeight(e.target.value)
              }
              className="
                w-full
                bg-[#0d0d0d]
                border
                border-[#BFA15F]/30
                rounded-xl
                p-4
                text-white
                outline-none
                focus:border-[#BFA15F]
              "
            />


            <input
              placeholder="Height"
              value={height}
              onChange={(e) =>
                setHeight(e.target.value)
              }
              className="
                w-full
                bg-[#0d0d0d]
                border
                border-[#BFA15F]/30
                rounded-xl
                p-4
                text-white
                outline-none
                focus:border-[#BFA15F]
              "
            />


            <input
              placeholder="Blood Pressure"
              value={bloodPressure}
              onChange={(e) =>
                setBloodPressure(e.target.value)
              }
              className="
                w-full
                bg-[#0d0d0d]
                border
                border-[#BFA15F]/30
                rounded-xl
                p-4
                text-white
                outline-none
                focus:border-[#BFA15F]
              "
            />


            <input
              placeholder="Heart Rate"
              value={heartRate}
              onChange={(e) =>
                setHeartRate(e.target.value)
              }
              className="
                w-full
                bg-[#0d0d0d]
                border
                border-[#BFA15F]/30
                rounded-xl
                p-4
                text-white
                outline-none
                focus:border-[#BFA15F]
              "
            />


            <input
              placeholder="Temperature"
              value={temperature}
              onChange={(e) =>
                setTemperature(e.target.value)
              }
              className="
                w-full
                bg-[#0d0d0d]
                border
                border-[#BFA15F]/30
                rounded-xl
                p-4
                text-white
                outline-none
                focus:border-[#BFA15F]
              "
            />


            <input
              placeholder="Oxygen Level"
              value={oxygenLevel}
              onChange={(e) =>
                setOxygenLevel(e.target.value)
              }
              className="
                w-full
                bg-[#0d0d0d]
                border
                border-[#BFA15F]/30
                rounded-xl
                p-4
                text-white
                outline-none
                focus:border-[#BFA15F]
              "
            />

          </div>

        </section>


        {/* MESSAGES */}

        {errorMessage && (

          <div className="
            mb-5
            bg-red-900/30
            border
            border-red-500/50
            text-red-300
            rounded-xl
            p-4
          ">

            {errorMessage}

          </div>

        )}


        {message && (

          <div className="
            mb-5
            bg-green-900/30
            border
            border-green-500/50
            text-green-300
            rounded-xl
            p-4
          ">

            {message}

          </div>

        )}


        {/* ACTIONS */}

        <div className="
          flex
          gap-4
          flex-wrap
        ">

          <button
            onClick={() =>
              router.push(
                `/dashboard/patients/${patient_id}`
              )
            }
            className="
              bg-[#292929]
              text-white
              px-8
              py-3
              rounded-xl
              font-bold
              hover:bg-[#383838]
            "
          >

            Cancel

          </button>


          <button
            onClick={saveVisit}
            disabled={saving || !patient_id}
            className="
              bg-[#BFA15F]
              text-black
              px-8
              py-3
              rounded-xl
              font-bold
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >

            {saving
              ? "Saving..."
              : "Save Visit"
            }

          </button>

        </div>

      </div>

    </main>
  );
}