"use client";

import {
  Suspense,
  useState,
} from "react";

import {
  useSearchParams,
  useRouter,
} from "next/navigation";

import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";


function NewPaymentForm() {

  const searchParams =
    useSearchParams();

  const router =
    useRouter();


  const patient_id =
    searchParams.get("patient_id");

  const visit_id =
    searchParams.get("visit_id");


  const [amount, setAmount] =
    useState("");

  const [paymentType, setPaymentType] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("");

  const [paymentDate, setPaymentDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [paymentStatus, setPaymentStatus] =
    useState("Unpaid");

  const [currency, setCurrency] =
    useState("USD");

  const [notes, setNotes] =
    useState("");

  const [saving, setSaving] =
    useState(false);


  async function savePayment() {

    if (!patient_id) {

      alert(
        "Patient ID is missing"
      );

      return;

    }


    if (
      !amount ||
      Number(amount) <= 0
    ) {

      alert(
        "Please enter a valid amount"
      );

      return;

    }


    setSaving(true);


    const {
      error
    } = await supabase

      .from("payments")

      .insert({

        patient_id,

        visit_id:
          visit_id ||
          null,

        amount:
          Number(amount),

        payment_type:
          paymentType ||
          null,

        payment_method:
          paymentMethod ||
          null,

        payment_date:
          paymentDate ||
          null,

        payment_status:
          paymentStatus,

        currency,

        notes:
          notes.trim() ||
          null,

      });


    if (error) {

      console.error(
        "PAYMENT ERROR:",
        error
      );

      alert(
        error.message
      );

      setSaving(false);

      return;

    }


    alert(
      "Payment added successfully"
    );


    router.push(
      `/dashboard/patients/${patient_id}`
    );

  }


  function goBack() {

    if (patient_id) {

      router.push(
        `/dashboard/patients/${patient_id}`
      );

    } else {

      router.push(
        "/dashboard/patients"
      );

    }

  }


  return (

    <main
      className="
        min-h-screen
        bg-[#080808]
        text-white
        p-6
        pt-32
      "
    >

      <DashboardMenu />


      <div
        className="
          max-w-2xl
          mx-auto
        "
      >


        <button
          onClick={goBack}
          className="
            text-[#BFA15F]
            mb-6
            hover:underline
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

          Add Payment

        </h1>


        <div
          className="
            bg-[#171717]
            border
            border-[#BFA15F]/30
            rounded-xl
            p-6
            space-y-5
          "
        >


          <div>

            <label
              className="
                block
                mb-2
                text-gray-300
              "
            >

              Amount *

            </label>


            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) =>
                setAmount(
                  e.target.value
                )
              }
              placeholder="Enter amount"
              className="
                w-full
                bg-[#080808]
                border
                border-[#BFA15F]/30
                rounded-xl
                px-4
                py-3
                outline-none
                focus:border-[#BFA15F]
              "
            />

          </div>


          <div>

            <label
              className="
                block
                mb-2
                text-gray-300
              "
            >

              Currency

            </label>


            <select
              value={currency}
              onChange={(e) =>
                setCurrency(
                  e.target.value
                )
              }
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

            <label
              className="
                block
                mb-2
                text-gray-300
              "
            >

              Payment Type

            </label>


            <select
              value={paymentType}
              onChange={(e) =>
                setPaymentType(
                  e.target.value
                )
              }
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

            <label
              className="
                block
                mb-2
                text-gray-300
              "
            >

              Payment Method

            </label>


            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(
                  e.target.value
                )
              }
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

            <label
              className="
                block
                mb-2
                text-gray-300
              "
            >

              Payment Date

            </label>


            <input
              type="date"
              value={paymentDate}
              onChange={(e) =>
                setPaymentDate(
                  e.target.value
                )
              }
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


          <div>

            <label
              className="
                block
                mb-2
                text-gray-300
              "
            >

              Payment Status

            </label>


            <select
              value={paymentStatus}
              onChange={(e) =>
                setPaymentStatus(
                  e.target.value
                )
              }
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

            <label
              className="
                block
                mb-2
                text-gray-300
              "
            >

              Notes

            </label>


            <textarea
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              placeholder="Payment notes"
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
                resize-none
              "
            />

          </div>


          <button
            onClick={savePayment}
            disabled={saving}
            className="
              w-full
              bg-[#BFA15F]
              text-black
              py-3
              rounded-xl
              font-bold
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >

            {saving
              ? "Saving..."
              : "Save Payment"
            }

          </button>


        </div>


      </div>


    </main>

  );

}


function LoadingPage() {

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

      Loading...

    </main>

  );

}


export default function NewPaymentPage() {

  return (

    <Suspense
      fallback={
        <LoadingPage />
      }
    >

      <NewPaymentForm />

    </Suspense>

  );

}