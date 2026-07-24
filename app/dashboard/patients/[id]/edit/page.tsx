"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

export default function EditPatientPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<any>({});

  useEffect(() => {
    loadPatient();
  }, []);

  async function loadPatient() {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setForm(data);
    setLoading(false);
  }

  function updateField(name: string, value: any) {
    setForm((previousForm: any) => ({
      ...previousForm,
      [name]: value,
    }));
  }

  async function savePatient() {
    setSaving(true);

    const { error } = await supabase
      .from("patients")
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        gender: form.gender || null,
        date_of_birth: form.date_of_birth || null,
        phone: form.phone || null,
        email: form.email || null,
        medical_coverage:
          form.medical_coverage || null,
        insurance_provider:
          form.insurance_provider || null,
        insurance_number:
          form.insurance_number || null,
        blood_type:
          form.blood_type || null,
        has_allergy:
          form.has_allergy || false,
        allergy_details:
          form.allergy_details || null,
        address:
          form.address || null,
        emergency_contact_name:
          form.emergency_contact_name || null,
        emergency_contact_phone:
          form.emergency_contact_phone || null,
        notes:
          form.notes || null,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    router.push(`/dashboard/patients/${id}`);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <DashboardMenu />
        Loading patient...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white p-4 sm:p-6 pt-32">
      <DashboardMenu />

      <div className="max-w-5xl mx-auto">

        <button
          onClick={() =>
            router.push(`/dashboard/patients/${id}`)
          }
          className="text-[#BFA15F] hover:text-[#D6C08A] transition mb-5"
        >
          ← Back to Patient
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold text-[#BFA15F]">
          Edit Patient
        </h1>

        <p className="text-gray-400 mt-2 mb-8">
          Update the patient's personal and medical information.
        </p>

        {/* PERSONAL INFORMATION */}

        <section className="bg-[#171717] border border-[#BFA15F]/25 rounded-2xl p-5 sm:p-7 mb-6">

          <h2 className="text-xl font-bold text-[#D6C08A]">
            Personal Information
          </h2>

          <p className="text-sm text-gray-500 mt-1 mb-6">
            Basic information about the patient
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-semibold text-[#D6C08A] mb-2">
                First Name
              </label>

              <input
                className="w-full h-14 bg-[#080808] border border-[#BFA15F]/25 rounded-xl px-4 outline-none focus:border-[#BFA15F]"
                value={form.first_name || ""}
                onChange={(e) =>
                  updateField(
                    "first_name",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#D6C08A] mb-2">
                Last Name
              </label>

              <input
                className="w-full h-14 bg-[#080808] border border-[#BFA15F]/25 rounded-xl px-4 outline-none focus:border-[#BFA15F]"
                value={form.last_name || ""}
                onChange={(e) =>
                  updateField(
                    "last_name",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#D6C08A] mb-2">
                Gender
              </label>

              <select
                className="w-full h-14 bg-[#080808] border border-[#BFA15F]/25 rounded-xl px-4 outline-none focus:border-[#BFA15F]"
                value={form.gender || ""}
                onChange={(e) =>
                  updateField(
                    "gender",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select gender
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#D6C08A] mb-2">
                Date of Birth
              </label>

              <input
                type="date"
                className="w-full h-14 bg-[#080808] border border-[#BFA15F]/25 rounded-xl px-4 outline-none focus:border-[#BFA15F]"
                value={form.date_of_birth || ""}
                onChange={(e) =>
                  updateField(
                    "date_of_birth",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#D6C08A] mb-2">
                Phone Number
              </label>

              <input
                className="w-full h-14 bg-[#080808] border border-[#BFA15F]/25 rounded-xl px-4 outline-none focus:border-[#BFA15F]"
                value={form.phone || ""}
                onChange={(e) =>
                  updateField(
                    "phone",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#D6C08A] mb-2">
                Email Address
              </label>

              <input
                type="email"
                className="w-full h-14 bg-[#080808] border border-[#BFA15F]/25 rounded-xl px-4 outline-none focus:border-[#BFA15F]"
                value={form.email || ""}
                onChange={(e) =>
                  updateField(
                    "email",
                    e.target.value
                  )
                }
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#D6C08A] mb-2">
                Address
              </label>

              <textarea
                className="w-full min-h-[110px] bg-[#080808] border border-[#BFA15F]/25 rounded-xl px-4 py-4 outline-none resize-y focus:border-[#BFA15F]"
                value={form.address || ""}
                onChange={(e) =>
                  updateField(
                    "address",
                    e.target.value
                  )
                }
              />
            </div>

          </div>

        </section>

        {/* MEDICAL INFORMATION */}

        <section className="bg-[#171717] border border-[#BFA15F]/25 rounded-2xl p-5 sm:p-7 mb-6">

          <h2 className="text-xl font-bold text-[#D6C08A]">
            Medical Information
          </h2>

          <p className="text-sm text-gray-500 mt-1 mb-6">
            Medical coverage, blood type, and allergies
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-semibold text-[#D6C08A] mb-2">
                Medical Coverage
              </label>

              <select
                className="w-full h-14 bg-[#080808] border border-[#BFA15F]/25 rounded-xl px-4 outline-none focus:border-[#BFA15F]"
                value={form.medical_coverage || ""}
                onChange={(e) =>
                  updateField(
                    "medical_coverage",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select coverage
                </option>

                <option value="NSSF">
                  NSSF
                </option>

                <option value="Insurance">
                  Insurance
                </option>

                <option value="Self Payment">
                  Self Payment
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#D6C08A] mb-2">
                Blood Type
              </label>

              <select
                className="w-full h-14 bg-[#080808] border border-[#BFA15F]/25 rounded-xl px-4 outline-none focus:border-[#BFA15F]"
                value={form.blood_type || ""}
                onChange={(e) =>
                  updateField(
                    "blood_type",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select blood type
                </option>

                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            {(form.medical_coverage === "Insurance" ||
              form.medical_coverage === "Other") && (
              <div>
                <label className="block text-sm font-semibold text-[#D6C08A] mb-2">
                  {form.medical_coverage === "Insurance"
                    ? "Insurance Provider"
                    : "Coverage Details"}
                </label>

                <input
                  className="w-full h-14 bg-[#080808] border border-[#BFA15F]/25 rounded-xl px-4 outline-none focus:border-[#BFA15F]"
                  value={form.insurance_provider || ""}
                  onChange={(e) =>
                    updateField(
                      "insurance_provider",
                      e.target.value
                    )
                  }
                />
              </div>
            )}

            {form.medical_coverage === "Insurance" && (
              <div>
                <label className="block text-sm font-semibold text-[#D6C08A] mb-2">
                  Insurance Number
                </label>

                <input
                  className="w-full h-14 bg-[#080808] border border-[#BFA15F]/25 rounded-xl px-4 outline-none focus:border-[#BFA15F]"
                  value={form.insurance_number || ""}
                  onChange={(e) =>
                    updateField(
                      "insurance_number",
                      e.target.value
                    )
                  }
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[#D6C08A] mb-2">
                Allergies
              </label>

              <select
                className="w-full h-14 bg-[#080808] border border-[#BFA15F]/25 rounded-xl px-4 outline-none focus:border-[#BFA15F]"
                value={
                  form.has_allergy
                    ? "yes"
                    : "no"
                }
                onChange={(e) =>
                  updateField(
                    "has_allergy",
                    e.target.value === "yes"
                  )
                }
              >
                <option value="no">
                  No Known Allergy
                </option>

                <option value="yes">
                  Has Allergy
                </option>
              </select>
            </div>

            {form.has_allergy && (
              <div>
                <label className="block text-sm font-semibold text-[#D6C08A] mb-2">
                  Allergy Details
                </label>

                <input
                  className="w-full h-14 bg-[#080808] border border-[#BFA15F]/25 rounded-xl px-4 outline-none focus:border-[#BFA15F]"
                  value={form.allergy_details || ""}
                  onChange={(e) =>
                    updateField(
                      "allergy_details",
                      e.target.value
                    )
                  }
                />
              </div>
            )}

          </div>

        </section>

        {/* EMERGENCY CONTACT */}

        <section className="bg-[#171717] border border-[#BFA15F]/25 rounded-2xl p-5 sm:p-7 mb-6">

          <h2 className="text-xl font-bold text-[#D6C08A]">
            Emergency Contact
          </h2>

          <p className="text-sm text-gray-500 mt-1 mb-6">
            Contact information for emergencies
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-semibold text-[#D6C08A] mb-2">
                Contact Name
              </label>

              <input
                className="w-full h-14 bg-[#080808] border border-[#BFA15F]/25 rounded-xl px-4 outline-none focus:border-[#BFA15F]"
                value={
                  form.emergency_contact_name || ""
                }
                onChange={(e) =>
                  updateField(
                    "emergency_contact_name",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#D6C08A] mb-2">
                Contact Phone
              </label>

              <input
                className="w-full h-14 bg-[#080808] border border-[#BFA15F]/25 rounded-xl px-4 outline-none focus:border-[#BFA15F]"
                value={
                  form.emergency_contact_phone || ""
                }
                onChange={(e) =>
                  updateField(
                    "emergency_contact_phone",
                    e.target.value
                  )
                }
              />
            </div>

          </div>

        </section>

        {/* NOTES */}

        <section className="bg-[#171717] border border-[#BFA15F]/25 rounded-2xl p-5 sm:p-7 mb-6">

          <h2 className="text-xl font-bold text-[#D6C08A]">
            Additional Notes
          </h2>

          <p className="text-sm text-gray-500 mt-1 mb-6">
            Additional information about the patient
          </p>

          <textarea
            className="w-full min-h-[150px] bg-[#080808] border border-[#BFA15F]/25 rounded-xl px-4 py-4 outline-none resize-y focus:border-[#BFA15F]"
            value={form.notes || ""}
            onChange={(e) =>
              updateField(
                "notes",
                e.target.value
              )
            }
          />

        </section>

        {/* ACTIONS */}

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pb-10">

          <button
            onClick={() =>
              router.push(
                `/dashboard/patients/${id}`
              )
            }
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-[#BFA15F]/40 text-[#BFA15F] font-bold hover:bg-[#BFA15F]/10 transition"
          >
            Cancel
          </button>

          <button
            onClick={savePatient}
            disabled={saving}
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-[#BFA15F] text-black font-bold hover:bg-[#D6C08A] transition disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Patient"}
          </button>

        </div>

      </div>
    </main>
  );
}