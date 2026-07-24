"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

export default function NewReminderPage() {
  const router = useRouter();

  const [patients, setPatients] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  const [patientId, setPatientId] = useState("");
  const [templateId, setTemplateId] = useState("");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [reminderType, setReminderType] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [
      patientsResult,
      templatesResult,
    ] = await Promise.all([
      supabase
        .from("patients")
        .select(`
          id,
          patient_number,
          first_name,
          last_name
        `)
        .order("patient_number", {
          ascending: true,
        }),

      supabase
        .from("reminder_templates")
        .select("*")
        .order("name", {
          ascending: true,
        }),
    ]);

    if (patientsResult.error) {
      console.error(
        "Patients error:",
        patientsResult.error
      );
    }

    if (templatesResult.error) {
      console.error(
        "Templates error:",
        templatesResult.error
      );
    }

    setPatients(
      patientsResult.data || []
    );

    setTemplates(
      templatesResult.data || []
    );
  }

  function selectTemplate(
    templateIdValue: string
  ) {
    setTemplateId(templateIdValue);

    const selectedTemplate =
      templates.find(
        (template) =>
          template.id === templateIdValue
      );

    if (selectedTemplate) {
      setTitle(
        selectedTemplate.name || ""
      );

      setMessage(
        selectedTemplate.message || ""
      );
    } else {
      setTitle("");
      setMessage("");
    }
  }

  async function saveReminder() {
    if (!title.trim()) {
      alert(
        "Please enter a reminder title"
      );
      return;
    }

    if (!reminderDate) {
      alert(
        "Please select a reminder date"
      );
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("reminders")
      .insert({
        patient_id:
          patientId || null,

        template_id:
          templateId || null,

        title:
          title.trim(),

        message:
          message.trim() || null,

        reminder_date:
          reminderDate,

        reminder_time:
          reminderTime || null,

        reminder_type:
          reminderType || null,

        status:
          "Pending",
      });

    if (error) {
      console.error(
        "Create reminder error:",
        error
      );

      alert(error.message);

      setSaving(false);

      return;
    }

    // Immediately return to the Reminders page
    router.push(
      "/dashboard/reminders"
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
        className="
        max-w-3xl
        mx-auto
        "
      >

        <button
          onClick={() =>
            router.push(
              "/dashboard/reminders"
            )
          }
          className="
          text-[#BFA15F]
          mb-6
          "
        >
          ← Back to Reminders
        </button>

        <h1
          className="
          text-3xl
          font-bold
          text-[#BFA15F]
          mb-8
          "
        >
          New Reminder
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

          {/* PATIENT */}

          <div>

            <label
              className="
              block
              mb-2
              "
            >
              Patient
            </label>

            <select
              value={patientId}
              onChange={(e) =>
                setPatientId(
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
                General Clinic Reminder
              </option>

              {patients.map(
                (patient) => (

                  <option
                    key={patient.id}
                    value={patient.id}
                  >
                    #{patient.patient_number}{" "}
                    -{" "}
                    {patient.first_name}{" "}
                    {patient.last_name}
                  </option>

                )
              )}

            </select>

          </div>


          {/* TEMPLATE */}

          <div>

            <label
              className="
              block
              mb-2
              "
            >
              Reminder Template
            </label>

            <select
              value={templateId}
              onChange={(e) =>
                selectTemplate(
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
                Select a template
              </option>

              {templates.map(
                (template) => (

                  <option
                    key={template.id}
                    value={template.id}
                  >
                    {template.name}
                  </option>

                )
              )}

            </select>

          </div>


          {/* TITLE */}

          <div>

            <label
              className="
              block
              mb-2
              "
            >
              Title *
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              placeholder="
              Example: Follow-up with patient
              "
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


          {/* MESSAGE */}

          <div>

            <label
              className="
              block
              mb-2
              "
            >
              Message
            </label>

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              placeholder="
              Reminder message
              "
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
              "
            />

          </div>


          {/* DATE AND TIME */}

          <div
            className="
            grid
            md:grid-cols-2
            gap-5
            "
          >

            <div>

              <label
                className="
                block
                mb-2
                "
              >
                Reminder Date *
              </label>

              <input
                type="date"
                value={reminderDate}
                onChange={(e) =>
                  setReminderDate(
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
                "
              >
                Reminder Time
              </label>

              <input
                type="time"
                value={reminderTime}
                onChange={(e) =>
                  setReminderTime(
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

          </div>


          {/* REMINDER TYPE */}

          <div>

            <label
              className="
              block
              mb-2
              "
            >
              Reminder Type
            </label>

            <select
              value={reminderType}
              onChange={(e) =>
                setReminderType(
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
                Select type
              </option>

              <option value="Appointment">
                Appointment
              </option>

              <option value="Follow-up">
                Follow-up
              </option>

              <option value="Medication">
                Medication
              </option>

              <option value="General">
                General
              </option>

            </select>

          </div>


          {/* SAVE */}

          <button
            onClick={saveReminder}
            disabled={saving}
            className="
            w-full
            bg-[#BFA15F]
            text-black
            py-3
            rounded-xl
            font-bold
            disabled:opacity-50
            "
          >
            {saving
              ? "Saving..."
              : "Create Reminder"}
          </button>

        </div>

      </div>

    </main>
  );
}