import NewPrescriptionForm from "./NewPrescriptionForm";

type PageProps = {
  searchParams: Promise<{
    patient_id?: string;
    visit_id?: string;
  }>;
};

export default async function NewPrescriptionPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  return (
    <NewPrescriptionForm
      patientId={params.patient_id || ""}
      visitId={params.visit_id || ""}
    />
  );
}