"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

export default function VisitDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const visitId = params.id as string;

  const [visit, setVisit] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [vitals, setVitals] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (visitId) {
      loadVisit();
    }
  }, [visitId]);

  async function loadVisit() {
    setLoading(true);
    setErrorMessage("");

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

      // LOAD PATIENT
      if (visitData.patient_id) {
        const { data: patientData, error: patientError } =
          await supabase
            .from("patients")
            .select(`
              id,
              first_name,
              last_name,
              patient_number
            `)
            .eq("id", visitData.patient_id)
            .single();

        if (patientError) {
          console.error("Patient error:", patientError);
        } else {
          setPatient(patientData);
        }
      }

      // LOAD VITAL SIGNS
      const { data: vitalData, error: vitalError } =
        await supabase
          .from("vital_signs")
          .select("*")
          .eq("visit_id", visitId)
          .maybeSingle();

      if (vitalError) {
        console.error("Vital signs error:", vitalError);
      } else {
        setVitals(vitalData);
      }

    } catch (error: any) {
      console.error("Load visit error:", error);

      setErrorMessage(
        error?.message ||
        "Unable to load visit."
      );
    }

    setLoading(false);
  }

  async function deleteVisit() {
    if (!visit) return;

    setDeleting(true);

    try {
      // DELETE VITAL SIGNS FIRST
      const { error: vitalError } =
        await supabase
          .from("vital_signs")
          .delete()
          .eq("visit_id", visit.id);

      if (vitalError) {
        throw vitalError;
      }

      // DELETE VISIT
      const { error: visitError } =
        await supabase
          .from("visits")
          .delete()
          .eq("id", visit.id);

      if (visitError) {
        throw visitError;
      }

      // RETURN TO PATIENT
      router.push(
        `/dashboard/patients/${visit.patient_id}`
      );

    } catch (error: any) {
      console.error("Delete visit error:", error);

      alert(
        error?.message ||
        "Unable to delete visit."
      );

      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  function formatDate(date: string) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
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
        p-6
        pt-32
      ">

        <DashboardMenu />

        <div className="
          max-w-6xl
          mx-auto
        ">

          <div className="
            bg-red-900/30
            border
            border-red-500/50
            text-red-300
            rounded-xl
            p-5
          ">
            {errorMessage || "Visit not found."}
          </div>

          <button
            onClick={() => router.back()}
            className="
              mt-5
              bg-[#292929]
              text-white
              px-6
              py-3
              rounded-xl
              font-bold
            "
          >
            ← Go Back
          </button>

        </div>

      </main>
    );
  }

  return (
    <main className="
      min-h-screen
      bg-[#080808]
      text-white
      p-6
      pt-32
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
          gap-5
          mb-8
        ">

          <div>

            <button
              onClick={() => router.back()}
              className="
                text-gray-400
                hover:text-[#BFA15F]
                mb-4
              "
            >
              ← Back
            </button>

            <h1 className="
              text-3xl
              font-bold
              text-[#BFA15F]
            ">
              Visit Details
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

                <span className="
                  text-[#D6C08A]
                ">
                  {patient.patient_number}
                </span>

              </p>

            )}

          </div>


          {/* ACTION BUTTONS */}

          <div className="
            flex
            gap-3
            flex-wrap
          ">

            <button
              onClick={() =>
                router.push(
                  `/dashboard/visits/${visit.id}/edit`
                )
              }
              className="
                bg-[#BFA15F]
                text-black
                px-5
                py-3
                rounded-xl
                font-bold
                hover:bg-[#D6C08A]
              "
            >
              Edit Visit
            </button>

            <button
              onClick={() =>
                setShowDeleteConfirm(true)
              }
              className="
                bg-red-900/40
                border
                border-red-500/50
                text-red-300
                px-5
                py-3
                rounded-xl
                font-bold
                hover:bg-red-900/60
              "
            >
              Delete Visit
            </button>

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
            grid-cols-1
            md:grid-cols-3
            gap-6
          ">

            <InfoBox
              label="Visit Date"
              value={formatDate(
                visit.visit_date
              )}
            />

            <InfoBox
              label="Visit Type"
              value={
                visit.appointment_id
                  ? "Appointment Visit"
                  : "Urgent / Walk-in Visit"
              }
            />

            <InfoBox
              label="Status"
              value={
                visit.visit_status ||
                "Completed"
              }
            />

            <InfoBox
              label="Follow-up Date"
              value={
                visit.follow_up_date
                  ? formatDate(
                      visit.follow_up_date
                    )
                  : "No follow-up scheduled"
              }
            />

          </div>

        </section>


        {/* SYMPTOMS */}

        <TextSection
          title="Symptoms"
          value={visit.symptoms}
          empty="No symptoms recorded."
        />


        {/* DIAGNOSIS */}

        <TextSection
          title="Diagnosis"
          value={visit.diagnosis}
          empty="No diagnosis recorded."
        />


        {/* DOCTOR NOTES */}

        <TextSection
          title="Doctor Notes"
          value={visit.doctor_notes}
          empty="No doctor notes recorded."
        />


        {/* TREATMENT PLAN */}

        <TextSection
          title="Treatment Plan"
          value={visit.treatment_plan}
          empty="No treatment plan recorded."
        />


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

          {vitals ? (

            <div className="
              grid
              grid-cols-1
              md:grid-cols-2
              lg:grid-cols-3
              gap-5
            ">

              <VitalCard
                label="Weight"
                value={vitals.weight}
              />

              <VitalCard
                label="Height"
                value={vitals.height}
              />

              <VitalCard
                label="Blood Pressure"
                value={vitals.blood_pressure}
              />

              <VitalCard
                label="Heart Rate"
                value={vitals.heart_rate}
              />

              <VitalCard
                label="Temperature"
                value={vitals.temperature}
              />

              <VitalCard
                label="Oxygen Level"
                value={vitals.oxygen_level}
              />

            </div>

          ) : (

            <p className="
              text-gray-400
            ">
              No vital signs recorded.
            </p>

          )}

        </section>


        {/* BOTTOM ACTIONS */}

        <div className="
          flex
          gap-4
          flex-wrap
          mb-10
        ">

          <button
            onClick={() =>
              router.push(
                `/dashboard/patients/${visit.patient_id}`
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
            Back to Patient
          </button>

          <button
            onClick={() =>
              router.push(
                `/dashboard/visits/new?patient_id=${visit.patient_id}`
              )
            }
            className="
              bg-[#BFA15F]
              text-black
              px-8
              py-3
              rounded-xl
              font-bold
            "
          >
            New Visit
          </button>

        </div>

      </div>


      {/* DELETE CONFIRMATION MODAL */}

      {showDeleteConfirm && (

        <div className="
          fixed
          inset-0
          bg-black/70
          flex
          items-center
          justify-center
          z-50
          p-4
        ">

          <div className="
            bg-[#171717]
            border
            border-red-500/40
            rounded-2xl
            p-6
            max-w-md
            w-full
          ">

            <h2 className="
              text-xl
              font-bold
              text-red-400
              mb-3
            ">
              Delete Visit?
            </h2>

            <p className="
              text-gray-300
              mb-6
            ">
              This will permanently delete this visit
              and its vital signs. This action cannot
              be undone.
            </p>

            <div className="
              flex
              gap-3
              justify-end
            ">

              <button
                onClick={() =>
                  setShowDeleteConfirm(false)
                }
                disabled={deleting}
                className="
                  bg-[#292929]
                  text-white
                  px-5
                  py-2
                  rounded-lg
                "
              >
                Cancel
              </button>

              <button
                onClick={deleteVisit}
                disabled={deleting}
                className="
                  bg-red-600
                  text-white
                  px-5
                  py-2
                  rounded-lg
                  font-bold
                  disabled:opacity-50
                "
              >
                {deleting
                  ? "Deleting..."
                  : "Yes, Delete"
                }
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}


function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="
        text-sm
        text-gray-400
        mb-1
      ">
        {label}
      </p>

      <p className="
        text-white
        font-semibold
      ">
        {value || "-"}
      </p>

    </div>
  );
}


function TextSection({
  title,
  value,
  empty,
}: {
  title: string;
  value: string | null;
  empty: string;
}) {
  return (
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
        mb-4
      ">
        {title}
      </h2>

      <div className="
        bg-[#0d0d0d]
        rounded-xl
        p-5
        text-gray-300
        whitespace-pre-wrap
      ">
        {value || empty}
      </div>

    </section>
  );
}


function VitalCard({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div className="
      bg-[#0d0d0d]
      border
      border-[#BFA15F]/20
      rounded-xl
      p-5
    ">

      <p className="
        text-sm
        text-gray-400
        mb-2
      ">
        {label}
      </p>

      <p className="
        text-lg
        text-white
        font-bold
      ">
        {value || "Not recorded"}
      </p>

    </div>
  );
}