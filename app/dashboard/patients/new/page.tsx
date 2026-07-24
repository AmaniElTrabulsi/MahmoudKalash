"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

export default function NewPatientPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [patient, setPatient] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",

    medical_coverage: "",
    insurance_provider: "",
    insurance_number: "",

    blood_type: "",

    has_allergy: false,
    allergy_details: "",

    address: "",

    emergency_contact_name: "",
    emergency_contact_phone: "",

    notes: "",
  });

  function updateField(field: string, value: any) {
    setPatient((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function savePatient() {
    setMessage("");

    if (
      !patient.first_name.trim() ||
      !patient.last_name.trim() ||
      !patient.phone.trim()
    ) {
      setMessage(
        "First name, last name and phone are required."
      );
      return;
    }

    if (!patient.gender) {
      setMessage("Please select a gender.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("patients")
      .insert({
        first_name: patient.first_name.trim(),
        last_name: patient.last_name.trim(),
        date_of_birth:
          patient.date_of_birth || null,

        gender: patient.gender,

        phone: patient.phone.trim(),

        email:
          patient.email.trim() || null,

        medical_coverage:
          patient.medical_coverage || null,

        insurance_provider:
          patient.insurance_provider.trim() || null,

        insurance_number:
          patient.insurance_number.trim() || null,

        blood_type:
          patient.blood_type || null,

        has_allergy:
          patient.has_allergy,

        allergy_details:
          patient.has_allergy &&
          patient.allergy_details.trim()
            ? patient.allergy_details.trim()
            : null,

        address:
          patient.address.trim() || null,

        emergency_contact_name:
          patient.emergency_contact_name.trim() || null,

        emergency_contact_phone:
          patient.emergency_contact_phone.trim() || null,

        notes:
          patient.notes.trim() || null,
      });

    if (error) {
      console.error(error);
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard/patients");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <DashboardMenu />

        <div className="text-center">
          <div className="text-[#BFA15F] text-xl font-bold">
            Saving Patient...
          </div>

          <p className="text-gray-400 mt-2">
            Please wait
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white px-4 py-6 pt-32">
      <DashboardMenu />

      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#BFA15F]">
            New Patient
          </h1>

          <p className="text-gray-400 mt-2">
            Create a new patient record
          </p>
        </div>

        <div className="bg-[#171717] border border-[#BFA15F]/30 rounded-2xl p-5 sm:p-8 shadow-xl">

          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#D6C08A]">
              Personal Information
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Basic information about the patient
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                First Name *
              </label>

              <input
                type="text"
                value={patient.first_name}
                onChange={(event) =>
                  updateField(
                    "first_name",
                    event.target.value
                  )
                }
                placeholder="Enter first name"
                className="w-full h-12 bg-black border border-[#BFA15F]/30 rounded-xl px-4 text-white outline-none focus:border-[#BFA15F]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Last Name *
              </label>

              <input
                type="text"
                value={patient.last_name}
                onChange={(event) =>
                  updateField(
                    "last_name",
                    event.target.value
                  )
                }
                placeholder="Enter last name"
                className="w-full h-12 bg-black border border-[#BFA15F]/30 rounded-xl px-4 text-white outline-none focus:border-[#BFA15F]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Date of Birth
              </label>

              <input
                type="date"
                value={patient.date_of_birth}
                onChange={(event) =>
                  updateField(
                    "date_of_birth",
                    event.target.value
                  )
                }
                className="w-full h-12 bg-black border border-[#BFA15F]/30 rounded-xl px-4 text-white outline-none focus:border-[#BFA15F]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Gender *
              </label>

              <select
                value={patient.gender}
                onChange={(event) =>
                  updateField(
                    "gender",
                    event.target.value
                  )
                }
                className="w-full h-12 bg-black border border-[#BFA15F]/30 rounded-xl px-4 text-white outline-none focus:border-[#BFA15F]"
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
              <label className="block text-sm text-gray-300 mb-2">
                Phone *
              </label>

              <input
                type="tel"
                value={patient.phone}
                onChange={(event) =>
                  updateField(
                    "phone",
                    event.target.value
                  )
                }
                placeholder="+961 70 123456"
                className="w-full h-12 bg-black border border-[#BFA15F]/30 rounded-xl px-4 text-white outline-none focus:border-[#BFA15F]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Email
              </label>

              <input
                type="email"
                value={patient.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
                }
                placeholder="patient@email.com"
                className="w-full h-12 bg-black border border-[#BFA15F]/30 rounded-xl px-4 text-white outline-none focus:border-[#BFA15F]"
              />
            </div>

          </div>

          <div className="border-t border-[#BFA15F]/20 my-8" />

          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#D6C08A]">
              Medical Information
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Medical coverage and health information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Medical Coverage
              </label>

              <select
                value={patient.medical_coverage}
                onChange={(event) =>
                  updateField(
                    "medical_coverage",
                    event.target.value
                  )
                }
                className="w-full h-12 bg-black border border-[#BFA15F]/30 rounded-xl px-4 text-white outline-none focus:border-[#BFA15F]"
              >
                <option value="">
                  Select coverage
                </option>

                <option value="Self Payment">
                  Self Payment
                </option>

                <option value="NSSF">
                  NSSF
                </option>

                <option value="Insurance">
                  Insurance
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            {(
              patient.medical_coverage ===
                "Insurance" ||
              patient.medical_coverage ===
                "Other"
            ) && (
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  {patient.medical_coverage ===
                  "Insurance"
                    ? "Insurance Provider"
                    : "Other Coverage"}
                </label>

                <input
                  type="text"
                  value={
                    patient.insurance_provider
                  }
                  onChange={(event) =>
                    updateField(
                      "insurance_provider",
                      event.target.value
                    )
                  }
                  placeholder={
                    patient.medical_coverage ===
                    "Insurance"
                      ? "Enter insurance provider"
                      : "Specify coverage"
                  }
                  className="w-full h-12 bg-black border border-[#BFA15F]/30 rounded-xl px-4 text-white outline-none focus:border-[#BFA15F]"
                />
              </div>
            )}

            {patient.medical_coverage ===
              "Insurance" && (
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Insurance Number
                </label>

                <input
                  type="text"
                  value={
                    patient.insurance_number
                  }
                  onChange={(event) =>
                    updateField(
                      "insurance_number",
                      event.target.value
                    )
                  }
                  placeholder="Enter insurance number"
                  className="w-full h-12 bg-black border border-[#BFA15F]/30 rounded-xl px-4 text-white outline-none focus:border-[#BFA15F]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Blood Type
              </label>

              <select
                value={patient.blood_type}
                onChange={(event) =>
                  updateField(
                    "blood_type",
                    event.target.value
                  )
                }
                className="w-full h-12 bg-black border border-[#BFA15F]/30 rounded-xl px-4 text-white outline-none focus:border-[#BFA15F]"
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

          </div>

          <div className="border-t border-[#BFA15F]/20 my-8" />

          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#D6C08A]">
              Allergy Information
            </h2>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={patient.has_allergy}
              onChange={(event) =>
                updateField(
                  "has_allergy",
                  event.target.checked
                )
              }
              className="w-5 h-5 accent-[#BFA15F]"
            />

            <span className="text-gray-300">
              Patient has an allergy
            </span>
          </label>

          {patient.has_allergy && (
            <textarea
              value={patient.allergy_details}
              onChange={(event) =>
                updateField(
                  "allergy_details",
                  event.target.value
                )
              }
              placeholder="Describe the allergy..."
              className="w-full min-h-28 mt-4 bg-black border border-red-500/40 rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 resize-y"
            />
          )}

          <div className="border-t border-[#BFA15F]/20 my-8" />

          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#D6C08A]">
              Contact Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Address
              </label>

              <textarea
                value={patient.address}
                onChange={(event) =>
                  updateField(
                    "address",
                    event.target.value
                  )
                }
                placeholder="Enter address"
                className="w-full min-h-28 bg-black border border-[#BFA15F]/30 rounded-xl px-4 py-3 text-white outline-none focus:border-[#BFA15F] resize-y"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Notes
              </label>

              <textarea
                value={patient.notes}
                onChange={(event) =>
                  updateField(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="Additional notes..."
                className="w-full min-h-28 bg-black border border-[#BFA15F]/30 rounded-xl px-4 py-3 text-white outline-none focus:border-[#BFA15F] resize-y"
              />
            </div>

          </div>

          <div className="border-t border-[#BFA15F]/20 my-8" />

          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#D6C08A]">
              Emergency Contact
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Contact Name
              </label>

              <input
                type="text"
                value={
                  patient.emergency_contact_name
                }
                onChange={(event) =>
                  updateField(
                    "emergency_contact_name",
                    event.target.value
                  )
                }
                placeholder="Emergency contact name"
                className="w-full h-12 bg-black border border-[#BFA15F]/30 rounded-xl px-4 text-white outline-none focus:border-[#BFA15F]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Contact Phone
              </label>

              <input
                type="tel"
                value={
                  patient.emergency_contact_phone
                }
                onChange={(event) =>
                  updateField(
                    "emergency_contact_phone",
                    event.target.value
                  )
                }
                placeholder="+961 70 123456"
                className="w-full h-12 bg-black border border-[#BFA15F]/30 rounded-xl px-4 text-white outline-none focus:border-[#BFA15F]"
              />
            </div>

          </div>

          {message && (
            <div className="mt-6 bg-red-900/30 border border-red-500/50 text-red-300 rounded-xl px-4 py-3">
              {message}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-8">

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/dashboard/patients"
                )
              }
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={savePatient}
              className="w-full sm:w-auto bg-[#BFA15F] hover:bg-[#D6C08A] text-black px-8 py-3 rounded-xl font-bold"
            >
              Create Patient
            </button>

          </div>

        </div>

      </div>

    </main>
  );
}