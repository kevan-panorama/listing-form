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

function cleanNumber(value) {
  const cleaned = String(value || "").replace(/[^\d.]/g, "");
  return cleaned ? Number(cleaned) : null;
}

function safeText(value) {
  return String(value || "").trim();
}

export async function POST(request) {
  try {
    const payload = await request.json();

    const form = payload.form || {};
    const uploadedFiles = payload.files || [];
    const propertyId = payload.propertyId || crypto.randomUUID();

    const sourceType = safeText(form.sourceType);
    const isDirectOwner = sourceType === "Owner Direct";

    const fieldsToCheck = isDirectOwner
      ? [...requiredFields, ...directOwnerFields]
      : requiredFields;

    const missingFields = fieldsToCheck.filter((field) => !safeText(form[field]));

    const missingDocs = requiredDocs.filter((doc) => {
      return !uploadedFiles.some((file) => file.document_type === doc);
    });

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

    const listingPayload = {
      id: propertyId,
      status: "READY_FOR_PIPELINE",

      source_type: sourceType,

      agent_name: safeText(form.agentName),
      agent_email: safeText(form.agentEmail),
      agent_phone: safeText(form.agentPhone),

      owner_name: safeText(form.ownerName),
      owner_phone: safeText(form.ownerPhone),
      owner_email: safeText(form.ownerEmail),
      ownership_status: safeText(form.ownershipStatus),

      property_title: safeText(form.propertyTitle),
      property_type: safeText(form.propertyType),
      operation: safeText(form.operation),
      address: safeText(form.address),
      city: safeText(form.city),
      neighborhood: safeText(form.neighborhood),
      gps_link: safeText(form.gpsLink),

      bedrooms: cleanNumber(form.bedrooms),
      bathrooms: cleanNumber(form.bathrooms),
      guest_toilets: cleanNumber(form.guestToilets),
      surface_sqm: cleanNumber(form.surfaceSqm),
      plot_sqm: cleanNumber(form.plotSqm),
      terrace_sqm: cleanNumber(form.terraceSqm),
      price: cleanNumber(form.price),

      commission: safeText(form.commission),
      description: safeText(form.description),
      voice_transcript: safeText(form.voiceTranscript),
      notes: safeText(form.notes),

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
