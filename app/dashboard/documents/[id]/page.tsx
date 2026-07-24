"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardMenu from "@/app/components/DashboardMenu";

const DOCUMENTS_BUCKET = "documents";

export default function DocumentDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [document, setDocument] =
    useState<any>(null);

  const [description, setDescription] =
    useState("");

  const [newFile, setNewFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (id) {
      loadDocument();
    }
  }, [id]);

  async function loadDocument() {
    setLoading(true);

    const { data, error } =
      await supabase
        .from("documents")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
      console.error(error);
      alert(error.message);
      setLoading(false);
      return;
    }

    setDocument(data);

    setDescription(
      data.description || ""
    );

    setLoading(false);
  }

  async function saveChanges() {
    if (!document) {
      return;
    }

    setSaving(true);

    let updatedFileUrl =
      document.file_url;

    let updatedFileName =
      document.file_name;

    let updatedFileType =
      document.file_type;

    let newFilePath: string | null =
      null;

    if (newFile) {

      const fileExtension =
        newFile.name.split(".").pop() ||
        "file";

      const uniqueName =
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}`;

      newFilePath =
        `${document.patient_id}/${uniqueName}.${fileExtension}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .upload(
          newFilePath,
          newFile
        );

      if (uploadError) {
        console.error(uploadError);
        alert(uploadError.message);
        setSaving(false);
        return;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from(DOCUMENTS_BUCKET)
        .getPublicUrl(
          newFilePath
        );

      updatedFileUrl =
        publicUrlData.publicUrl;

      updatedFileName =
        newFile.name;

      updatedFileType =
        newFile.type || null;
    }

    const { error } =
      await supabase
        .from("documents")
        .update({
          file_name:
            updatedFileName,

          file_url:
            updatedFileUrl,

          file_type:
            updatedFileType,

          description:
            description || null,
        })
        .eq("id", id);

    if (error) {
      console.error(error);

      if (newFilePath) {
        await supabase.storage
          .from(DOCUMENTS_BUCKET)
          .remove([
            newFilePath,
          ]);
      }

      alert(error.message);
      setSaving(false);
      return;
    }

    if (newFile) {

      const oldFilePath =
        extractStoragePath(
          document.file_url
        );

      if (oldFilePath) {

        await supabase.storage
          .from(DOCUMENTS_BUCKET)
          .remove([
            oldFilePath,
          ]);

      }

    }

    alert(
      "Document updated successfully"
    );

    setNewFile(null);

    setSaving(false);

    await loadDocument();
  }

  async function deleteDocument() {
    if (!document) {
      return;
    }

    const confirmed =
      confirm(
        "Are you sure you want to delete this document?"
      );

    if (!confirmed) {
      return;
    }

    const filePath =
      extractStoragePath(
        document.file_url
      );

    if (filePath) {

      await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .remove([
          filePath,
        ]);

    }

    const { error } =
      await supabase
        .from("documents")
        .delete()
        .eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    router.push(
      `/dashboard/patients/${document.patient_id}`
    );
  }

  function extractStoragePath(
    fileUrl: string
  ) {
    if (!fileUrl) {
      return null;
    }

    const marker =
      `/storage/v1/object/public/${DOCUMENTS_BUCKET}/`;

    const index =
      fileUrl.indexOf(marker);

    if (index === -1) {
      return null;
    }

    return decodeURIComponent(
      fileUrl.substring(
        index + marker.length
      )
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        Loading...
      </main>
    );
  }

  if (!document) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        Document not found
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white p-6 pt-32">

      <DashboardMenu />

      <div className="max-w-3xl mx-auto">

        <button
          onClick={() =>
            router.push(
              `/dashboard/patients/${document.patient_id}`
            )
          }
          className="text-[#BFA15F] mb-6"
        >
          ← Back to Patient
        </button>

        <div className="flex justify-between items-center flex-wrap gap-4 mb-8">

          <div>

            <h1 className="text-3xl font-bold text-[#BFA15F]">
              Document
            </h1>

            <p className="text-gray-400 mt-2">
              {document.file_name}
            </p>

          </div>

          <button
            onClick={deleteDocument}
            className="
              bg-red-600
              text-white
              px-5
              py-3
              rounded-xl
              font-bold
            "
          >
            Delete
          </button>

        </div>

        <div className="bg-[#171717] border border-[#BFA15F]/30 rounded-xl p-6 space-y-6">

          <div>

            <p className="text-gray-400 mb-2">
              Current File
            </p>

            <p className="font-bold">
              {document.file_name}
            </p>

            {document.file_url && (

              <a
                href={document.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-block
                  mt-4
                  text-[#BFA15F]
                  underline
                "
              >
                Open Document
              </a>

            )}

          </div>

          <div>

            <label className="block mb-2 text-gray-300">
              Replace File
            </label>

            <input
              type="file"
              onChange={(e) =>
                setNewFile(
                  e.target.files?.[0] || null
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
              "
            />

          </div>

          <div>

            <label className="block mb-2 text-gray-300">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Document description..."
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
            onClick={saveChanges}
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
              : "Save Changes"}
          </button>

        </div>

      </div>

    </main>
  );
}