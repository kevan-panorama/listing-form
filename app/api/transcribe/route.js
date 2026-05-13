import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY environment variable." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const audioFiles = formData.getAll("audio");

    if (!audioFiles.length) {
      return NextResponse.json(
        { error: "No audio files received." },
        { status: 400 }
      );
    }

    const transcripts = [];

    for (const audio of audioFiles) {
      const transcriptionData = new FormData();
      transcriptionData.append("file", audio);
      transcriptionData.append("model", "gpt-4o-mini-transcribe");
      transcriptionData.append("response_format", "json");

      const transcriptionResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: transcriptionData,
      });

      const transcriptionJson = await transcriptionResponse.json();

      if (!transcriptionResponse.ok) {
        return NextResponse.json(
          {
            error: transcriptionJson.error?.message || "Transcription failed.",
          },
          { status: 500 }
        );
      }

      transcripts.push(transcriptionJson.text || "");
    }

    const combinedTranscript = transcripts.join("\n\n");

    const extractionResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "You extract real estate listing information from agent voice notes. Return clean structured JSON only. Do not invent missing information. If a field is unknown, return an empty string.",
          },
          {
            role: "user",
            content: `
Transcript:
${combinedTranscript}

Extract the property information and create a clean, polished property description.

Return:
- propertyTitle
- propertyType: Villa, Apartment, Penthouse, Townhouse, Plot, Commercial, or empty
- operation: Sale, Rental, Both, or empty
- address
- city
- neighborhood
- bedrooms
- bathrooms
- guestToilets
- surfaceSqm
- plotSqm
- terraceSqm
- price
- commission
- description

Important:
- Numbers should be plain numbers only.
- Price should be numbers only, no currency symbol.
- Description should be cleaned up, professional, and not word-for-word.
`,
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "property_extraction",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                propertyTitle: { type: "string" },
                propertyType: { type: "string" },
                operation: { type: "string" },
                address: { type: "string" },
                city: { type: "string" },
                neighborhood: { type: "string" },
                bedrooms: { type: "string" },
                bathrooms: { type: "string" },
                guestToilets: { type: "string" },
                surfaceSqm: { type: "string" },
                plotSqm: { type: "string" },
                terraceSqm: { type: "string" },
                price: { type: "string" },
                commission: { type: "string" },
                description: { type: "string" }
              },
              required: [
                "propertyTitle",
                "propertyType",
                "operation",
                "address",
                "city",
                "neighborhood",
                "bedrooms",
                "bathrooms",
                "guestToilets",
                "surfaceSqm",
                "plotSqm",
                "terraceSqm",
                "price",
                "commission",
                "description"
              ]
            },
            strict: true
          }
        }
      }),
    });

    const extractionJson = await extractionResponse.json();

    if (!extractionResponse.ok) {
      return NextResponse.json(
        {
          error: extractionJson.error?.message || "AI extraction failed.",
        },
        { status: 500 }
      );
    }

    const outputText =
      extractionJson.output_text ||
      extractionJson.output?.[0]?.content?.[0]?.text ||
      "{}";

    const parsed = JSON.parse(outputText);

    return NextResponse.json({
      transcript: combinedTranscript,
      description: parsed.description || "",
      fields: parsed,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || "Unexpected transcription error.",
      },
      { status: 500 }
    );
  }
}
