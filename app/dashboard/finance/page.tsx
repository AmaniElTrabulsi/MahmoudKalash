"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

type Tab =
  | "Overview"
  | "Income"
  | "Expenses"
  | "Reports";

export default function FinancePage() {
  const router = useRouter();

  const [activeTab, setActiveTab] =
    useState<Tab>("Overview");

  const [payments, setPayments] =
    useState<any[]>([]);

  const [otherIncome, setOtherIncome] =
    useState<any[]>([]);

  const [expenses, setExpenses] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  // Selected month for reports
  const [selectedMonth, setSelectedMonth] =
    useState(() => {
      const now = new Date();

      return `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}`;
    });

  useEffect(() => {
    loadFinanceData();
  }, []);

  async function loadFinanceData() {
    setLoading(true);

    const [
      paymentsResult,
      incomeResult,
      expensesResult,
    ] = await Promise.all([
      supabase
        .from("payments")
        .select("*")
        .eq("payment_status", "Paid")
        .order("payment_date", {
          ascending: false,
        }),

      supabase
        .from("other_income")
        .select("*")
        .order("income_date", {
          ascending: false,
        }),

      supabase
        .from("expenses")
        .select("*")
        .order("expense_date", {
          ascending: false,
        }),
    ]);

    if (paymentsResult.error) {
      console.error(paymentsResult.error);
    }

    if (incomeResult.error) {
      console.error(incomeResult.error);
    }

    if (expensesResult.error) {
      console.error(expensesResult.error);
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

  /*
  |--------------------------------------------------------------------------
  | ALL-TIME TOTALS
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | SELECTED MONTH
  |--------------------------------------------------------------------------
  */

  const monthlyPayments =
    payments.filter((payment) =>
      payment.payment_date?.startsWith(
        selectedMonth
      )
    );

  const monthlyOtherIncome =
    otherIncome.filter((income) =>
      income.income_date?.startsWith(
        selectedMonth
      )
    );

  const monthlyExpenses =
    expenses.filter((expense) =>
      expense.expense_date?.startsWith(
        selectedMonth
      )
    );

  const monthlyPatientIncome =
    monthlyPayments.reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0
    );

  const monthlyAdditionalIncome =
    monthlyOtherIncome.reduce(
      (total, income) =>
        total + Number(income.amount || 0),
      0
    );

  const monthlyTotalIncome =
    monthlyPatientIncome +
    monthlyAdditionalIncome;

  const monthlyTotalExpenses =
    monthlyExpenses.reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );

  const monthlyNetProfit =
    monthlyTotalIncome -
    monthlyTotalExpenses;

  /*
  |--------------------------------------------------------------------------
  | HELPERS
  |--------------------------------------------------------------------------
  */

  function formatAmount(
    amount: number
  ) {
    return amount.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  }

  function formatMonth(
    month: string
  ) {
    const [year, monthNumber] =
      month.split("-");

    const date = new Date(
      Number(year),
      Number(monthNumber) - 1,
      1
    );

    return date.toLocaleDateString(
      undefined,
      {
        month: "long",
        year: "numeric",
      }
    );
  }

  function changeMonth(
    direction: number
  ) {
    const [year, month] =
      selectedMonth
        .split("-")
        .map(Number);

    const date = new Date(
      year,
      month - 1 + direction,
      1
    );

    setSelectedMonth(
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`
    );
  }

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

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
          Loading Finance...
        </p>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

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
        max-w-7xl
        mx-auto
        "
      >

        <h1
          className="
          text-3xl
          font-bold
          text-[#BFA15F]
          "
        >
          Finance
        </h1>

        <p
          className="
          text-gray-400
          mt-2
          "
        >
          Manage clinic income, expenses, and reports
        </p>

        {/* TABS */}

        <div
          className="
          flex
          gap-3
          flex-wrap
          mt-8
          mb-8
          "
        >

          {[
            "Overview",
            "Income",
            "Expenses",
            "Reports",
          ].map((tab) => (

            <button
              key={tab}
              onClick={() =>
                setActiveTab(
                  tab as Tab
                )
              }
              className={`
                px-5
                py-3
                rounded-xl
                border
                ${
                  activeTab === tab
                    ? "bg-[#BFA15F] text-black border-[#BFA15F]"
                    : "bg-[#171717] border-[#BFA15F]/30"
                }
              `}
            >
              {tab}
            </button>

          ))}

        </div>

        {/* OVERVIEW */}

        {activeTab === "Overview" && (

          <section>

            <div
              className="
              grid
              sm:grid-cols-2
              lg:grid-cols-4
              gap-5
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

                <p
                  className="
                  text-gray-400
                  "
                >
                  Patient Income
                </p>

                <p
                  className="
                  text-3xl
                  font-bold
                  text-[#BFA15F]
                  mt-3
                  "
                >
                  {formatAmount(
                    patientIncome
                  )}
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

                <p
                  className="
                  text-gray-400
                  "
                >
                  Other Income
                </p>

                <p
                  className="
                  text-3xl
                  font-bold
                  text-[#BFA15F]
                  mt-3
                  "
                >
                  {formatAmount(
                    additionalIncome
                  )}
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

                <p
                  className="
                  text-gray-400
                  "
                >
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
                  {formatAmount(
                    totalExpenses
                  )}
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

                <p
                  className="
                  text-gray-400
                  "
                >
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
                  {formatAmount(
                    netProfit
                  )}
                </p>

              </div>

            </div>

          </section>

        )}

        {/* INCOME */}

        {activeTab === "Income" && (

          <section>

            <div
              className="
              flex
              justify-between
              items-center
              flex-wrap
              gap-4
              mb-6
              "
            >

              <h2
                className="
                text-2xl
                font-bold
                text-[#D6C08A]
                "
              >
                Income
              </h2>

              <button
                onClick={() =>
                  router.push(
                    "/dashboard/finance/income/new"
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
                + Add Other Income
              </button>

            </div>

            <div
              className="
              space-y-4
              "
            >

              {otherIncome.length === 0 ? (

                <p
                  className="
                  text-gray-400
                  "
                >
                  No other income
                </p>

              ) : (

                otherIncome.map((income) => (

                  <div
                    key={income.id}
                    onClick={() =>
                      router.push(
                        `/dashboard/finance/income/${income.id}`
                      )
                    }
                    className="
                    p-5
                    bg-[#171717]
                    border
                    border-[#BFA15F]/30
                    rounded-xl
                    cursor-pointer
                    hover:border-[#BFA15F]
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

                        <h3
                          className="
                          font-bold
                          "
                        >
                          {income.source ||
                            "Other Income"}
                        </h3>

                        <p
                          className="
                          text-gray-400
                          "
                        >
                          {income.income_date}
                        </p>

                        <p
                          className="
                          mt-2
                          "
                        >
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
                        + {formatAmount(
                          Number(
                            income.amount
                          )
                        )}
                      </p>

                    </div>

                  </div>

                ))

              )}

            </div>

          </section>

        )}

        {/* EXPENSES */}

        {activeTab === "Expenses" && (

          <section>

            <div
              className="
              flex
              justify-between
              items-center
              flex-wrap
              gap-4
              mb-6
              "
            >

              <h2
                className="
                text-2xl
                font-bold
                text-[#D6C08A]
                "
              >
                Expenses
              </h2>

              <button
                onClick={() =>
                  router.push(
                    "/dashboard/finance/expenses/new"
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
                + Add Expense
              </button>

            </div>

            {expenses.length === 0 ? (

              <p
                className="
                text-gray-400
                "
              >
                No expenses
              </p>

            ) : (

              <div
                className="
                space-y-4
                "
              >

                {expenses.map((expense) => (

                  <div
                    key={expense.id}
                    onClick={() =>
                      router.push(
                        `/dashboard/finance/expenses/${expense.id}`
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

                        <h3
                          className="
                          font-bold
                          "
                        >
                          {expense.category ||
                            "Expense"}
                        </h3>

                        <p
                          className="
                          text-gray-400
                          "
                        >
                          {expense.expense_date}
                        </p>

                        <p
                          className="
                          mt-2
                          "
                        >
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
                        - {formatAmount(
                          Number(
                            expense.amount
                          )
                        )}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

        )}

        {/* REPORTS */}

        {activeTab === "Reports" && (

          <section>

            <div
              className="
              flex
              justify-between
              items-center
              flex-wrap
              gap-4
              mb-6
              "
            >

              <h2
                className="
                text-2xl
                font-bold
                text-[#D6C08A]
                "
              >
                Monthly Financial Report
              </h2>

            </div>

            {/* MONTH SELECTOR */}

            <div
              className="
              bg-[#171717]
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
                items-center
                justify-between
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
                  px-4
                  py-2
                  rounded-xl
                  "
                >
                  ←
                </button>

                <h3
                  className="
                  text-xl
                  font-bold
                  text-[#BFA15F]
                  text-center
                  "
                >
                  {formatMonth(
                    selectedMonth
                  )}
                </h3>

                <button
                  onClick={() =>
                    changeMonth(1)
                  }
                  className="
                  bg-[#080808]
                  border
                  border-[#BFA15F]/30
                  px-4
                  py-2
                  rounded-xl
                  "
                >
                  →
                </button>

              </div>

              <input
                type="month"
                value={selectedMonth}
                onChange={(e) =>
                  setSelectedMonth(
                    e.target.value
                  )
                }
                className="
                mt-5
                w-full
                bg-[#080808]
                border
                border-[#BFA15F]/30
                rounded-xl
                px-4
                py-3
                "
              />

            </div>

            {/* MONTHLY SUMMARY */}

            <div
              className="
              grid
              sm:grid-cols-2
              lg:grid-cols-4
              gap-5
              mb-6
              "
            >

              <div
                className="
                bg-[#171717]
                border
                border-[#BFA15F]/30
                rounded-xl
                p-5
                "
              >

                <p
                  className="
                  text-gray-400
                  "
                >
                  Patient Income
                </p>

                <p
                  className="
                  text-2xl
                  font-bold
                  text-[#BFA15F]
                  mt-2
                  "
                >
                  {formatAmount(
                    monthlyPatientIncome
                  )}
                </p>

              </div>


              <div
                className="
                bg-[#171717]
                border
                border-[#BFA15F]/30
                rounded-xl
                p-5
                "
              >

                <p
                  className="
                  text-gray-400
                  "
                >
                  Other Income
                </p>

                <p
                  className="
                  text-2xl
                  font-bold
                  text-[#BFA15F]
                  mt-2
                  "
                >
                  {formatAmount(
                    monthlyAdditionalIncome
                  )}
                </p>

              </div>


              <div
                className="
                bg-[#171717]
                border
                border-[#BFA15F]/30
                rounded-xl
                p-5
                "
              >

                <p
                  className="
                  text-gray-400
                  "
                >
                  Expenses
                </p>

                <p
                  className="
                  text-2xl
                  font-bold
                  text-red-400
                  mt-2
                  "
                >
                  {formatAmount(
                    monthlyTotalExpenses
                  )}
                </p>

              </div>


              <div
                className="
                bg-[#171717]
                border
                border-[#BFA15F]/30
                rounded-xl
                p-5
                "
              >

                <p
                  className="
                  text-gray-400
                  "
                >
                  Net Profit
                </p>

                <p
                  className={`
                  text-2xl
                  font-bold
                  mt-2
                  ${
                    monthlyNetProfit >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }
                  `}
                >
                  {formatAmount(
                    monthlyNetProfit
                  )}
                </p>

              </div>

            </div>

            {/* DETAILS */}

            <div
              className="
              grid
              lg:grid-cols-2
              gap-6
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

                <h3
                  className="
                  text-xl
                  font-bold
                  text-[#D6C08A]
                  mb-5
                  "
                >
                  Income Details
                </h3>

                <p
                  className="
                  flex
                  justify-between
                  py-3
                  border-b
                  border-[#BFA15F]/10
                  "
                >
                  <span>
                    Patient Payments
                  </span>

                  <span
                    className="
                    text-[#BFA15F]
                    "
                  >
                    {monthlyPayments.length}
                  </span>
                </p>

                <p
                  className="
                  flex
                  justify-between
                  py-3
                  "
                >
                  <span>
                    Other Income Records
                  </span>

                  <span
                    className="
                    text-[#BFA15F]
                    "
                  >
                    {monthlyOtherIncome.length}
                  </span>
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

                <h3
                  className="
                  text-xl
                  font-bold
                  text-[#D6C08A]
                  mb-5
                  "
                >
                  Expense Details
                </h3>

                <p
                  className="
                  flex
                  justify-between
                  py-3
                  "
                >
                  <span>
                    Number of Expenses
                  </span>

                  <span
                    className="
                    text-red-400
                    "
                  >
                    {monthlyExpenses.length}
                  </span>
                </p>

              </div>

            </div>

          </section>

        )}

      </div>

    </main>
  );
}