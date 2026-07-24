"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

export default function NewMedicalHistoryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const patient_id = searchParams.get("patient_id");

  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const [saving, setSaving] = useState(false);

  async function saveHistory() {
    if (!patient_id) {
      alert("Patient ID is missing");
      return;
    }

    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("medical_history")
      .insert({
        patient_id,
        category: category || null,
        title,
        description: description || null,
        date: date || null,
      });

    if (error) {
      console.error(error);
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push(`/dashboard/patients/${patient_id}`);
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white p-6 pt-24">

      <DashboardMenu />

      <div className="max-w-3xl mx-auto">

        <button
          onClick={() =>
            router.push(`/dashboard/patients/${patient_id}`)
          }
          className="text-[#BFA15F] mb-6"
        >
          ← Back to Patient
        </button>

        <h1 className="text-3xl font-bold text-[#BFA15F] mb-8">
          Add Medical History
        </h1>

        <div className="bg-[#171717] border border-[#BFA15F]/30 rounded-xl p-6 space-y-5">

          <div>
            <label className="block mb-2 text-gray-300">
              Category
            </label>

            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Example: Allergy, Surgery, Chronic Disease"
              className="w-full bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-300">
              Title *
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Example: Appendectomy"
              className="w-full bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-300">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the medical history..."
              className="w-full h-36 bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-300">
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
            />
          </div>

          <button
            onClick={saveHistory}
            disabled={saving}
            className="w-full bg-[#BFA15F] text-black py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Medical History"}
          </button>

        </div>

      </div>

    </main>
  );
}