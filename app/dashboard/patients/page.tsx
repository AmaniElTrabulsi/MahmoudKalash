"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

export default function PatientsPage() {
  const router = useRouter();

  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    setLoading(true);

    const { data, error } = await supabase
      .from("patients")
      .select(`
        id,
        patient_number,
        first_name,
        last_name,
        phone,
        date_of_birth,
        gender,
        medical_coverage
      `)
      .order("patient_number", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Error loading patients:",
        error
      );
    }

    setPatients(data || []);
    setLoading(false);
  }

  const filteredPatients = patients.filter(
    (patient) => {
      const text = [
        patient.first_name,
        patient.last_name,
        patient.phone,
        patient.patient_number,
        patient.gender,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(
        search.toLowerCase()
      );
    }
  );

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
      pt-24
      "
    >
      <DashboardMenu />

      <div
        className="
        max-w-7xl
        mx-auto
        "
      >
        <div
          className="
          flex
          justify-between
          items-center
          flex-wrap
          gap-4
          "
        >
          <h1
            className="
            text-3xl
            font-bold
            text-[#BFA15F]
            "
          >
            Patients
          </h1>

          <button
            onClick={() =>
              router.push(
                "/dashboard/patients/new"
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
            + New Patient
          </button>
        </div>

        <p className="text-gray-400 mt-2">
          Manage patient records
        </p>

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search by name, phone, patient ID, or gender"
          className="
          mt-8
          w-full
          h-14
          bg-[#171717]
          border
          border-[#BFA15F]/30
          rounded-xl
          px-4
          outline-none
          "
        />

        <div
          className="
          mt-8
          space-y-4
          "
        >
          {filteredPatients.length === 0 ? (
            <div
              className="
              bg-[#171717]
              border
              border-[#BFA15F]/30
              rounded-xl
              p-8
              text-center
              "
            >
              <p className="text-gray-400">
                No patients found
              </p>
            </div>
          ) : (
            filteredPatients.map(
              (patient) => (
                <div
                  key={patient.id}
                  onClick={() =>
                    router.push(
                      `/dashboard/patients/${patient.id}`
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
                  <div
                    className="
                    flex
                    justify-between
                    flex-wrap
                    gap-4
                    "
                  >
                    <div>
                      <h2
                        className="
                        text-xl
                        font-bold
                        "
                      >
                        {patient.first_name}{" "}
                        {patient.last_name}
                      </h2>

                      <p
                        className="
                        text-[#BFA15F]
                        mt-2
                        "
                      >
                        Patient ID:{" "}
                        {patient.patient_number}
                      </p>

                      <p
                        className="
                        text-gray-400
                        mt-1
                        "
                      >
                        Phone:{" "}
                        {patient.phone || "-"}
                      </p>

                      <p
                        className="
                        text-gray-400
                        mt-1
                        "
                      >
                        Gender:{" "}
                        {patient.gender || "-"}
                      </p>
                    </div>

                    <div
                      className="
                      text-right
                      "
                    >
                      <p
                        className="
                        text-gray-400
                        "
                      >
                        DOB:
                      </p>

                      <p>
                        {patient.date_of_birth ||
                          "-"}
                      </p>

                      <p
                        className="
                        text-[#D6C08A]
                        mt-3
                        "
                      >
                        {patient.medical_coverage ||
                          "No coverage"}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>
    </main>
  );
}