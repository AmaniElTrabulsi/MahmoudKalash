"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

export default function NewExpensePage() {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);

  async function saveExpense() {
    if (!amount) {
      alert("Please enter an amount");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("expenses")
      .insert({
        amount: Number(amount),
        category: category || null,
        expense_date: expenseDate || null,
        description: description || null,
      });

    if (error) {
      console.error(error);
      alert(error.message);
      setSaving(false);
      return;
    }

    alert("Expense added successfully");

    router.push("/dashboard/finance");
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white p-6 pt-32">

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

        <h1 className="text-3xl font-bold text-[#BFA15F] mb-8">
          Add Expense
        </h1>

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
              placeholder="Enter amount"
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
              placeholder="e.g. Rent, Equipment, Supplies"
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
              placeholder="Description"
              className="w-full h-32 bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
            />
          </div>

          <button
            onClick={saveExpense}
            disabled={saving}
            className="w-full bg-[#BFA15F] text-black py-3 rounded-xl font-bold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Expense"}
          </button>

        </div>

      </div>

    </main>
  );
}