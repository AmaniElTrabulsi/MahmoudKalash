"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

export default function PrescriptionsPage() {
  const router = useRouter();

  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  async function loadPrescriptions() {
    setLoading(true);

    const { data, error } = await supabase
      .from("prescriptions")
      .select(`
        id,
        patient_id,
        notes,
        created_at,
        patients (
          first_name,
          last_name,
          patient_number
        ),
        prescription_items (
          id,
          medicine_name,
          dose,
          frequency,
          duration,
          instructions
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Prescriptions error:", error);
      setPrescriptions([]);
    } else {
      setPrescriptions(data || []);
    }

    setLoading(false);
  }

  function formatDate(date: string) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        Loading prescriptions...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white p-6 pt-32">

      <DashboardMenu />

      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center flex-wrap gap-4 mb-8">

          <div>
            <h1 className="text-3xl font-bold text-[#BFA15F]">
              Prescriptions
            </h1>

            <p className="text-gray-400 mt-2">
              Manage patient prescriptions
            </p>
          </div>

        </div>

        {prescriptions.length === 0 ? (

          <div className="
            bg-[#171717]
            border
            border-[#BFA15F]/30
            rounded-xl
            p-6
            text-gray-400
          ">
            No prescriptions found.
          </div>

        ) : (

          <div className="space-y-5">

            {prescriptions.map((prescription) => {

              const patient = Array.isArray(prescription.patients)
                ? prescription.patients[0]
                : prescription.patients;

              return (

                <div
                  key={prescription.id}
                  onClick={() =>
                    router.push(
                      `/dashboard/prescriptions/${prescription.id}`
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

                  <div className="
                    flex
                    justify-between
                    items-start
                    flex-wrap
                    gap-4
                  ">

                    <div>

                      <h2 className="
                        text-xl
                        font-bold
                        text-[#D6C08A]
                      ">
                        {patient
                          ? `${patient.first_name} ${patient.last_name}`
                          : "Unknown Patient"}
                      </h2>

                      <p className="text-gray-400 text-sm mt-1">
                        Patient Number:{" "}
                        {patient?.patient_number || "-"}
                      </p>

                      <p className="text-gray-400 text-sm mt-1">
                        Date:{" "}
                        {formatDate(
                          prescription.created_at
                        )}
                      </p>

                    </div>

                    <span className="
                      text-[#BFA15F]
                      text-sm
                      font-bold
                    ">
                      View Prescription →
                    </span>

                  </div>

                  {prescription.notes && (

                    <p className="
                      mt-4
                      text-gray-300
                      text-sm
                    ">
                      <span className="text-gray-500">
                        Notes:
                      </span>{" "}
                      {prescription.notes}
                    </p>

                  )}

                  {prescription.prescription_items &&
                    prescription.prescription_items.length > 0 && (

                    <div className="
                      mt-4
                      pt-4
                      border-t
                      border-[#BFA15F]/20
                    ">

                      <h3 className="
                        text-[#BFA15F]
                        font-bold
                        mb-3
                      ">
                        Medicines
                      </h3>

                      <div className="space-y-3">

                        {prescription.prescription_items.map(
                          (item: any) => (

                            <div
                              key={item.id}
                              className="
                                bg-[#080808]
                                rounded-lg
                                p-3
                              "
                            >

                              <p className="
                                font-bold
                                text-[#D6C08A]
                              ">
                                {item.medicine_name}
                              </p>

                              <p className="text-sm text-gray-300 mt-1">
                                Dose: {item.dose || "-"}
                              </p>

                              <p className="text-sm text-gray-300">
                                Frequency:{" "}
                                {item.frequency || "-"}
                              </p>

                              <p className="text-sm text-gray-300">
                                Duration:{" "}
                                {item.duration || "-"}
                              </p>

                              <p className="text-sm text-gray-300">
                                Instructions:{" "}
                                {item.instructions || "-"}
                              </p>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )}

                </div>

              );

            })}

          </div>

        )}

      </div>

    </main>
  );
}