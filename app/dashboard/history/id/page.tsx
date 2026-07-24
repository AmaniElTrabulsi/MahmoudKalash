"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

export default function MedicalHistoryDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [history, setHistory] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (id) {
      loadHistory();
    }
  }, [id]);

  async function loadHistory() {
    setLoading(true);

    const { data, error } = await supabase
      .from("medical_history")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      alert(error.message);
      setLoading(false);
      return;
    }

    setHistory(data);

    setCategory(data.category || "");
    setTitle(data.title || "");
    setDescription(data.description || "");
    setDate(data.date || "");

    setLoading(false);
  }

  async function saveChanges() {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("medical_history")
      .update({
        category: category || null,
        title,
        description: description || null,
        date: date || null,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      setSaving(false);
      return;
    }

    alert("Medical history updated successfully");

    setSaving(false);

    await loadHistory();
  }

  async function deleteHistory() {
    const confirmed = confirm(
      "Are you sure you want to delete this medical history record?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("medical_history")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    if (history?.patient_id) {
      router.push(
        `/dashboard/patients/${history.patient_id}`
      );
    } else {
      router.push("/dashboard/patients");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  if (!history) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        Medical history record not found
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white p-6 pt-24">

      <DashboardMenu />

      <div className="max-w-3xl mx-auto">

        <button
          onClick={() =>
            router.push(
              `/dashboard/patients/${history.patient_id}`
            )
          }
          className="text-[#BFA15F] mb-6"
        >
          ← Back to Patient
        </button>

        <div className="flex justify-between items-center flex-wrap gap-4 mb-8">

          <h1 className="text-3xl font-bold text-[#BFA15F]">
            Medical History
          </h1>

          <button
            onClick={deleteHistory}
            className="bg-red-600 text-white px-5 py-3 rounded-xl font-bold"
          >
            Delete
          </button>

        </div>

        <div className="bg-[#171717] border border-[#BFA15F]/30 rounded-xl p-6 space-y-5">

          <div>
            <label className="block mb-2 text-gray-300">
              Category
            </label>

            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category"
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
              placeholder="Title"
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
              placeholder="Description"
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