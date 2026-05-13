import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const requiredFields = [
  "agentName",
  "agentEmail",
  "agentPhone",
  "propertyTitle",
  "propertyType",
  "address",
  "city",
  "neighborhood",
  "bedrooms",
  "bathrooms",
  "surfaceSqm",
  "price",
  "commission",
];

const directOwnerFields = ["ownerName", "ownerPhone", "ownerEmail"];

const requiredDocs = [
  "titleDeed",
  "ownerId",
  "authorization",
  "photos",
  "floorplan",
  "energyCertificate",
];

const allFileKeys = [
  "titleDeed",
  "ownerId",
  "authorization",
  "photos",
  "floorplan",
  "energyCertificate",
  "video",
  "voiceNotes",
];

function cleanNumber(value) {
  const cleaned = String(value || "").replace(/[^\d.]/g, "");
  return cleaned ? Number(cleaned) : null;
}

function safeText(value) {
  return String(value || "").trim();
}

async function uploadFiles({ supabase, data, propertyId }) {
  const uploadedFiles = [];

  for (const fileKey of allFileKeys) {
    const files = data.getAll(fileKey);

    for (const file of files) {
      if (!(file instanceof File) || file.size === 0) continue;

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${propertyId}/${fileKey}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from("property-documents")
        .upload(storagePath, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`File upload failed for ${fileKey}: ${uploadError.message}`);
      }

      uploadedFiles.push({
        document_type: fileKey,
        file_name: file.name,
        storage_path: storagePath,
        mime_type: file.type || "application/octet-stream",
        size_bytes: file.size,
      });
    }
  }

  return uploadedFiles;
}

export async function POST(request) {
  try {
    const data = await request.formData();

    const sourceType = safeText(data.get("sourceType"));
    const isDirectOwner =
      sourceType === "owner" ||
      sourceType === "Direct Owner" ||
      sourceType === "Owner Direct";

    const fieldsToCheck = isDirectOwner
      ? [...requiredFields, ...directOwnerFields]
      : requiredFields;

    const missingFields = fieldsToCheck.filter(
      (field) => !safeText(data.get(field))
    );

    const missingDocs = requiredDocs.filter(
      (doc) => data.getAll(doc).filter((file) => file instanceof File && file.size > 0).length === 0
    );

    if (missingFields.length > 0 || missingDocs.length > 0) {
      return NextResponse.json(
        {
          error: "Incomplete listing.",
          missingFields,
          missingDocs,
          status: "INCOMPLETE",
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const propertyId = crypto.randomUUID();

    const uploadedFiles = await uploadFiles({ supabase, data, propertyId });

    const listingPayload = {
      id: propertyId,
      status: "READY_FOR_PIPELINE",

      source_type: sourceType,

      agent_name: safeText(data.get("agentName")),
      agent_email: safeText(data.get("agentEmail")),
      agent_phone: safeText(data.get("agentPhone")),

      owner_name: safeText(data.get("ownerName")),
      owner_phone: safeText(data.get("ownerPhone")),
      owner_email: safeText(data.get("ownerEmail")),
      ownership_status: safeText(data.get("ownershipStatus")),

      property_title: safeText(data.get("propertyTitle")),
      property_type: safeText(data.get("propertyType")),
      operation: safeText(data.get("operation")),
      address: safeText(data.get("address")),
      city: safeText(data.get("city")),
      neighborhood: safeText(data.get("neighborhood")),
      gps_link: safeText(data.get("gpsLink")),

      bedrooms: cleanNumber(data.get("bedrooms")),
      bathrooms: cleanNumber(data.get("bathrooms")),
      guest_toilets: cleanNumber(data.get("guestToilets")),
      surface_sqm: cleanNumber(data.get("surfaceSqm")),
      plot_sqm: cleanNumber(data.get("plotSqm")),
      terrace_sqm: cleanNumber(data.get("terraceSqm")),
      price: cleanNumber(data.get("price")),

      commission: safeText(data.get("commission")),
      description: safeText(data.get("description")),
      voice_transcript: safeText(data.get("voiceTranscript")),
      notes: safeText(data.get("notes")),

      files: uploadedFiles,
    };

    const { error: insertError } = await supabase
      .from("property_listings")
      .insert(listingPayload);

    if (insertError) {
      throw new Error(`Database insert failed: ${insertError.message}`);
    }

    if (process.env.MAKE_WEBHOOK_URL) {
      await fetch(process.env.MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "new_listing_submitted",
          listing: listingPayload,
          submittedAt: new Date().toISOString(),
        }),
      });
    }

    return NextResponse.json({
      id: propertyId,
      status: "READY_FOR_PIPELINE",
      message: "Listing submitted successfully.",
    });
  } catch (error) {
    console.error("Listing submission error:", error);

    return NextResponse.json(
      { error: error.message || "Server error." },
      { status: 500 }
    );
  }
}
