"use client";

import { useRef, useState } from "react";

const steps = ["Agent", "Owner", "Property", "Documents", "Review"];

const agents = [
  { name: "Alejandro Romera PRRE", email: "romera@puenteromanorealestate.com", phone: "649 651 757" },
  { name: "Alex Clover", email: "alex@panorama.es", phone: "677 548 903" },
  { name: "Alfonso Muñoz", email: "alfonso@panorama.es", phone: "606 082 226" },
  { name: "Ash Rasoulian", email: "ash@panorama.es", phone: "684 40 27 90" },
  { name: "Beatrice Pittá", email: "beatrice@panorama.es", phone: "639 196 674" },
  { name: "Beatriz Garvayo", email: "garvayo@panorama.es", phone: "687 916 578" },
  { name: "Carolina Alaniz", email: "carolina@panorama.es", phone: "686 124 709" },
  { name: "Christopher Clover", email: "clover@panorama.es", phone: "609 801 885" },
  { name: "C. Lawton", email: "lawton@panorama.es", phone: "609 344 355" },
  { name: "David Montero", email: "david@panorama.es", phone: "615 101 460" },
  { name: "Dominik Maroszek", email: "dominik@panorama.es", phone: "639 161 546" },
  { name: "Eva Kiepel", email: "eva@panorama.es", phone: "648 136 105" },
  { name: "Evi Tinno", email: "evi@panorama.es", phone: "607 841 921" },
  { name: "Gonzalo Ruiz", email: "gonzalo@panorama.es", phone: "634 547 716" },
  { name: "Johan Olson", email: "johan@panorama.es", phone: "625 617 268" },
  { name: "Jo Borda", email: "jo@panorama.es", phone: "664 225 667" },
  { name: "Jovita Vicuña", email: "jovita@panorama.es", phone: "609 947 996" },
  { name: "Jules Franken", email: "jules@panorama.es", phone: "629 589 964" },
  { name: "Katinka Clover", email: "katinka@panorama.es", phone: "630 156 599" },
  { name: "Kevan Martial", email: "kevan@panorama.es", phone: "611 269 723" },
  { name: "Lindsey Medina PRRE", email: "lindsey@puenteromanorealestate.com", phone: "687 916 455" },
  { name: "Loli Vazquez", email: "loli@panorama.es", phone: "629 992 011" },
  { name: "Lorena Alaniz", email: "lorena@panorama.es", phone: "677 29 30 57" },
  { name: "Luca Solari", email: "luca@panorama.es", phone: "650 159 605" },
  { name: "Marco Dalli", email: "marco@panorama.es", phone: "678 648 765" },
  { name: "Natividad Muñoz", email: "natividad@panorama.es", phone: "614 04 83 89" },
  { name: "Samia Mohamdi", email: "samia@panorama.es", phone: "633 881 858" },
  { name: "Sarina Garber", email: "sarina@panorama.es", phone: "677 548 902" },
  { name: "Sean Cannon", email: "sean@panorama.es", phone: "656 705 781" },
  { name: "Sian Luijke-Roskott", email: "sianellen@panorama.es", phone: "618 023 939" },
  { name: "Silvina Rigada", email: "silvina@panorama.es", phone: "619 675 041" },
  { name: "Steve Barre", email: "steve@panorama.es", phone: "659 66 94 25" },
  { name: "Vanesa Mena", email: "vanesa@panorama.es", phone: "645 69 55 51" },
  { name: "Walter Fernandez", email: "walter@panorama.es", phone: "607 846 041" },
];

const requiredDocs = [
  ["titleDeed", "Escritura / Title deed"],
  ["ownerId", "DNI/NIE propietario / Owner ID"],
  ["authorization", "Autorización firmada / Signed authorization"],
  ["photos", "Fotos de la propiedad / Property photos"],
  ["floorplan", "Plano / Floorplan"],
  ["energyCertificate", "Certificado energético / Energy certificate"],
];

const optionalDocs = [["video", "Vídeo de la propiedad / Property video"]];

