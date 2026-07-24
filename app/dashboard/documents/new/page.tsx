"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

const DOCUMENTS_BUCKET = "documents";

export default function NewDocumentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const patient_id = searchParams.get("patient_id");
  const visit_id = searchParams.get("visit_id");

  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);

  async function uploadDocument() {
    if (!patient_id) {
      alert("Patient ID is missing");
      return;
    }

    if (!file) {
      alert("Please select a file");
      return;
    }

    setSaving(true);

    try {
      /*
      =====================================
      CREATE UNIQUE FILE NAME
      =====================================
      */

      const fileExtension =
        file.name.split(".").pop() || "file";

      let uniqueId = "";

      if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
      ) {
        uniqueId = crypto.randomUUID();
      } else {
        uniqueId =
          Date.now().toString() +
          "-" +
          Math.random()
            .toString(36)
            .substring(2);
      }

      const filePath =
        `${patient_id}/${uniqueId}.${fileExtension}`;


      /*
      =====================================
      UPLOAD FILE TO STORAGE
      =====================================
      */

      const {
        error: uploadError
      } = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false
          }
        );


      if (uploadError) {

        console.error(
          "STORAGE UPLOAD ERROR:",
          uploadError
        );

        alert(
          "STORAGE UPLOAD ERROR:\n\n" +
          uploadError.message
        );

        setSaving(false);

        return;
      }


      /*
      =====================================
      GET PUBLIC FILE URL
      =====================================
      */

      const {
        data: publicUrlData
      } = supabase.storage
        .from(DOCUMENTS_BUCKET)
        .getPublicUrl(filePath);


      const file_url =
        publicUrlData.publicUrl;


      /*
      =====================================
      SAVE RECORD TO DOCUMENTS TABLE
      =====================================
      */

      const {
        error: databaseError
      } = await supabase
        .from("documents")
        .insert({

          patient_id: patient_id,

          visit_id:
            visit_id || null,

          file_name: file.name,

          file_url: file_url,

          file_type:
            file.type || null,

          description:
            description || null

        });


      if (databaseError) {

        console.error(
          "DATABASE INSERT ERROR:",
          databaseError
        );

        alert(
          "DATABASE INSERT ERROR:\n\n" +
          databaseError.message
        );

        setSaving(false);

        return;
      }


      /*
      =====================================
      SUCCESS
      =====================================
      */

      alert(
        "Document uploaded successfully"
      );


      router.push(
        `/dashboard/patients/${patient_id}`
      );

    } catch (error: any) {

      console.error(
        "GENERAL ERROR:",
        error
      );

      alert(
        "GENERAL ERROR:\n\n" +
        error.message
      );

    } finally {

      setSaving(false);

    }
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
          max-w-2xl
          mx-auto
        "
      >


        <button
          onClick={() =>
            router.push(
              `/dashboard/patients/${patient_id}`
            )
          }
          className="
            text-[#BFA15F]
            mb-6
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

          Upload Document

        </h1>


        <div
          className="
            bg-[#171717]
            border
            border-[#BFA15F]/30
            rounded-xl
            p-6
            space-y-6
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

              Select Document

            </label>


            <input
              type="file"
              onChange={(e) => {

                const selectedFile =
                  e.target.files?.[0] || null;

                setFile(selectedFile);

              }}
              className="
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


          {file && (

            <div
              className="
                bg-[#080808]
                border
                border-[#BFA15F]/20
                rounded-xl
                p-4
              "
            >

              <p className="font-bold">

                Selected File:

              </p>


              <p
                className="
                  text-gray-400
                  mt-1
                  break-all
                "
              >

                {file.name}

              </p>

            </div>

          )}


          <div>

            <label
              className="
                block
                mb-2
                text-gray-300
              "
            >

              Description

            </label>


            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="
                Example: Blood test results,
                MRI scan, medical report
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


          <button
            onClick={uploadDocument}
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
              ? "Uploading..."
              : "Upload Document"
            }

          </button>


        </div>

      </div>

    </main>

  );

}