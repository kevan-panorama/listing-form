import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

function safeName(name) {
  return String(name || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request) {
  try {
    const { files = [] } = await request.json();

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "No files provided." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const propertyId = crypto.randomUUID();

    const signedFiles = [];

    for (const file of files) {
      const fileKey = file.fileKey || "misc";
      const fileName = safeName(file.name);
      const path = `${propertyId}/${fileKey}/${Date.now()}-${crypto.randomUUID()}-${fileName}`;

      const { data, error } = await supabase.storage
        .from("property-documents")
        .createSignedUploadUrl(path);

      if (error) {
        throw new Error(`Signed upload URL failed: ${error.message}`);
      }

      signedFiles.push({
        propertyId,
        fileKey,
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size || 0,
        path,
        token: data.token,
      });
    }

    return NextResponse.json({
      propertyId,
      files: signedFiles,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Upload preparation failed." },
      { status: 500 }
    );
  }
}
