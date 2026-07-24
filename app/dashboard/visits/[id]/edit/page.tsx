"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

export default function EditVisitPage() {
  const params = useParams();
  const router = useRouter();

  const visitId = params.id as string;

  const [visit, setVisit] = useState<any>(null);
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (visitId) {
      loadVisit();
    }
  }, [visitId]);

  async function loadVisit() {
    setLoading(true);

    try {
      // LOAD VISIT
      const { data: visitData, error: visitError } =
        await supabase
          .from("visits")
          .select("*")
          .eq("id", visitId)
          .single();

      if (visitError) {
        throw visitError;
      }

      setVisit(visitData);

      setSymptoms(
        visitData.symptoms || ""
      );

      setDiagnosis(
        visitData.diagnosis || ""
      );

      setDoctorNotes(
        visitData.doctor_notes || ""
      );

      setTreatmentPlan(
        visitData.treatment_plan || ""
      );

      setFollowUpDate(
        visitData.follow_up_date || ""
      );


      // LOAD PATIENT
      const { data: patientData } =
        await supabase
          .from("patients")
          .select(`
            first_name,
            last_name,
            patient_number
          `)
          .eq(
            "id",
            visitData.patient_id
          )
          .single();

      setPatient(patientData);


      // LOAD VITAL SIGNS
      const { data: vitalData } =
        await supabase
          .from("vital_signs")
          .select("*")
          .eq(
            "visit_id",
            visitId
          )
          .maybeSingle();

      if (vitalData) {

        setWeight(
          vitalData.weight || ""
        );

        setHeight(
          vitalData.height || ""
        );

        setBloodPressure(
          vitalData.blood_pressure || ""
        );

        setHeartRate(
          vitalData.heart_rate || ""
        );

        setTemperature(
          vitalData.temperature || ""
        );

        setOxygenLevel(
          vitalData.oxygen_level || ""
        );

      }

    } catch (error: any) {

      console.error(
        "Load visit error:",
        error
      );

      setErrorMessage(
        error?.message ||
        "Unable to load visit."
      );

    }

    setLoading(false);
  }


  async function updateVisit() {
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {

      // UPDATE VISIT
      const { error: visitError } =
        await supabase
          .from("visits")
          .update({

            symptoms:
              symptoms || null,

            diagnosis:
              diagnosis || null,

            doctor_notes:
              doctorNotes || null,

            treatment_plan:
              treatmentPlan || null,

            follow_up_date:
              followUpDate || null,

          })
          .eq(
            "id",
            visitId
          );

      if (visitError) {
        throw visitError;
      }


      // CHECK VITAL SIGNS
      const { data: existingVitals } =
        await supabase
          .from("vital_signs")
          .select("id")
          .eq(
            "visit_id",
            visitId
          )
          .maybeSingle();


      const vitalData = {

        weight:
          weight || null,

        height:
          height || null,

        blood_pressure:
          bloodPressure || null,

        heart_rate:
          heartRate || null,

        temperature:
          temperature || null,

        oxygen_level:
          oxygenLevel || null,

      };


      // UPDATE EXISTING VITALS
      if (existingVitals) {

        const { error } =
          await supabase
            .from("vital_signs")
            .update(vitalData)
            .eq(
              "id",
              existingVitals.id
            );

        if (error) {
          throw error;
        }

      }

      // CREATE VITALS IF THEY DO NOT EXIST
      else {

        const { error } =
          await supabase
            .from("vital_signs")
            .insert({

              visit_id:
                visitId,

              ...vitalData,

            });

        if (error) {
          throw error;
        }

      }


      setMessage(
        "Visit updated successfully."
      );


      setTimeout(() => {

        router.push(
          `/dashboard/visits/${visitId}`
        );

      }, 800);

    } catch (error: any) {

      console.error(
        "Update visit error:",
        error
      );

      setErrorMessage(
        error?.message ||
        "Unable to update visit."
      );

    }

    setSaving(false);
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

        <p className="
          text-[#BFA15F]
          text-xl
        ">
          Loading visit...
        </p>

      </main>
    );
  }


  if (!visit) {
    return (
      <main className="
        min-h-screen
        bg-[#080808]
        text-white
        flex
        items-center
        justify-center
      ">
        Visit not found
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

        <div className="mb-8">

          <button
            onClick={() =>
              router.push(
                `/dashboard/visits/${visitId}`
              )
            }
            className="
              text-gray-400
              hover:text-[#BFA15F]
              mb-4
            "
          >
            ← Back to Visit
          </button>

          <h1 className="
            text-3xl
            font-bold
            text-[#BFA15F]
          ">
            Edit Visit
          </h1>

          {patient && (

            <p className="
              text-gray-400
              mt-2
            ">

              Patient:{" "}

              <span className="
                text-white
                font-semibold
              ">
                {patient.first_name}{" "}
                {patient.last_name}
              </span>

              {" | ID: "}

              {patient.patient_number}

            </p>

          )}

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

            <TextArea
              label="Symptoms"
              value={symptoms}
              onChange={setSymptoms}
              full
            />

            <TextArea
              label="Diagnosis"
              value={diagnosis}
              onChange={setDiagnosis}
            />

            <TextArea
              label="Doctor Notes"
              value={doctorNotes}
              onChange={setDoctorNotes}
            />

            <TextArea
              label="Treatment Plan"
              value={treatmentPlan}
              onChange={setTreatmentPlan}
            />

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
                  setFollowUpDate(
                    e.target.value
                  )
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

            <Input
              placeholder="Weight"
              value={weight}
              onChange={setWeight}
            />

            <Input
              placeholder="Height"
              value={height}
              onChange={setHeight}
            />

            <Input
              placeholder="Blood Pressure"
              value={bloodPressure}
              onChange={setBloodPressure}
            />

            <Input
              placeholder="Heart Rate"
              value={heartRate}
              onChange={setHeartRate}
            />

            <Input
              placeholder="Temperature"
              value={temperature}
              onChange={setTemperature}
            />

            <Input
              placeholder="Oxygen Level"
              value={oxygenLevel}
              onChange={setOxygenLevel}
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
          mb-10
        ">

          <button
            onClick={() =>
              router.push(
                `/dashboard/visits/${visitId}`
              )
            }
            className="
              bg-[#292929]
              text-white
              px-8
              py-3
              rounded-xl
              font-bold
            "
          >
            Cancel
          </button>


          <button
            onClick={updateVisit}
            disabled={saving}
            className="
              bg-[#BFA15F]
              text-black
              px-8
              py-3
              rounded-xl
              font-bold
              disabled:opacity-50
            "
          >
            {saving
              ? "Saving..."
              : "Save Changes"
            }
          </button>

        </div>

      </div>

    </main>
  );
}


function Input({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={(e) =>
        onChange(e.target.value)
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
  );
}


function TextArea({
  label,
  value,
  onChange,
  full = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  full?: boolean;
}) {
  return (
    <div className={
      full
        ? "md:col-span-2"
        : ""
    }>

      <label className="
        block
        text-gray-400
        mb-2
      ">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
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
  );
}