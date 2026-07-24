"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

type Medicine = {
  id?: string;
  medicine_name: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
};

export default function PrescriptionDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [prescription, setPrescription] = useState<any>(null);

  const [notes, setNotes] = useState("");

  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadPrescription();
    }
  }, [id]);

  async function loadPrescription() {
    setLoading(true);

    const { data, error } = await supabase
      .from("prescriptions")
      .select(`
        id,
        patient_id,
        visit_id,
        notes,
        created_at,
        prescription_items (
          id,
          prescription_id,
          medicine_name,
          dose,
          frequency,
          duration,
          instructions
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      alert(error.message);
      setLoading(false);
      return;
    }

    setPrescription(data);

    setNotes(data.notes || "");

    setMedicines(
      data.prescription_items?.map((item: any) => ({
        id: item.id,
        medicine_name: item.medicine_name || "",
        dose: item.dose || "",
        frequency: item.frequency || "",
        duration: item.duration || "",
        instructions: item.instructions || "",
      })) || []
    );

    setLoading(false);
  }

  function updateMedicine(
    index: number,
    field: keyof Medicine,
    value: string
  ) {
    const updated = [...medicines];

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
    setMedicines(
      medicines.filter((_, medicineIndex) => medicineIndex !== index)
    );
  }

  async function saveChanges() {
    const validMedicines = medicines.filter(
      (medicine) => medicine.medicine_name.trim() !== ""
    );

    if (validMedicines.length === 0) {
      alert("Please add at least one medicine");
      return;
    }

    setSaving(true);

    const { error: prescriptionError } = await supabase
      .from("prescriptions")
      .update({
        notes: notes || null,
      })
      .eq("id", id);

    if (prescriptionError) {
      console.error(prescriptionError);
      alert(prescriptionError.message);
      setSaving(false);
      return;
    }

    const { error: deleteItemsError } = await supabase
      .from("prescription_items")
      .delete()
      .eq("prescription_id", id);

    if (deleteItemsError) {
      console.error(deleteItemsError);
      alert(deleteItemsError.message);
      setSaving(false);
      return;
    }

    const itemsToInsert = validMedicines.map((medicine) => ({
      prescription_id: id,
      medicine_name: medicine.medicine_name,
      dose: medicine.dose || null,
      frequency: medicine.frequency || null,
      duration: medicine.duration || null,
      instructions: medicine.instructions || null,
    }));

    const { error: insertItemsError } = await supabase
      .from("prescription_items")
      .insert(itemsToInsert);

    if (insertItemsError) {
      console.error(insertItemsError);
      alert(insertItemsError.message);
      setSaving(false);
      return;
    }

    alert("Prescription updated successfully");

    setSaving(false);

    await loadPrescription();
  }

  async function deletePrescription() {
    const confirmed = confirm(
      "Are you sure you want to delete this prescription?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("prescriptions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    router.push(
      `/dashboard/patients/${prescription.patient_id}`
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  if (!prescription) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        Prescription not found
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white p-6 pt-24">

      <DashboardMenu />

      <div className="max-w-4xl mx-auto">

        <button
          onClick={() =>
            router.push(
              `/dashboard/patients/${prescription.patient_id}`
            )
          }
          className="text-[#BFA15F] mb-6"
        >
          ← Back to Patient
        </button>

        <div className="flex justify-between items-center flex-wrap gap-4 mb-8">

          <div>

            <h1 className="text-3xl font-bold text-[#BFA15F]">
              Prescription
            </h1>

            <p className="text-gray-400 mt-2">
              Created:{" "}
              {new Date(
                prescription.created_at
              ).toLocaleDateString()}
            </p>

          </div>

          <button
            onClick={deletePrescription}
            className="bg-red-600 text-white px-5 py-3 rounded-xl font-bold"
          >
            Delete
          </button>

        </div>

        <div className="bg-[#171717] border border-[#BFA15F]/30 rounded-xl p-6">

          <div className="mb-8">

            <label className="block mb-2 text-gray-300">
              Prescription Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Prescription notes..."
              className="w-full h-32 bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
            />

          </div>

          <div className="flex justify-between items-center mb-5">

            <h2 className="text-2xl font-bold text-[#D6C08A]">
              Medicines
            </h2>

            <button
              onClick={addMedicine}
              className="bg-[#BFA15F] text-black px-4 py-2 rounded-xl font-bold"
            >
              + Add Medicine
            </button>

          </div>

          {medicines.map((medicine, index) => (

            <div
              key={medicine.id || index}
              className="border border-[#BFA15F]/30 rounded-xl p-5 mb-6"
            >

              <div className="flex justify-between items-center mb-5">

                <h3 className="text-xl font-bold text-[#D6C08A]">
                  Medicine {index + 1}
                </h3>

                <button
                  onClick={() => removeMedicine(index)}
                  className="text-red-400"
                >
                  Remove
                </button>

              </div>

              <div className="grid md:grid-cols-2 gap-4">

                <input
                  value={medicine.medicine_name}
                  onChange={(e) =>
                    updateMedicine(
                      index,
                      "medicine_name",
                      e.target.value
                    )
                  }
                  placeholder="Medicine Name *"
                  className="bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
                />

                <input
                  value={medicine.dose}
                  onChange={(e) =>
                    updateMedicine(
                      index,
                      "dose",
                      e.target.value
                    )
                  }
                  placeholder="Dose"
                  className="bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
                />

                <input
                  value={medicine.frequency}
                  onChange={(e) =>
                    updateMedicine(
                      index,
                      "frequency",
                      e.target.value
                    )
                  }
                  placeholder="Frequency"
                  className="bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
                />

                <input
                  value={medicine.duration}
                  onChange={(e) =>
                    updateMedicine(
                      index,
                      "duration",
                      e.target.value
                    )
                  }
                  placeholder="Duration"
                  className="bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
                />

              </div>

              <textarea
                value={medicine.instructions}
                onChange={(e) =>
                  updateMedicine(
                    index,
                    "instructions",
                    e.target.value
                  )
                }
                placeholder="Instructions..."
                className="w-full h-28 mt-4 bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
              />

            </div>

          ))}

          <button
            onClick={saveChanges}
            disabled={saving}
            className="w-full bg-[#BFA15F] text-black py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>

      </div>

    </main>
  );
}