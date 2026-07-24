"use client";

import {
  useState,
} from "react";

import {
  useSearchParams,
  useRouter,
} from "next/navigation";

import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";


type Medicine = {
  medicine_name: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
};


export default function NewPrescriptionForm() {

  const searchParams =
    useSearchParams();

  const router =
    useRouter();


  const patient_id =
    searchParams.get("patient_id");

  const visit_id =
    searchParams.get("visit_id");


  const [notes, setNotes] =
    useState("");


  const [medicines, setMedicines] =
    useState<Medicine[]>([

      {
        medicine_name: "",
        dose: "",
        frequency: "",
        duration: "",
        instructions: "",
      },

    ]);


  const [saving, setSaving] =
    useState(false);


  function updateMedicine(
    index: number,
    field: keyof Medicine,
    value: string
  ) {

    const updated =
      [...medicines];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setMedicines(updated);
  }


  function addMedicine() {

    setMedicines([

      ...medicines,

      {
        medicine_name: "",
        dose: "",
        frequency: "",
        duration: "",
        instructions: "",
      },

    ]);
  }


  function removeMedicine(index: number) {

    if (medicines.length === 1) {
      return;
    }

    setMedicines(
      medicines.filter(
        (_, medicineIndex) =>
          medicineIndex !== index
      )
    );
  }


  async function savePrescription() {

    if (!patient_id) {

      alert(
        "Patient ID is missing"
      );

      return;
    }


    const validMedicines =
      medicines.filter(
        (medicine) =>
          medicine.medicine_name.trim() !== ""
      );


    if (
      validMedicines.length === 0
    ) {

      alert(
        "Please add at least one medicine"
      );

      return;
    }


    setSaving(true);


    try {

      const {
        data: prescription,
        error: prescriptionError,
      } = await supabase

        .from("prescriptions")

        .insert({

          patient_id,

          visit_id:
            visit_id || null,

          notes:
            notes.trim() || null,

        })

        .select()

        .single();


      if (prescriptionError) {

        console.error(
          prescriptionError
        );

        alert(
          prescriptionError.message
        );

        return;
      }


      const itemsToInsert =
        validMedicines.map(
          (medicine) => ({

            prescription_id:
              prescription.id,

            medicine_name:
              medicine.medicine_name.trim(),

            dose:
              medicine.dose.trim() || null,

            frequency:
              medicine.frequency.trim() || null,

            duration:
              medicine.duration.trim() || null,

            instructions:
              medicine.instructions.trim() || null,

          })
        );


      const {
        error: itemsError,
      } = await supabase

        .from("prescription_items")

        .insert(itemsToInsert);


      if (itemsError) {

        console.error(
          itemsError
        );


        await supabase

          .from("prescriptions")

          .delete()

          .eq(
            "id",
            prescription.id
          );


        alert(
          itemsError.message
        );

        return;
      }


      alert(
        "Prescription saved successfully"
      );


      router.push(
        `/dashboard/patients/${patient_id}`
      );


    } catch (error: any) {

      console.error(error);

      alert(
        error?.message ||
        "Something went wrong"
      );

    } finally {

      setSaving(false);
    }
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
          max-w-4xl
          mx-auto
        "
      >


        <button
          onClick={() =>
            router.push(
              `/dashboard/patients/${patient_id}`
            )
          }
          className="
            text-[#BFA15F]
            mb-6
          "
        >

          ← Back to Patient

        </button>


        <h1
          className="
            text-3xl
            font-bold
            text-[#BFA15F]
            mb-8
          "
        >

          New Prescription

        </h1>


        <div
          className="
            bg-[#171717]
            border
            border-[#BFA15F]/30
            rounded-xl
            p-6
          "
        >


          <div
            className="
              mb-8
            "
          >

            <label
              className="
                block
                mb-2
                text-gray-300
              "
            >

              Prescription Notes

            </label>


            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              placeholder="General prescription notes..."
              className="
                w-full
                h-32
                bg-[#080808]
                border
                border-[#BFA15F]/30
                rounded-xl
                px-4
                py-3
                outline-none
              "
            />

          </div>


          <div
            className="
              flex
              justify-between
              items-center
              mb-5
              gap-4
            "
          >

            <h2
              className="
                text-2xl
                font-bold
                text-[#D6C08A]
              "
            >

              Medicines

            </h2>


            <button
              onClick={addMedicine}
              className="
                bg-[#BFA15F]
                text-black
                px-4
                py-2
                rounded-xl
                font-bold
                whitespace-nowrap
              "
            >

              + Add Medicine

            </button>

          </div>


          {medicines.map(
            (medicine, index) => (

              <div
                key={index}
                className="
                  border
                  border-[#BFA15F]/30
                  rounded-xl
                  p-5
                  mb-6
                "
              >


                <div
                  className="
                    flex
                    justify-between
                    items-center
                    mb-5
                  "
                >

                  <h3
                    className="
                      text-xl
                      font-bold
                      text-[#D6C08A]
                    "
                  >

                    Medicine {index + 1}

                  </h3>


                  {medicines.length > 1 && (

                    <button
                      onClick={() =>
                        removeMedicine(index)
                      }
                      className="
                        text-red-400
                      "
                    >

                      Remove

                    </button>

                  )}

                </div>


                <div
                  className="
                    grid
                    md:grid-cols-2
                    gap-4
                  "
                >

                  <input
                    value={
                      medicine.medicine_name
                    }
                    onChange={(e) =>
                      updateMedicine(
                        index,
                        "medicine_name",
                        e.target.value
                      )
                    }
                    placeholder="Medicine Name *"
                    className="
                      w-full
                      bg-[#080808]
                      border
                      border-[#BFA15F]/30
                      rounded-xl
                      px-4
                      py-3
                      outline-none
                    "
                  />


                  <input
                    value={
                      medicine.dose
                    }
                    onChange={(e) =>
                      updateMedicine(
                        index,
                        "dose",
                        e.target.value
                      )
                    }
                    placeholder="Dose (e.g. 500 mg)"
                    className="
                      w-full
                      bg-[#080808]
                      border
                      border-[#BFA15F]/30
                      rounded-xl
                      px-4
                      py-3
                      outline-none
                    "
                  />


                  <input
                    value={
                      medicine.frequency
                    }
                    onChange={(e) =>
                      updateMedicine(
                        index,
                        "frequency",
                        e.target.value
                      )
                    }
                    placeholder="Frequency (e.g. 2 times daily)"
                    className="
                      w-full
                      bg-[#080808]
                      border
                      border-[#BFA15F]/30
                      rounded-xl
                      px-4
                      py-3
                      outline-none
                    "
                  />


                  <input
                    value={
                      medicine.duration
                    }
                    onChange={(e) =>
                      updateMedicine(
                        index,
                        "duration",
                        e.target.value
                      )
                    }
                    placeholder="Duration (e.g. 7 days)"
                    className="
                      w-full
                      bg-[#080808]
                      border
                      border-[#BFA15F]/30
                      rounded-xl
                      px-4
                      py-3
                      outline-none
                    "
                  />

                </div>


                <textarea
                  value={
                    medicine.instructions
                  }
                  onChange={(e) =>
                    updateMedicine(
                      index,
                      "instructions",
                      e.target.value
                    )
                  }
                  placeholder="Instructions..."
                  className="
                    w-full
                    h-28
                    mt-4
                    bg-[#080808]
                    border
                    border-[#BFA15F]/30
                    rounded-xl
                    px-4
                    py-3
                    outline-none
                  "
                />

              </div>

            )
          )}


          <button
            onClick={savePrescription}
            disabled={saving}
            className="
              w-full
              bg-[#BFA15F]
              text-black
              py-3
              rounded-xl
              font-bold
              disabled:opacity-50
            "
          >

            {saving
              ? "Saving..."
              : "Save Prescription"
            }

          </button>


        </div>

      </div>

    </main>

  );
}