const initialForm = {
  sourceType: "",
  agentName: "",
  agentEmail: "",
  agentPhone: "",
  ownerName: "",
  ownerPhone: "",
  ownerEmail: "",
  propertyTitle: "",
  propertyType: "",
  operation: "",
  address: "",
  city: "",
  neighborhood: "",
  bedrooms: "",
  bathrooms: "",
  guestToilets: "",
  surfaceSqm: "",
  plotSqm: "",
  terraceSqm: "",
  price: "",
  commission: "",
  description: "",
  voiceTranscript: "",
  notes: "",
};

export default function Page() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState({});
  const [voiceNotes, setVoiceNotes] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [processingVoice, setProcessingVoice] = useState(false);

  const progress = ((step + 1) / steps.length) * 100;

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const showMessage = (text, type = "info") => {
    setMessage(text);
    setMessageType(type);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const addFiles = (key, selectedFiles) => {
    setFiles((current) => ({
      ...current,
      [key]: [...(current[key] || []), ...selectedFiles],
    }));
  };

  const removeFile = (key, indexToRemove) => {
    setFiles((current) => ({
      ...current,
      [key]: (current[key] || []).filter((_, index) => index !== indexToRemove),
    }));
  };

  const processVoiceNotes = async () => {
    if (!voiceNotes.length) {
      showMessage("Please record at least one voice note first.", "error");
      return;
    }

    try {
      setProcessingVoice(true);
      showMessage("", "info");

      const data = new FormData();

      voiceNotes.forEach((note) => {
        data.append("audio", note.file, note.file.name);
      });

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: data,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Voice processing failed.");
      }

      const extracted = json.fields || {};

      setForm((f) => ({
        ...f,
        voiceTranscript: json.transcript || f.voiceTranscript,
        propertyTitle: extracted.propertyTitle || f.propertyTitle,
        propertyType: extracted.propertyType || f.propertyType,
        operation: extracted.operation || f.operation,
        city: extracted.city || f.city,
        neighborhood: extracted.neighborhood || f.neighborhood,
        address: extracted.address || f.address,
        bedrooms: extracted.bedrooms || f.bedrooms,
        bathrooms: extracted.bathrooms || f.bathrooms,
        guestToilets: extracted.guestToilets || f.guestToilets,
        surfaceSqm: extracted.surfaceSqm || f.surfaceSqm,
        plotSqm: extracted.plotSqm || f.plotSqm,
        terraceSqm: extracted.terraceSqm || f.terraceSqm,
        price: extracted.price || f.price,
        commission: extracted.commission || f.commission,
        description: json.description || f.description,
      }));

      showMessage("Voice notes processed. Please review the auto-filled fields.", "success");
    } catch (error) {
      showMessage(error.message || "Voice processing failed.", "error");
    } finally {
      setProcessingVoice(false);
    }
  };

  const validateAndGo = (targetStep) => {
    showMessage("", "info");

    if (targetStep < step) {
      setStep(targetStep);

      setTimeout(() => {
        scrollToTop();
      }, 50);

      return;
    }

    if (step === 0 && (!form.sourceType || !form.agentEmail)) {
      showMessage("Please select listing source and agent.", "error");
      return;
    }

    if (
      step === 1 &&
      form.sourceType === "Owner Direct" &&
      (!form.ownerName || !form.ownerPhone || !form.ownerEmail)
    ) {
      showMessage("Please complete owner information.", "error");
      return;
    }

    if (
      step === 2 &&
      (!form.propertyTitle ||
        !form.propertyType ||
        !form.address ||
        !form.city ||
        !form.price)
    ) {
      showMessage("Please complete all required property fields.", "error");
      return;
    }

    if (step === 3) {
      const missing = requiredDocs.filter(([key]) => !(files[key] || []).length);

      if (missing.length) {
        showMessage("All required documents must be uploaded.", "error");
        return;
      }
    }

    setStep(targetStep);

    setTimeout(() => {
      scrollToTop();
    }, 50);
  };

  const next = () => validateAndGo(step + 1);

  const back = () => {
    showMessage("", "info");

    setStep((s) => {
      const previousStep = Math.max(s - 1, 0);

      setTimeout(() => {
        scrollToTop();
      }, 50);

      return previousStep;
    });
  };

  const submit = async () => {
    try {
      setLoading(true);

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
      }

      showMessage("Preparing secure uploads...", "info");

      const uploadItems = [];

      Object.entries(files).forEach(([fileKey, fileList]) => {
        (fileList || []).forEach((file) => {
          uploadItems.push({
            fileKey,
            file,
            name: file.name,
            type: file.type || "application/octet-stream",
            size: file.size,
          });
        });
      });

      voiceNotes.forEach((note) => {
        uploadItems.push({
          fileKey: "voiceNotes",
          file: note.file,
          name: note.file.name,
          type: note.file.type || "application/octet-stream",
          size: note.file.size,
        });
      });

      const prepareResponse = await fetch("/api/uploads/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: uploadItems.map(({ fileKey, name, type, size }) => ({
            fileKey,
            name,
            type,
            size,
          })),
        }),
      });

      const prepareJson = await prepareResponse.json().catch(() => ({}));

      if (!prepareResponse.ok) {
        throw new Error(prepareJson.error || "Could not prepare file uploads.");
      }

      const uploadedFileMetadata = [];

      for (let i = 0; i < prepareJson.files.length; i += 1) {
        const signedFile = prepareJson.files[i];
        const originalFile = uploadItems[i].file;

        showMessage(`Uploading ${i + 1} of ${prepareJson.files.length}: ${originalFile.name}`, "info");

        const uploadResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/upload/sign/property-documents/${signedFile.path}?token=${signedFile.token}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": originalFile.type || "application/octet-stream",
            },
            body: originalFile,
          }
        );

        if (!uploadResponse.ok) {
          const uploadErrorText = await uploadResponse.text().catch(() => "");
          throw new Error(`Upload failed for ${originalFile.name}. ${uploadErrorText}`);
        }

        uploadedFileMetadata.push({
          document_type: signedFile.fileKey,
          file_name: signedFile.name,
          storage_path: signedFile.path,
          mime_type: signedFile.type,
          size_bytes: signedFile.size,
        });
      }

      showMessage("Saving listing to Supabase...", "info");

      const listingResponse = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId: prepareJson.propertyId,
          form,
          files: uploadedFileMetadata,
        }),
      });

      const listingJson = await listingResponse.json().catch(() => ({}));

      if (!listingResponse.ok) {
        const missingFields = listingJson.missingFields?.length
          ? ` Missing fields: ${listingJson.missingFields.join(", ")}.`
          : "";

        const missingDocs = listingJson.missingDocs?.length
          ? ` Missing documents: ${listingJson.missingDocs.join(", ")}.`
          : "";

        throw new Error(
          `${listingJson.error || "Submission failed."}${missingFields}${missingDocs}`
        );
      }

      showMessage(
        listingJson.message || "Property successfully submitted to the pipeline.",
        "success"
      );

      alert("Listing submitted successfully.");
    } catch (error) {
      console.error("Submit error:", error);
      showMessage(error.message || "Something went wrong submitting the listing.", "error");
      alert(error.message || "Something went wrong submitting the listing.");
    } finally {
      setLoading(false);
    }
  };

  const totalDocumentCount = Object.values(files).reduce(
    (count, fileList) => count + (fileList?.length || 0),
    0
  );

  return (
    <main className="min-h-screen bg-[#f3f0ea] px-4 py-6 text-[#12263a]">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[34px] bg-[#12385b] text-white shadow-2xl">
          <div className="bg-gradient-to-r from-[#0d2f4f] via-[#164a73] to-[#2f7698] p-7 md:p-9">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#d8c59b]">
                  Panorama Marbella · Since 1970
                </div>
                <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
                  Alta de Propiedad
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 md:text-base">
                  Professional property intake form for new listings, documents,
                  media and AI-assisted descriptions.
                </p>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-sm text-white/80 backdrop-blur">
                Step <span className="font-bold text-white">{step + 1}</span> of{" "}
                {steps.length}
              </div>
            </div>

            <div className="mt-7 h-3 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-[#d8c59b] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-6 grid grid-cols-5 gap-2">
              {steps.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    if (i <= step) setStep(i);
                  }}
                  className={`rounded-full px-2 py-2 text-center text-[11px] font-semibold transition-all md:text-xs ${
                    i === step
                      ? "bg-white text-[#12385b]"
                      : i < step
                      ? "bg-[#d8c59b] text-[#12385b]"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`mt-5 rounded-2xl p-4 text-sm font-medium shadow ${
              messageType === "success"
                ? "bg-green-50 text-green-800"
                : messageType === "error"
                ? "bg-red-50 text-red-800"
                : "bg-white text-[#12263a]"
            }`}
          >
            {message}
          </div>
        )}

        <div className="mt-6 rounded-[32px] border border-[#d9e4ea] bg-white p-6 shadow-xl md:p-10">
          {step === 0 && (
            <section>
              <SectionTitle title="Listing Source & Agent" />

              <div className="mb-6 grid gap-4 md:grid-cols-2">
                <ChoiceCard
                  active={form.sourceType === "Owner Direct"}
                  title="Direct Owner"
                  text="The property comes directly from the owner."
                  onClick={() => update("sourceType", "Owner Direct")}
                />

                <ChoiceCard
                  active={form.sourceType === "Agency"}
                  title="Agency"
                  text="The property comes from another agency."
                  onClick={() => update("sourceType", "Agency")}
                />
              </div>

              {form.sourceType === "Agency" && (
                <div className="mb-6 rounded-2xl bg-[#eef6fa] p-4 text-sm font-medium text-[#12385b]">
                  Agency route will be configured later. For now, continue with
                  the same form.
                </div>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Agent</span>

                <select
                  value={form.agentEmail}
                  onChange={(e) => {
                    const selected = agents.find((a) => a.email === e.target.value);

                    if (selected) {
                      update("agentName", selected.name);
                      update("agentEmail", selected.email);
                      update("agentPhone", selected.phone);
                    }
                  }}
                  className="w-full rounded-2xl border border-[#d9e4ea] bg-[#fbfaf7] px-5 py-4 text-base outline-none focus:border-[#2f7698]"
                >
                  <option value="">Select agent...</option>
                  {agents.map((agent) => (
                    <option key={agent.email} value={agent.email}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </label>

              {form.agentEmail && (
                <div className="mt-6 grid gap-4 rounded-3xl bg-[#eef6fa] p-6 md:grid-cols-3">
                  <InfoCard label="Name" value={form.agentName} />
                  <InfoCard label="Email" value={form.agentEmail} />
                  <InfoCard label="Mobile" value={form.agentPhone} />
                </div>
              )}
            </section>
          )}

          {step === 1 && (
            <section>
              <SectionTitle title="Owner Information" />

              {form.sourceType === "Agency" && (
                <div className="mb-6 rounded-2xl bg-[#fff8e7] p-4 text-sm font-medium text-[#7a5a18]">
                  Agency owner/contact route will be configured later. You can
                  skip owner details for agency listings for now.
                </div>
              )}

              <Grid>
                <Input label="Owner Name" value={form.ownerName} onChange={(v) => update("ownerName", v)} />
                <Input label="Owner Phone" value={form.ownerPhone} onChange={(v) => update("ownerPhone", v)} />
                <Input label="Owner Email" value={form.ownerEmail} onChange={(v) => update("ownerEmail", v)} />
              </Grid>
            </section>
          )}

          {step === 2 && (
            <section>
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <SectionTitle title="Property Details" compact />
                  <p className="mt-1 text-sm text-slate-500">
                    Fill manually or add one or more voice notes to auto-fill fields.
                  </p>
                </div>

                <VoiceNotesBox
                  voiceNotes={voiceNotes}
                  setVoiceNotes={setVoiceNotes}
                  onProcess={processVoiceNotes}
                  processing={processingVoice}
                />
              </div>

              <Grid>
                <Input label="Property Title" value={form.propertyTitle} onChange={(v) => update("propertyTitle", v)} />
                <Select label="Property Type" value={form.propertyType} onChange={(v) => update("propertyType", v)} options={["Villa", "Apartment", "Penthouse", "Townhouse", "Plot", "Commercial"]} />
                <Select label="Operation" value={form.operation} onChange={(v) => update("operation", v)} options={["Sale", "Rental", "Both"]} />
                <Input label="Address" value={form.address} onChange={(v) => update("address", v)} />
                <Input label="City" value={form.city} onChange={(v) => update("city", v)} />
                <Input label="Neighborhood" value={form.neighborhood} onChange={(v) => update("neighborhood", v)} />
                <Input label="Bedrooms" type="number" value={form.bedrooms} onChange={(v) => update("bedrooms", v)} />
                <Input label="Bathrooms" type="number" value={form.bathrooms} onChange={(v) => update("bathrooms", v)} />
                <Input label="Guest Toilets" type="number" value={form.guestToilets} onChange={(v) => update("guestToilets", v)} />
                <Input label="Built sqm" type="number" value={form.surfaceSqm} onChange={(v) => update("surfaceSqm", v)} />
                <Input label="Plot sqm" type="number" value={form.plotSqm} onChange={(v) => update("plotSqm", v)} />
                <Input label="Terrace sqm" type="number" value={form.terraceSqm} onChange={(v) => update("terraceSqm", v)} />
                <Input label="Price €" type="number" value={form.price} onChange={(v) => update("price", v)} />
                <Input label="Commission" value={form.commission} onChange={(v) => update("commission", v)} />
              </Grid>

              <label className="mt-5 block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Clean Property Description
                </span>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  className="min-h-[160px] w-full rounded-2xl border border-[#d9e4ea] bg-[#fbfaf7] px-5 py-4 outline-none transition focus:border-[#2f7698]"
                  placeholder="After processing voice notes, a cleaned property description will appear here..."
                />
              </label>
            </section>
          )}

          {step === 3 && (
            <section>
              <SectionTitle title="Required Documents & Media" />

              <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                All required documents are mandatory. Photos and video support multiple files.
              </div>

              <div className="space-y-4">
                {[...requiredDocs, ...optionalDocs].map(([key, label]) => (
                  <FileUploadRow
                    key={key}
                    fileKey={key}
                    label={label}
                    files={files[key] || []}
                    required={requiredDocs.some(([requiredKey]) => requiredKey === key)}
                    onAddFiles={addFiles}
                    onRemoveFile={removeFile}
                  />
                ))}
              </div>
            </section>
          )}

          {step === 4 && (
            <section>
              <SectionTitle title="Review" />

              <div className="space-y-4 rounded-3xl border border-[#d9e4ea] p-6">
                <ReviewRow label="Source" value={form.sourceType} />
                <ReviewRow label="Agent" value={form.agentName} />
                <ReviewRow label="Owner" value={form.ownerName} />
                <ReviewRow label="Property" value={form.propertyTitle} />
                <ReviewRow label="Type" value={form.propertyType} />
                <ReviewRow label="Operation" value={form.operation} />
                <ReviewRow label="Address" value={`${form.address}, ${form.city}`} />
                <ReviewRow label="Bedrooms" value={form.bedrooms} />
                <ReviewRow label="Bathrooms" value={form.bathrooms} />
                <ReviewRow label="Guest Toilets" value={form.guestToilets} />
                <ReviewRow label="Built sqm" value={form.surfaceSqm} />
                <ReviewRow label="Price" value={form.price ? `€ ${form.price}` : ""} />
                <ReviewRow label="Voice Notes" value={`${voiceNotes.length}`} />
                <ReviewRow label="Uploaded Files" value={`${totalDocumentCount}`} />
              </div>

              <textarea
                placeholder="Additional notes..."
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                className="mt-6 min-h-[120px] w-full rounded-2xl border border-[#d9e4ea] bg-[#fbfaf7] p-5 outline-none focus:border-[#2f7698]"
              />
            </section>
          )}

          <div className="mt-10 flex flex-col gap-3 md:flex-row">
            {step > 0 && (
              <button type="button" onClick={back} className="rounded-2xl border border-[#d9e4ea] px-6 py-4 font-semibold text-[#12385b]">
                Back
              </button>
            )}

            {step < steps.length - 1 ? (
              <button type="button" onClick={next} className="flex-1 rounded-2xl bg-[#12385b] px-6 py-4 font-semibold text-white transition hover:bg-[#164a73]">
                Continue
              </button>
            ) : (
              <button type="button" onClick={submit} disabled={loading} className="flex-1 rounded-2xl bg-[#12385b] px-6 py-4 font-semibold text-white transition hover:bg-[#164a73] disabled:opacity-50">
                {loading ? "Submitting..." : "Submit to Pipeline"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function VoiceNotesBox({ voiceNotes, setVoiceNotes, onProcess, processing }) {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");

  const startRecording = async () => {
    setError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const type = recorder.mimeType || "audio/webm";
        const extension = type.includes("mp4") ? "m4a" : "webm";
        const blob = new Blob(chunksRef.current, { type });
        const file = new File([blob], `voice-note-${Date.now()}.${extension}`, { type });
        const url = URL.createObjectURL(blob);

        setVoiceNotes((notes) => [
          ...notes,
          {
            id: `${Date.now()}-${Math.random()}`,
            file,
            url,
            name: `Voice Note ${notes.length + 1}`,
            size: blob.size,
          },
        ]);

        streamRef.current?.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setRecording(true);
    } catch {
      setError("Microphone access failed. Please allow microphone permissions and try again.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const deleteNote = (id) => {
    setVoiceNotes((notes) => notes.filter((note) => note.id !== id));
  };

  return (
    <div className="w-full rounded-3xl bg-[#eef6fa] p-4 md:max-w-sm">
      <div className="font-semibold text-[#12385b]">Voice notes</div>
      <p className="mt-1 text-xs text-slate-500">
        Record one or more audio notes. Stop manually when finished.
      </p>

      <div className="mt-4 flex gap-2">
        {!recording ? (
          <button type="button" onClick={startRecording} className="flex-1 rounded-2xl bg-[#12385b] px-4 py-3 text-sm font-semibold text-white">
            🎙 Start Recording
          </button>
        ) : (
          <button type="button" onClick={stopRecording} className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white">
            Stop
          </button>
        )}
      </div>

      {error && <div className="mt-3 text-xs font-medium text-red-600">{error}</div>}

      {voiceNotes.length > 0 && (
        <div className="mt-4 space-y-3">
          {voiceNotes.map((note, index) => (
            <div key={note.id} className="rounded-2xl bg-white p-3 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-slate-800">
                  Voice Note {index + 1}
                </div>
                <button type="button" onClick={() => deleteNote(note.id)} className="text-xs font-semibold text-red-600">
                  Delete
                </button>
              </div>
              <audio controls src={note.url} className="w-full" />
            </div>
          ))}

          <button type="button" onClick={onProcess} disabled={processing} className="w-full rounded-2xl bg-[#d8c59b] px-4 py-3 text-sm font-semibold text-[#12385b] disabled:opacity-50">
            {processing ? "Processing..." : "Transcribe & Auto-fill"}
          </button>
        </div>
      )}
    </div>
  );
}

function FileUploadRow({ fileKey, label, files, required, onAddFiles, onRemoveFile }) {
  return (
    <div className="rounded-2xl border border-[#d9e4ea] bg-[#fbfaf7] p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-semibold text-[#12263a]">
            {label} {required ? <span className="text-red-600">*</span> : null}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {files.length ? `${files.length} file(s) selected` : "PDF, image, video or document"}
          </div>
        </div>

        <input
          type="file"
          multiple
          onChange={(e) => {
            const selected = Array.from(e.target.files || []);
            onAddFiles(fileKey, selected);
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-sm shadow-sm">
              <span className="truncate">{file.name}</span>
              <button type="button" onClick={() => onRemoveFile(fileKey, index)} className="shrink-0 font-semibold text-red-600">
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid gap-5 md:grid-cols-2">{children}</div>;
}

function SectionTitle({ title, compact = false }) {
  return (
    <div className={compact ? "" : "mb-6"}>
      <div className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#b89a63]">
        Panorama Intake
      </div>
      <h2 className="text-2xl font-semibold text-[#12385b]">{title}</h2>
    </div>
  );
}

function ChoiceCard({ active, title, text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl border p-6 text-left transition ${
        active ? "border-[#2f7698] bg-[#eef6fa] shadow-md" : "border-[#d9e4ea] bg-[#fbfaf7]"
      }`}
    >
      <div className="text-lg font-semibold text-[#12385b]">{title}</div>
      <div className="mt-2 text-sm text-slate-500">{text}</div>
    </button>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-[#d9e4ea] bg-[#fbfaf7] px-5 py-4 outline-none transition focus:border-[#2f7698]"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-[#d9e4ea] bg-[#fbfaf7] px-5 py-4 outline-none transition focus:border-[#2f7698]"
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-2 break-words font-semibold text-slate-900">
        {value}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-900">{value || "—"}</span>
    </div>
  );
}
