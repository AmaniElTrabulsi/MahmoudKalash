"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

export default function PaymentDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [payment, setPayment] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");
  const [currency, setCurrency] = useState("USD");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (id) {
      loadPayment();
    }
  }, [id]);

  async function loadPayment() {
    setLoading(true);

    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      alert(error.message);
      setLoading(false);
      return;
    }

    setPayment(data);

    setAmount(
      data.amount?.toString() || ""
    );

    setPaymentType(
      data.payment_type || ""
    );

    setPaymentMethod(
      data.payment_method || ""
    );

    setPaymentDate(
      data.payment_date || ""
    );

    setPaymentStatus(
      data.payment_status || "Unpaid"
    );

    setCurrency(
      data.currency || "USD"
    );

    setNotes(
      data.notes || ""
    );

    setLoading(false);
  }

  async function saveChanges() {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("payments")
      .update({
        amount: Number(amount),
        payment_type: paymentType || null,
        payment_method: paymentMethod || null,
        payment_date: paymentDate || null,
        payment_status: paymentStatus,
        currency,
        notes: notes || null,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      setSaving(false);
      return;
    }

    alert("Payment updated successfully");

    setSaving(false);

    await loadPayment();
  }

  async function deletePayment() {
    const confirmed = confirm(
      "Are you sure you want to delete this payment?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    if (payment?.patient_id) {
      router.push(
        `/dashboard/patients/${payment.patient_id}`
      );
    } else {
      router.push(
        "/dashboard/patients"
      );
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  if (!payment) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        Payment not found
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white p-6 pt-32">

      <DashboardMenu />

      <div className="max-w-2xl mx-auto">

        <button
          onClick={() =>
            router.push(
              `/dashboard/patients/${payment.patient_id}`
            )
          }
          className="text-[#BFA15F] mb-6"
        >
          ← Back to Patient
        </button>

        <div className="flex justify-between items-center flex-wrap gap-4 mb-8">

          <h1 className="text-3xl font-bold text-[#BFA15F]">
            Edit Payment
          </h1>

          <button
            onClick={deletePayment}
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
              min="0"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              className="w-full bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-300">
              Currency
            </label>

            <select
              value={currency}
              onChange={(e) =>
                setCurrency(e.target.value)
              }
              className="w-full bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
            >
              <option value="USD">
                USD
              </option>

              <option value="LBP">
                LBP
              </option>

              <option value="EUR">
                EUR
              </option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-gray-300">
              Payment Type
            </label>

            <select
              value={paymentType}
              onChange={(e) =>
                setPaymentType(e.target.value)
              }
              className="w-full bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
            >
              <option value="">
                Select Payment Type
              </option>

              <option value="Consultation">
                Consultation
              </option>

              <option value="Follow-up">
                Follow-up
              </option>

              <option value="Procedure">
                Procedure
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-gray-300">
              Payment Method
            </label>

            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value)
              }
              className="w-full bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
            >
              <option value="">
                Select Payment Method
              </option>

              <option value="Cash">
                Cash
              </option>

              <option value="Card">
                Card
              </option>

              <option value="Bank Transfer">
                Bank Transfer
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-gray-300">
              Payment Date
            </label>

            <input
              type="date"
              value={paymentDate}
              onChange={(e) =>
                setPaymentDate(e.target.value)
              }
              className="w-full bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-300">
              Payment Status
            </label>

            <select
              value={paymentStatus}
              onChange={(e) =>
                setPaymentStatus(e.target.value)
              }
              className="w-full bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
            >
              <option value="Unpaid">
                Unpaid
              </option>

              <option value="Paid">
                Paid
              </option>

              <option value="Refunded">
                Refunded
              </option>

              <option value="Cancelled">
                Cancelled
              </option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-gray-300">
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              className="w-full h-32 bg-[#080808] border border-[#BFA15F]/30 rounded-xl px-4 py-3 outline-none"
            />
          </div>

          <button
            onClick={saveChanges}
            disabled={saving}
            className="w-full bg-[#BFA15F] text-black py-3 rounded-xl font-bold disabled:opacity-50"
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