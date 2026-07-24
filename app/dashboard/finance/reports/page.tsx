"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

export default function FinanceReportsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [payments, setPayments] = useState<any[]>([]);
  const [otherIncome, setOtherIncome] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    loadReport();
  }, [month]);

  function getMonthDates(selectedMonth: string) {
    const [year, monthNumber] =
      selectedMonth.split("-").map(Number);

    const startDate = `${selectedMonth}-01`;

    const lastDay = new Date(
      year,
      monthNumber,
      0
    ).getDate();

    const endDate =
      `${selectedMonth}-${String(lastDay).padStart(2, "0")}`;

    return {
      startDate,
      endDate,
    };
  }

  async function loadReport() {
    setLoading(true);

    const {
      startDate,
      endDate,
    } = getMonthDates(month);

    const [
      paymentsResult,
      incomeResult,
      expensesResult,
    ] = await Promise.all([

      supabase
        .from("payments")
        .select("*")
        .eq("payment_status", "Paid")
        .gte("payment_date", startDate)
        .lte("payment_date", endDate)
        .order("payment_date", {
          ascending: true,
        }),

      supabase
        .from("other_income")
        .select("*")
        .gte("income_date", startDate)
        .lte("income_date", endDate)
        .order("income_date", {
          ascending: true,
        }),

      supabase
        .from("expenses")
        .select("*")
        .gte("expense_date", startDate)
        .lte("expense_date", endDate)
        .order("expense_date", {
          ascending: true,
        }),

    ]);

    if (paymentsResult.error) {
      console.error(
        "Payments error:",
        paymentsResult.error
      );
    }

    if (incomeResult.error) {
      console.error(
        "Income error:",
        incomeResult.error
      );
    }

    if (expensesResult.error) {
      console.error(
        "Expenses error:",
        expensesResult.error
      );
    }

    setPayments(
      paymentsResult.data || []
    );

    setOtherIncome(
      incomeResult.data || []
    );

    setExpenses(
      expensesResult.data || []
    );

    setLoading(false);
  }

  function changeMonth(amount: number) {
    const [year, monthNumber] =
      month.split("-").map(Number);

    const newDate = new Date(
      year,
      monthNumber - 1 + amount,
      1
    );

    const newMonth =
      `${newDate.getFullYear()}-${String(
        newDate.getMonth() + 1
      ).padStart(2, "0")}`;

    setMonth(newMonth);
  }

  function getMonthName() {
    const date = new Date(`${month}-01`);

    return date.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );
  }

  const patientIncome =
    payments.reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0
    );

  const additionalIncome =
    otherIncome.reduce(
      (total, income) =>
        total + Number(income.amount || 0),
      0
    );

  const totalIncome =
    patientIncome + additionalIncome;

  const totalExpenses =
    expenses.reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );

  const netProfit =
    totalIncome - totalExpenses;

  function formatAmount(amount: number) {
    return amount.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  }

  function printReport() {
    window.print();
  }

  function exportCSV() {
    const rows: string[][] = [];

    rows.push([
      "FINANCIAL REPORT",
    ]);

    rows.push([
      getMonthName(),
    ]);

    rows.push([]);

    rows.push([
      "SUMMARY",
    ]);

    rows.push([
      "Patient Payments",
      patientIncome.toFixed(2),
    ]);

    rows.push([
      "Other Income",
      additionalIncome.toFixed(2),
    ]);

    rows.push([
      "Total Income",
      totalIncome.toFixed(2),
    ]);

    rows.push([
      "Total Expenses",
      totalExpenses.toFixed(2),
    ]);

    rows.push([
      "Net Profit",
      netProfit.toFixed(2),
    ]);

    rows.push([]);

    rows.push([
      "PATIENT PAYMENTS",
    ]);

    rows.push([
      "Date",
      "Amount",
      "Type",
      "Method",
      "Status",
      "Notes",
    ]);

    payments.forEach((payment) => {
      rows.push([
        payment.payment_date || "",
        String(payment.amount || ""),
        payment.payment_type || "",
        payment.payment_method || "",
        payment.payment_status || "",
        payment.notes || "",
      ]);
    });

    rows.push([]);

    rows.push([
      "OTHER INCOME",
    ]);

    rows.push([
      "Date",
      "Amount",
      "Source",
      "Description",
    ]);

    otherIncome.forEach((income) => {
      rows.push([
        income.income_date || "",
        String(income.amount || ""),
        income.source || "",
        income.description || "",
      ]);
    });

    rows.push([]);

    rows.push([
      "EXPENSES",
    ]);

    rows.push([
      "Date",
      "Amount",
      "Category",
      "Description",
    ]);

    expenses.forEach((expense) => {
      rows.push([
        expense.expense_date || "",
        String(expense.amount || ""),
        expense.category || "",
        expense.description || "",
      ]);
    });

    const csv = rows
      .map((row) =>
        row
          .map((cell) =>
            `"${String(cell).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `financial-report-${month}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

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
        Loading Report...
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
        id="financial-report"
        className="max-w-6xl mx-auto"
      >

        <div
          className="
          flex
          justify-between
          items-center
          flex-wrap
          gap-4
          mb-8
          "
        >

          <div>

            <button
              onClick={() =>
                router.push(
                  "/dashboard/finance"
                )
              }
              className="
              text-[#BFA15F]
              mb-5
              print:hidden
              "
            >
              ← Back to Finance
            </button>

            <h1
              className="
              text-3xl
              font-bold
              text-[#BFA15F]
              "
            >
              Financial Reports
            </h1>

            <p className="text-gray-400 mt-2">
              Monthly financial report
            </p>

          </div>

        </div>

        <div
          className="
          bg-[#171717]
          border
          border-[#BFA15F]/30
          rounded-xl
          p-5
          mb-8
          print:hidden
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

            <button
              onClick={() =>
                changeMonth(-1)
              }
              className="
              bg-[#080808]
              border
              border-[#BFA15F]/30
              px-5
              py-3
              rounded-xl
              "
            >
              ← Previous Month
            </button>

            <div className="text-center">

              <h2
                className="
                text-2xl
                font-bold
                text-[#D6C08A]
                "
              >
                {getMonthName()}
              </h2>

              <input
                type="month"
                value={month}
                onChange={(e) =>
                  setMonth(e.target.value)
                }
                className="
                mt-3
                bg-[#080808]
                border
                border-[#BFA15F]/30
                rounded-xl
                px-4
                py-2
                "
              />

            </div>

            <button
              onClick={() =>
                changeMonth(1)
              }
              className="
              bg-[#080808]
              border
              border-[#BFA15F]/30
              px-5
              py-3
              rounded-xl
              "
            >
              Next Month →
            </button>

          </div>

        </div>

        <div
          className="
          flex
          gap-3
          flex-wrap
          mb-8
          print:hidden
          "
        >

          <button
            onClick={printReport}
            className="
            bg-[#BFA15F]
            text-black
            px-5
            py-3
            rounded-xl
            font-bold
            "
          >
            🖨 Print / Save PDF
          </button>

          <button
            onClick={exportCSV}
            className="
            bg-[#171717]
            border
            border-[#BFA15F]
            text-[#BFA15F]
            px-5
            py-3
            rounded-xl
            font-bold
            "
          >
            📊 Export Excel/CSV
          </button>

        </div>

        <div
          className="
          grid
          md:grid-cols-3
          gap-5
          mb-8
          "
        >

          <div
            className="
            bg-[#171717]
            border
            border-[#BFA15F]/30
            rounded-xl
            p-6
            "
          >

            <p className="text-gray-400">
              Total Income
            </p>

            <p
              className="
              text-3xl
              font-bold
              text-[#BFA15F]
              mt-3
              "
            >
              {formatAmount(totalIncome)}
            </p>

          </div>

          <div
            className="
            bg-[#171717]
            border
            border-[#BFA15F]/30
            rounded-xl
            p-6
            "
          >

            <p className="text-gray-400">
              Total Expenses
            </p>

            <p
              className="
              text-3xl
              font-bold
              text-red-400
              mt-3
              "
            >
              {formatAmount(totalExpenses)}
            </p>

          </div>

          <div
            className="
            bg-[#171717]
            border
            border-[#BFA15F]/30
            rounded-xl
            p-6
            "
          >

            <p className="text-gray-400">
              Net Profit
            </p>

            <p
              className={`
              text-3xl
              font-bold
              mt-3
              ${
                netProfit >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }
              `}
            >
              {formatAmount(netProfit)}
            </p>

          </div>

        </div>

        <section
          className="
          bg-[#171717]
          border
          border-[#BFA15F]/30
          rounded-xl
          p-6
          mb-8
          "
        >

          <h2
            className="
            text-2xl
            font-bold
            text-[#D6C08A]
            mb-6
            "
          >
            Report Summary
          </h2>

          <div className="space-y-4">

            <div
              className="
              flex
              justify-between
              border-b
              border-[#BFA15F]/20
              pb-4
              "
            >
              <span>
                Patient Payments
              </span>

              <span className="text-[#BFA15F]">
                {formatAmount(patientIncome)}
              </span>
            </div>

            <div
              className="
              flex
              justify-between
              border-b
              border-[#BFA15F]/20
              pb-4
              "
            >
              <span>
                Other Income
              </span>

              <span className="text-[#BFA15F]">
                {formatAmount(additionalIncome)}
              </span>
            </div>

            <div
              className="
              flex
              justify-between
              border-b
              border-[#BFA15F]/20
              pb-4
              "
            >
              <span>
                Total Income
              </span>

              <span className="text-[#BFA15F] font-bold">
                {formatAmount(totalIncome)}
              </span>
            </div>

            <div
              className="
              flex
              justify-between
              border-b
              border-[#BFA15F]/20
              pb-4
              "
            >
              <span>
                Total Expenses
              </span>

              <span className="text-red-400 font-bold">
                - {formatAmount(totalExpenses)}
              </span>
            </div>

            <div
              className="
              flex
              justify-between
              pt-2
              "
            >
              <span className="font-bold">
                Net Profit
              </span>

              <span
                className={
                  netProfit >= 0
                    ? "text-green-400 font-bold"
                    : "text-red-400 font-bold"
                }
              >
                {formatAmount(netProfit)}
              </span>
            </div>

          </div>

        </section>

        <section
          className="
          bg-[#171717]
          border
          border-[#BFA15F]/30
          rounded-xl
          p-6
          mb-8
          "
        >

          <h2
            className="
            text-2xl
            font-bold
            text-[#D6C08A]
            mb-6
            "
          >
            Patient Payments
          </h2>

          {payments.length === 0 ? (

            <p className="text-gray-400">
              No patient payments this month.
            </p>

          ) : (

            <div className="space-y-4">

              {payments.map((payment) => (

                <div
                  key={payment.id}
                  onClick={() =>
                    payment.patient_id &&
                    router.push(
                      `/dashboard/patients/${payment.patient_id}`
                    )
                  }
                  className="
                  bg-[#080808]
                  border
                  border-[#BFA15F]/20
                  rounded-xl
                  p-4
                  cursor-pointer
                  hover:border-[#BFA15F]
                  "
                >

                  <div
                    className="
                    flex
                    justify-between
                    flex-wrap
                    gap-3
                    "
                  >

                    <div>

                      <p className="font-bold">
                        {payment.payment_type ||
                          "Patient Payment"}
                      </p>

                      <p className="text-gray-400">
                        {payment.payment_date}
                      </p>

                      <p className="text-gray-400">
                        {payment.payment_method ||
                          "-"}
                      </p>

                    </div>

                    <p
                      className="
                      text-[#BFA15F]
                      font-bold
                      text-xl
                      "
                    >
                      {payment.amount}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        <section
          className="
          bg-[#171717]
          border
          border-[#BFA15F]/30
          rounded-xl
          p-6
          mb-8
          "
        >

          <h2
            className="
            text-2xl
            font-bold
            text-[#D6C08A]
            mb-6
            "
          >
            Other Income
          </h2>

          {otherIncome.length === 0 ? (

            <p className="text-gray-400">
              No other income this month.
            </p>

          ) : (

            <div className="space-y-4">

              {otherIncome.map((income) => (

                <div
                  key={income.id}
                  onClick={() =>
                    router.push(
                      `/dashboard/finance/income/${income.id}`
                    )
                  }
                  className="
                  bg-[#080808]
                  border
                  border-[#BFA15F]/20
                  rounded-xl
                  p-4
                  cursor-pointer
                  hover:border-[#BFA15F]
                  "
                >

                  <div
                    className="
                    flex
                    justify-between
                    flex-wrap
                    gap-3
                    "
                  >

                    <div>

                      <p className="font-bold">
                        {income.source ||
                          "Other Income"}
                      </p>

                      <p className="text-gray-400">
                        {income.income_date}
                      </p>

                      <p className="mt-2">
                        {income.description ||
                          "-"}
                      </p>

                    </div>

                    <p
                      className="
                      text-[#BFA15F]
                      font-bold
                      text-xl
                      "
                    >
                      + {income.amount}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        <section
          className="
          bg-[#171717]
          border
          border-[#BFA15F]/30
          rounded-xl
          p-6
          "
        >

          <h2
            className="
            text-2xl
            font-bold
            text-[#D6C08A]
            mb-6
            "
          >
            Expenses
          </h2>

          {expenses.length === 0 ? (

            <p className="text-gray-400">
              No expenses this month.
            </p>

          ) : (

            <div className="space-y-4">

              {expenses.map((expense) => (

                <div
                  key={expense.id}
                  onClick={() =>
                    router.push(
                      `/dashboard/finance/expenses/${expense.id}`
                    )
                  }
                  className="
                  bg-[#080808]
                  border
                  border-[#BFA15F]/20
                  rounded-xl
                  p-4
                  cursor-pointer
                  hover:border-[#BFA15F]
                  "
                >

                  <div
                    className="
                    flex
                    justify-between
                    flex-wrap
                    gap-3
                    "
                  >

                    <div>

                      <p className="font-bold">
                        {expense.category ||
                          "Expense"}
                      </p>

                      <p className="text-gray-400">
                        {expense.expense_date}
                      </p>

                      <p className="mt-2">
                        {expense.description ||
                          "-"}
                      </p>

                    </div>

                    <p
                      className="
                      text-red-400
                      font-bold
                      text-xl
                      "
                    >
                      - {expense.amount}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </div>

      <style jsx global>{`

        @media print {

          body {
            background: white !important;
            color: black !important;
          }

          #financial-report {
            max-width: 100% !important;
          }

          #financial-report * {
            color: black !important;
            border-color: #ccc !important;
          }

          .bg-[#171717],
          .bg-[#080808] {
            background: white !important;
          }

        }

      `}</style>

    </main>
  );
}