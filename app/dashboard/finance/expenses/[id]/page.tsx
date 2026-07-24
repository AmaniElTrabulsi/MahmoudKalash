"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

export default function ExpenseDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (id) {
      loadExpense();
    }
  }, [id]);

  async function loadExpense() {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setAmount(String(data.amount || ""));
    setCategory(data.category || "");
    setExpenseDate(data.expense_date || "");
    setDescription(data.description || "");

    setLoading(false);
  }

  async function saveChanges() {
    if (!amount) {
      alert("Please enter an amount");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("expenses")
      .update({
        amount: Number(amount),
        category: category || null,
        expense_date: expenseDate || null,
        description: description || null,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      setSaving(false);
      return;
    }

    alert("Expense updated successfully");

    setSaving(false);

    router.push("/dashboard/finance");
  }

  async function deleteExpense() {
    const confirmed = confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    router.push("/dashboard/finance");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white p-6 pt-24">

      <DashboardMenu />

      <div className="max-w-3xl mx-auto">

        <button
          onClick={() =>
            router.push("/dashboard/finance")
          }
          className="text-[#BFA15F] mb-6"
        >
          ← Back to Finance
        </button>

        <div className="flex justify-between items-center flex-wrap gap-4 mb-8">

          <h1 className="text-3xl font-bold text-[#BFA15F]">
            Edit Expense
          </h1>

          <button
            onClick={deleteExpense}
            className="bg-red-600 text-white px-5 py-3 rounded-xl font-bold"
          >
            Delete
          </button>

        </div>

        <div className="bg-[#171717] border border-[#BFA15F]/30 rounded-xl p-6 space-y-5">

          <div>
            <label className="block mb-2 text-gray-300">
              Amount *
            </label>

            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              className="w-full bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-300">
              Category
            </label>

            <input
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="w-full bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-300">
              Expense Date
            </label>

            <input
              type="date"
              value={expenseDate}
              onChange={(e) =>
                setExpenseDate(e.target.value)
              }
              className="w-full bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-300">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className="w-full h-32 bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
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