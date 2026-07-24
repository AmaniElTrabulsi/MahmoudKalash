"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

export default function PatientDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState("Overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPatientData();
    }
  }, [id]);

  async function loadPatientData() {
    setLoading(true);

    try {
      // PATIENT
      const { data: patientData, error: patientError } =
        await supabase
          .from("patients")
          .select("*")
          .eq("id", id)
          .single();

      if (patientError) {
        console.error("Patient error:", patientError);
        setLoading(false);
        return;
      }

      setPatient(patientData);

      // APPOINTMENTS
      const { data: appointmentsData, error: appointmentsError } =
        await supabase
          .from("appointments")
          .select(`
            id,
            appointment_date,
            start_time,
            end_time,
            status
          `)
          .eq("patient_id", id)
          .order("appointment_date", {
            ascending: false,
          });

      if (appointmentsError) {
        console.error("Appointments error:", appointmentsError);
      }

      setAppointments(appointmentsData || []);

      // VISITS
      const { data: visitsData, error: visitsError } =
        await supabase
          .from("visits")
          .select(`
            id,
            patient_id,
            appointment_id,
            visit_date,
            symptoms,
            diagnosis,
            doctor_notes,
            treatment_plan,
            follow_up_date,
            visit_status,
            vital_signs(
              id,
              visit_id,
              weight,
              height,
              blood_pressure,
              heart_rate,
              temperature,
              oxygen_level
            )
          `)
          .eq("patient_id", id)
          .order("visit_date", {
            ascending: false,
          });

      if (visitsError) {
        console.error("Visits error:", visitsError);
      }

      setVisits(visitsData || []);

      // MEDICAL HISTORY
      const { data: historyData, error: historyError } =
        await supabase
          .from("medical_history")
          .select("*")
          .eq("patient_id", id)
          .order("date", {
            ascending: false,
          });

      if (historyError) {
        console.error("Medical history error:", historyError);
      }

      setHistory(historyData || []);

      // PRESCRIPTIONS
      const { data: prescriptionData, error: prescriptionError } =
        await supabase
          .from("prescriptions")
          .select(`
            id,
            notes,
            created_at,
            prescription_items(
              id,
              medicine_name,
              dose,
              frequency,
              duration,
              instructions
            )
          `)
          .eq("patient_id", id)
          .order("created_at", {
            ascending: false,
          });

      if (prescriptionError) {
        console.error("Prescriptions error:", prescriptionError);
      }

      setPrescriptions(prescriptionData || []);

      // DOCUMENTS
      const { data: documentsData, error: documentsError } =
        await supabase
          .from("documents")
          .select("*")
          .eq("patient_id", id)
          .order("uploaded_at", {
            ascending: false,
          });

      if (documentsError) {
        console.error("Documents error:", documentsError);
      }

      setDocuments(documentsData || []);

      // PAYMENTS
      const { data: paymentsData, error: paymentsError } =
        await supabase
          .from("payments")
          .select("*")
          .eq("patient_id", id)
          .order("payment_date", {
            ascending: false,
          });

      if (paymentsError) {
        console.error("Payments error:", paymentsError);
      }

      setPayments(paymentsData || []);

    } catch (error) {
      console.error("Patient loading error:", error);
    }

    setLoading(false);
  }

  function formatDate(date: string) {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(time: string) {
    if (!time) return "-";

    return new Date(
      `1970-01-01T${time}`
    ).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function getWhatsAppPhone(phone: string) {
    return phone?.replace(/\D/g, "") || "";
  }

  function getVitalSigns(visit: any) {
    if (!visit?.vital_signs) return null;

    if (Array.isArray(visit.vital_signs)) {
      return visit.vital_signs[0] || null;
    }

    return visit.vital_signs;
  }

  if (loading) {
    return (
      <main className="
        min-h-screen
        bg-[#080808]
        text-white
        flex
        items-center
        justify-center
      ">
        <p className="text-[#BFA15F] text-xl">
          Loading patient...
        </p>
      </main>
    );
  }

  if (!patient) {
    return (
      <main className="
        min-h-screen
        bg-[#080808]
        text-white
        flex
        items-center
        justify-center
      ">
        Patient not found
      </main>
    );
  }

  const tabs = [
    "Overview",
    "Appointments",
    "Visits",
    "Medical History",
    "Prescriptions",
    "Documents",
    "Payments",
  ];

  return (
    <main className="
      min-h-screen
      bg-[#080808]
      text-white
      p-4
      sm:p-6
      pt-24
    ">

      <DashboardMenu />

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="
          flex
          justify-between
          items-center
          flex-wrap
          gap-4
        ">

          <div>

            <h1 className="
              text-2xl
              sm:text-3xl
              font-bold
              text-[#BFA15F]
            ">
              {patient.first_name} {patient.last_name}
            </h1>

            <p className="
              text-gray-400
              mt-1
              text-sm
            ">
              Patient Number:{" "}

              <span className="text-[#D6C08A]">
                {patient.patient_number}
              </span>
            </p>

          </div>

          <button
            onClick={() =>
              router.push(
                `/dashboard/patients/${id}/edit`
              )
            }
            className="
              bg-[#BFA15F]
              text-black
              px-4
              py-2
              rounded-lg
              font-bold
              text-sm
            "
          >
            Edit Patient
          </button>

        </div>


        {/* ALLERGY WARNING */}

        {patient.has_allergy && (

          <div className="
            mt-5
            bg-red-900/30
            border
            border-red-500
            rounded-lg
            p-4
          ">

            <h2 className="
              text-red-400
              font-bold
              text-base
            ">
              ⚠ Allergy Warning
            </h2>

            <p className="mt-1 text-sm">
              {patient.allergy_details}
            </p>

          </div>

        )}


        {/* TABS */}

        <div className="
          flex
          gap-2
          flex-wrap
          mt-6
        ">

          {tabs.map((tab) => (

            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-3
                sm:px-4
                py-2
                rounded-lg
                border
                text-sm
                transition

                ${
                  activeTab === tab
                    ? "bg-[#BFA15F] text-black border-[#BFA15F]"
                    : "bg-[#171717] border-[#BFA15F]/30 text-gray-300 hover:border-[#BFA15F]"
                }
              `}
            >
              {tab}
            </button>

          ))}

        </div>


        {/* OVERVIEW */}

        {activeTab === "Overview" && (

          <section className="
            mt-6
            bg-[#171717]
            border
            border-[#BFA15F]/30
            rounded-xl
            p-4
            sm:p-5
          ">

            <div className="
              flex
              justify-between
              items-center
              gap-3
              mb-4
              pb-3
              border-b
              border-[#BFA15F]/20
            ">

              <h2 className="
                text-lg
                font-bold
                text-[#D6C08A]
              ">
                Patient Information
              </h2>

              <span className="
                text-xs
                text-gray-500
              ">
                #{patient.patient_number}
              </span>

            </div>


            <div className="
              grid
              grid-cols-2
              sm:grid-cols-3
              lg:grid-cols-4
              gap-x-5
              gap-y-4
              text-sm
            ">

              <Info label="Gender" value={patient.gender} />

              <Info
                label="Date of Birth"
                value={patient.date_of_birth}
              />

              <div>

                <p className="
                  text-gray-500
                  text-xs
                ">
                  Phone
                </p>

                {patient.phone ? (

                  <a
                    href={`https://wa.me/${getWhatsAppPhone(
                      patient.phone
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      mt-1
                      block
                      text-[#BFA15F]
                      hover:underline
                    "
                  >
                    {patient.phone}
                  </a>

                ) : (

                  <p className="mt-1">
                    -
                  </p>

                )}

              </div>

              <Info
                label="Blood Type"
                value={patient.blood_type}
              />

              <Info
                label="Email"
                value={patient.email}
              />

              <Info
                label="Medical Coverage"
                value={patient.medical_coverage}
              />

              <Info
                label="Insurance Provider"
                value={patient.insurance_provider}
              />

              <Info
                label="Insurance Number"
                value={patient.insurance_number}
              />

            </div>


            <div className="
              mt-5
              pt-4
              border-t
              border-[#BFA15F]/20
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-4
              text-sm
            ">

              <Info
                label="Address"
                value={patient.address}
              />

              <div>

                <p className="
                  text-gray-500
                  text-xs
                ">
                  Emergency Contact
                </p>

                <p className="mt-1">
                  {patient.emergency_contact_name || "-"}
                </p>

                {patient.emergency_contact_phone && (

                  <p className="
                    text-gray-400
                    text-xs
                    mt-1
                  ">
                    {patient.emergency_contact_phone}
                  </p>

                )}

              </div>

            </div>


            {patient.notes && (

              <div className="
                mt-5
                pt-4
                border-t
                border-[#BFA15F]/20
              ">

                <p className="
                  text-gray-500
                  text-xs
                ">
                  Notes
                </p>

                <p className="
                  mt-1
                  text-sm
                  text-gray-300
                ">
                  {patient.notes}
                </p>

              </div>

            )}

          </section>

        )}


        {/* APPOINTMENTS */}

        {activeTab === "Appointments" && (

          <section className="mt-6">

            <h2 className="
              text-xl
              font-bold
              text-[#D6C08A]
              mb-4
            ">
              Appointments
            </h2>

            {appointments.length === 0 ? (

              <p className="
                text-gray-400
                text-sm
              ">
                No appointments
              </p>

            ) : (

              appointments.map((appointment) => (

                <div
                  key={appointment.id}
                  className="
                    bg-[#171717]
                    border
                    border-[#BFA15F]/30
                    rounded-xl
                    p-4
                    mb-4
                  "
                >

                  <p className="
                    text-[#D6C08A]
                    font-bold
                  ">
                    {formatDate(
                      appointment.appointment_date
                    )}
                  </p>

                  <p className="
                    mt-1
                    text-sm
                  ">
                    {formatTime(
                      appointment.start_time
                    )}
                    {" - "}
                    {formatTime(
                      appointment.end_time
                    )}
                  </p>

                  <p className="
                    mt-1
                    text-sm
                  ">
                    Status:{" "}

                    <span className="
                      text-[#BFA15F]
                    ">
                      {appointment.status}
                    </span>
                  </p>

                  {appointment.status !== "Completed" &&
                    appointment.status !== "Cancelled" && (

                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/visits/new?patient_id=${id}&appointment_id=${appointment.id}`
                        )
                      }
                      className="
                        mt-3
                        bg-[#BFA15F]
                        text-black
                        px-4
                        py-2
                        rounded-lg
                        font-bold
                        text-sm
                      "
                    >
                      Start Visit
                    </button>

                  )}

                </div>

              ))

            )}

          </section>

        )}


        {/* VISITS */}

        {activeTab === "Visits" && (

          <section className="mt-6">

            <div className="
              flex
              justify-between
              items-center
              flex-wrap
              gap-3
              mb-4
            ">

              <h2 className="
                text-xl
                font-bold
                text-[#D6C08A]
              ">
                Visits & Vital Signs
              </h2>

              <button
                onClick={() =>
                  router.push(
                    `/dashboard/visits/new?patient_id=${id}`
                  )
                }
                className="
                  bg-[#BFA15F]
                  text-black
                  px-4
                  py-2
                  rounded-lg
                  font-bold
                  text-sm
                "
              >
                + New Visit
              </button>

            </div>


            {visits.length === 0 ? (

              <p className="
                text-gray-400
                text-sm
              ">
                No visits
              </p>

            ) : (

              visits.map((visit) => {

                const vitalSigns =
                  getVitalSigns(visit);

                return (

                  <div
                    key={visit.id}
                    onClick={() =>
                      router.push(
                        `/dashboard/visits/${visit.id}`
                      )
                    }
                    className="
                      bg-[#171717]
                      border
                      border-[#BFA15F]/30
                      rounded-xl
                      p-4
                      mb-4
                      text-sm
                      cursor-pointer
                      hover:border-[#BFA15F]
                      transition
                    "
                  >

                    <div className="
                      flex
                      justify-between
                      items-start
                      gap-3
                    ">

                      <div>

                        <h3 className="
                          font-bold
                          text-[#D6C08A]
                        ">
                          Visit on{" "}
                          {formatDate(
                            visit.visit_date
                          )}
                        </h3>

                        <p className="
                          text-gray-500
                          text-xs
                          mt-1
                        ">
                          Click to view full visit details
                        </p>

                      </div>

                      <span className="
                        text-[#BFA15F]
                        text-lg
                      ">
                        →
                      </span>

                    </div>


                    <div className="
                      mt-3
                      space-y-1
                    ">

                      <p>
                        <span className="
                          text-gray-500
                        ">
                          Symptoms:
                        </span>{" "}
                        {visit.symptoms || "-"}
                      </p>

                      <p>
                        <span className="
                          text-gray-500
                        ">
                          Diagnosis:
                        </span>{" "}
                        {visit.diagnosis || "-"}
                      </p>

                      <p>
                        <span className="
                          text-gray-500
                        ">
                          Doctor Notes:
                        </span>{" "}
                        {visit.doctor_notes || "-"}
                      </p>

                      <p>
                        <span className="
                          text-gray-500
                        ">
                          Treatment Plan:
                        </span>{" "}
                        {visit.treatment_plan || "-"}
                      </p>

                    </div>


                    {vitalSigns && (

                      <div className="
                        mt-4
                        pt-3
                        border-t
                        border-[#BFA15F]/20
                      ">

                        <h4 className="
                          text-[#BFA15F]
                          font-bold
                          mb-2
                        ">
                          Vital Signs
                        </h4>

                        <div className="
                          grid
                          grid-cols-2
                          sm:grid-cols-3
                          gap-2
                          text-sm
                        ">

                          <p>
                            Weight:{" "}
                            {vitalSigns.weight || "-"}
                          </p>

                          <p>
                            Height:{" "}
                            {vitalSigns.height || "-"}
                          </p>

                          <p>
                            Blood Pressure:{" "}
                            {vitalSigns.blood_pressure || "-"}
                          </p>

                          <p>
                            Heart Rate:{" "}
                            {vitalSigns.heart_rate || "-"}
                          </p>

                          <p>
                            Temperature:{" "}
                            {vitalSigns.temperature || "-"}
                          </p>

                          <p>
                            Oxygen:{" "}
                            {vitalSigns.oxygen_level || "-"}
                          </p>

                        </div>

                      </div>

                    )}

                  </div>

                );

              })

            )}

          </section>

        )}


        {/* MEDICAL HISTORY */}

        {activeTab === "Medical History" && (

          <section className="mt-6">

            <div className="
              flex
              justify-between
              items-center
              flex-wrap
              gap-3
              mb-4
            ">

              <h2 className="
                text-xl
                font-bold
                text-[#D6C08A]
              ">
                Medical History
              </h2>

              <button
                onClick={() =>
                  router.push(
                    `/dashboard/history/new?patient_id=${id}`
                  )
                }
                className="
                  bg-[#BFA15F]
                  text-black
                  px-4
                  py-2
                  rounded-lg
                  font-bold
                  text-sm
                "
              >
                + Add History
              </button>

            </div>

            {history.length === 0 ? (

              <p className="
                text-gray-400
                text-sm
              ">
                No medical history
              </p>

            ) : (

              history.map((item) => (

                <div
                  key={item.id}
                  onClick={() =>
                    router.push(
                      `/dashboard/history/${item.id}`
                    )
                  }
                  className="
                    bg-[#171717]
                    border
                    border-[#BFA15F]/30
                    rounded-xl
                    p-4
                    mb-4
                    cursor-pointer
                    hover:border-[#BFA15F]
                  "
                >

                  <h3 className="font-bold">
                    {item.title || "-"}
                  </h3>

                  <p className="
                    text-sm
                    mt-1
                  ">
                    Category:{" "}
                    {item.category || "-"}
                  </p>

                  <p className="
                    text-sm
                    mt-1
                  ">
                    {item.description || "-"}
                  </p>

                  <p className="
                    text-gray-400
                    text-sm
                    mt-2
                  ">
                    {item.date || "-"}
                  </p>

                </div>

              ))

            )}

          </section>

        )}


        {/* PRESCRIPTIONS */}

        {activeTab === "Prescriptions" && (

          <section className="mt-6">

            <div className="
              flex
              justify-between
              items-center
              flex-wrap
              gap-3
              mb-4
            ">

              <h2 className="
                text-xl
                font-bold
                text-[#D6C08A]
              ">
                Prescriptions
              </h2>

              <button
                onClick={() =>
                  router.push(
                    `/dashboard/prescriptions/new?patient_id=${id}`
                  )
                }
                className="
                  bg-[#BFA15F]
                  text-black
                  px-4
                  py-2
                  rounded-lg
                  font-bold
                  text-sm
                "
              >
                + New Prescription
              </button>

            </div>

            {prescriptions.length === 0 ? (

              <p className="
                text-gray-400
                text-sm
              ">
                No prescriptions
              </p>

            ) : (

              prescriptions.map((prescription) => (

                <div
                  key={prescription.id}
                  onClick={() =>
                    router.push(
                      `/dashboard/prescriptions/${prescription.id}`
                    )
                  }
                  className="
                    bg-[#171717]
                    border
                    border-[#BFA15F]/30
                    rounded-xl
                    p-4
                    mb-4
                    cursor-pointer
                    hover:border-[#BFA15F]
                  "
                >

                  <p className="text-sm">
                    Date:{" "}

                    {formatDate(
                      prescription.created_at
                    )}
                  </p>

                  <p className="
                    text-sm
                    mt-2
                  ">
                    Notes:{" "}

                    {prescription.notes || "-"}
                  </p>

                  {prescription.prescription_items?.map(
                    (item: any) => (

                      <div
                        key={item.id}
                        className="
                          mt-3
                          border-t
                          border-[#BFA15F]/20
                          pt-3
                          text-sm
                        "
                      >

                        <p className="
                          text-[#D6C08A]
                          font-bold
                        ">
                          {item.medicine_name}
                        </p>

                        <p>
                          Dose:{" "}
                          {item.dose || "-"}
                        </p>

                        <p>
                          Frequency:{" "}
                          {item.frequency || "-"}
                        </p>

                        <p>
                          Duration:{" "}
                          {item.duration || "-"}
                        </p>

                        <p>
                          Instructions:{" "}
                          {item.instructions || "-"}
                        </p>

                      </div>

                    )
                  )}

                </div>

              ))

            )}

          </section>

        )}


        {/* DOCUMENTS */}

        {activeTab === "Documents" && (

          <section className="mt-6">

            <div className="
              flex
              justify-between
              items-center
              flex-wrap
              gap-3
              mb-4
            ">

              <h2 className="
                text-xl
                font-bold
                text-[#D6C08A]
              ">
                Documents
              </h2>

              <button
                onClick={() =>
                  router.push(
                    `/dashboard/documents/new?patient_id=${id}`
                  )
                }
                className="
                  bg-[#BFA15F]
                  text-black
                  px-4
                  py-2
                  rounded-lg
                  font-bold
                  text-sm
                "
              >
                + Upload Document
              </button>

            </div>

            {documents.length === 0 ? (

              <p className="
                text-gray-400
                text-sm
              ">
                No documents
              </p>

            ) : (

              documents.map((doc) => (

                <div
                  key={doc.id}
                  onClick={() =>
                    router.push(
                      `/dashboard/documents/${doc.id}`
                    )
                  }
                  className="
                    bg-[#171717]
                    border
                    border-[#BFA15F]/30
                    rounded-xl
                    p-4
                    mb-4
                    cursor-pointer
                    hover:border-[#BFA15F]
                  "
                >

                  <p className="font-bold">
                    {doc.file_name}
                  </p>

                  <p className="
                    text-sm
                    mt-2
                  ">
                    {doc.description || "-"}
                  </p>

                </div>

              ))

            )}

          </section>

        )}


        {/* PAYMENTS */}

        {activeTab === "Payments" && (

          <section className="mt-6">

            <div className="
              flex
              justify-between
              items-center
              flex-wrap
              gap-3
              mb-4
            ">

              <h2 className="
                text-xl
                font-bold
                text-[#D6C08A]
              ">
                Payments
              </h2>

              <button
                onClick={() =>
                  router.push(
                    `/dashboard/payments/new?patient_id=${id}`
                  )
                }
                className="
                  bg-[#BFA15F]
                  text-black
                  px-4
                  py-2
                  rounded-lg
                  font-bold
                  text-sm
                "
              >
                + Add Payment
              </button>

            </div>

            {payments.length === 0 ? (

              <p className="
                text-gray-400
                text-sm
              ">
                No payments
              </p>

            ) : (

              payments.map((payment) => (

                <div
                  key={payment.id}
                  onClick={() =>
                    router.push(
                      `/dashboard/payments/${payment.id}`
                    )
                  }
                  className="
                    bg-[#171717]
                    border
                    border-[#BFA15F]/30
                    rounded-xl
                    p-4
                    mb-4
                    cursor-pointer
                    hover:border-[#BFA15F]
                    text-sm
                  "
                >

                  <p>
                    Amount:{" "}

                    <span className="
                      text-[#BFA15F]
                      font-bold
                    ">
                      {payment.amount}{" "}
                      {payment.currency}
                    </span>
                  </p>

                  <p className="mt-1">
                    Payment Type:{" "}
                    {payment.payment_type || "-"}
                  </p>

                  <p className="mt-1">
                    Payment Method:{" "}
                    {payment.payment_method || "-"}
                  </p>

                  <p className="mt-1">
                    Status:{" "}
                    {payment.payment_status || "-"}
                  </p>

                  <p className="mt-1">
                    Date:{" "}
                    {payment.payment_date || "-"}
                  </p>

                  {payment.notes && (

                    <p className="mt-1">
                      Notes:{" "}
                      {payment.notes}
                    </p>

                  )}

                </div>

              ))

            )}

          </section>

        )}

      </div>

    </main>
  );
}


function Info({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div>

      <p className="
        text-gray-500
        text-xs
      ">
        {label}
      </p>

      <p className="
        mt-1
        break-words
      ">
        {value || "-"}
      </p>

    </div>
  );
}