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
  const [loading, setLoading] = useState(false);
  const [processingVoice, setProcessingVoice] = useState(false);

  const progress = ((step + 1) / steps.length) * 100;

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const processVoiceNotes = async () => {
    if (!voiceNotes.length) {
      setMessage("Please record at least one voice note first.");
      return;
    }

    setProcessingVoice(true);
    setMessage("");

    const data = new FormData();

    voiceNotes.forEach((note) => {
      data.append("audio", note.file, note.file.name);
    });

    const res = await fetch("/api/transcribe", {
      method: "POST",
      body: data,
    });

    const json = await res.json();
    setProcessingVoice(false);

    if (!res.ok) {
      setMessage(json.error || "Voice processing failed.");
      return;
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

    setMessage("Voice notes processed. Please review the auto-filled fields.");
  };

  const validateAndGo = (targetStep) => {
    setMessage("");

    if (targetStep < step) {
      setStep(targetStep);
      return;
    }

    if (step === 0 && (!form.sourceType || !form.agentEmail)) {
      setMessage("Please select listing source and agent.");
      return;
    }

    if (step === 1 && form.sourceType === "Owner Direct" && (!form.ownerName || !form.ownerPhone || !form.ownerEmail)) {
      setMessage("Please complete owner information.");
      return;
    }

    if (step === 2 && (!form.propertyTitle || !form.propertyType || !form.address || !form.city || !form.price)) {
      setMessage("Please complete all required property fields.");
      return;
    }

    if (step === 3) {
      const missing = requiredDocs.filter(([key]) => !files[key]?.length);
      if (missing.length) {
        setMessage("All required documents must be uploaded.");
        return;
      }
    }

    setStep(targetStep);
  };

  const next = () => validateAndGo(step + 1);

  const back = () => {
    setMessage("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async () => {
    setLoading(true);
    setMessage("");

    const body = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      body.append(key, value || "");
    });

    Object.entries(files).forEach(([key, fileList]) => {
      fileList.forEach((file) => body.append(key, file));
    });

    voiceNotes.forEach((note) => {
      body.append("voiceNotes", note.file, note.file.name);
    });

    const res = await fetch("/api/listings", {
      method: "POST",
      body,
    });

    setLoading(false);

    if (!res.ok) {
      setMessage("Submission failed. Please check the required fields and documents.");
      return;
    }

    setMessage("Property successfully added to pipeline.");
  };

  return (
    <main className="min-h-screen bg-[#f5f3ee] px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[32px] bg-[#17395c] p-6 text-white shadow-2xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Alta de Propiedad</h1>
              <p className="mt-2 text-white/70">Property Intake Form</p>
            </div>

            <div className="text-sm text-white/70">
              Step {step + 1} of {steps.length}
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-300"
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
                    ? "bg-white text-[#17395c]"
                    : i < step
                    ? "bg-emerald-400 text-[#17395c]"
                    : "bg-white/10 text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {message && (
          <div className="mt-5 rounded-2xl bg-white p-4 text-sm font-medium shadow">
            {message}
          </div>
        )}

        <div className="mt-6 rounded-[32px] bg-white p-6 shadow-xl md:p-10">
          {step === 0 && (
            <section>
              <h2 className="mb-6 text-2xl font-bold text-[#17395c]">
                Listing Source & Agent
              </h2>

              <div className="mb-6 grid gap-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => update("sourceType", "Owner Direct")}
                  className={`rounded-3xl border p-6 text-left transition ${
                    form.sourceType === "Owner Direct"
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 bg-[#faf9f5]"
                  }`}
                >
                  <div className="text-lg font-bold text-[#17395c]">Direct Owner</div>
                  <div className="mt-2 text-sm text-slate-500">
                    The property comes directly from the owner.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => update("sourceType", "Agency")}
                  className={`rounded-3xl border p-6 text-left transition ${
                    form.sourceType === "Agency"
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 bg-[#faf9f5]"
                  }`}
                >
                  <div className="text-lg font-bold text-[#17395c]">Agency</div>
                  <div className="mt-2 text-sm text-slate-500">
                    The property comes from another agency.
                  </div>
                </button>
              </div>

              {form.sourceType === "Agency" && (
                <div className="mb-6 rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-800">
                  Agency route will be configured later. For now, continue with the same form.
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
                  className="w-full rounded-2xl border border-slate-200 bg-[#faf9f5] px-5 py-4 text-base outline-none focus:border-[#17395c]"
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
                <div className="mt-6 grid gap-4 rounded-3xl bg-emerald-50 p-6 md:grid-cols-3">
                  <InfoCard label="Name" value={form.agentName} />
                  <InfoCard label="Email" value={form.agentEmail} />
                  <InfoCard label="Mobile" value={form.agentPhone} />
                </div>
              )}
            </section>
          )}

          {step === 1 && (
            <section>
              <h2 className="mb-6 text-2xl font-bold text-[#17395c]">
                Owner Information
              </h2>

              {form.sourceType === "Agency" && (
                <div className="mb-6 rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-800">
                  Agency owner/contact route will be configured later. You can skip owner details for agency listings for now.
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
                  <h2 className="text-2xl font-bold text-[#17395c]">Property Details</h2>
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

                <Select
                  label="Property Type"
                  value={form.propertyType}
                  onChange={(v) => update("propertyType", v)}
                  options={["Villa", "Apartment", "Penthouse", "Townhouse", "Plot", "Commercial"]}
                />

                <Select
                  label="Operation"
                  value={form.operation}
                  onChange={(v) => update("operation", v)}
                  options={["Sale", "Rental", "Both"]}
                />

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
                  className="min-h-[160px] w-full rounded-2xl border border-slate-200 bg-[#faf9f5] px-5 py-4 outline-none transition focus:border-[#17395c]"
                  placeholder="After processing voice notes, a cleaned property description will appear here..."
                />
              </label>

              {form.voiceTranscript && (
                <details className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm">
                  <summary className="cursor-pointer font-semibold text-[#17395c]">
                    View raw combined transcript
                  </summary>
                  <p className="mt-3 whitespace-pre-wrap text-slate-600">{form.voiceTranscript}</p>
                </details>
              )}
            </section>
          )}

          {step === 3 && (
            <section>
              <h2 className="mb-6 text-2xl font-bold text-[#17395c]">
                Required Documents
              </h2>

              <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                All documents are mandatory. Missing documents = property will NOT enter pipeline.
              </div>

              <div className="space-y-4">
                {requiredDocs.map(([key, label]) => (
                  <label
                    key={key}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-[#faf9f5] p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <div className="font-semibold">{label}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {files[key]?.length ? `${files[key].length} file(s) selected` : "PDF, image or document"}
                      </div>
                    </div>

                    <input
                      type="file"
                      multiple={key === "photos"}
                      onChange={(e) =>
                        setFiles((f) => ({
                          ...f,
                          [key]: Array.from(e.target.files || []),
                        }))
                      }
                    />
                  </label>
                ))}
              </div>
            </section>
          )}

          {step === 4 && (
            <section>
              <h2 className="mb-6 text-2xl font-bold text-[#17395c]">
                Review
              </h2>

              <div className="space-y-4 rounded-3xl border border-slate-200 p-6">
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
                <ReviewRow label="Documents" value={`${Object.keys(files).length} / ${requiredDocs.length}`} />
              </div>

              <textarea
                placeholder="Additional notes..."
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                className="mt-6 min-h-[120px] w-full rounded-2xl border border-slate-200 bg-[#faf9f5] p-5 outline-none"
              />
            </section>
          )}

          <div className="mt-10 flex flex-col gap-3 md:flex-row">
            {step > 0 && (
              <button
                onClick={back}
                className="rounded-2xl border border-slate-300 px-6 py-4 font-semibold"
              >
                Back
              </button>
            )}

            {step < steps.length - 1 ? (
              <button
                onClick={next}
                className="flex-1 rounded-2xl bg-[#17395c] px-6 py-4 font-semibold text-white transition hover:opacity-90"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={loading}
                className="flex-1 rounded-2xl bg-emerald-600 px-6 py-4 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
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
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
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
    } catch (err) {
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
    <div className="w-full rounded-3xl bg-[#f5f3ee] p-4 md:max-w-sm">
      <div className="font-semibold text-[#17395c]">Voice notes</div>

      <p className="mt-1 text-xs text-slate-500">
        Record one or more audio notes. Stop manually when finished.
      </p>

      <div className="mt-4 flex gap-2">
        {!recording ? (
          <button
            type="button"
            onClick={startRecording}
            className="flex-1 rounded-2xl bg-[#17395c] px-4 py-3 text-sm font-semibold text-white"
          >
            🎙 Start Recording
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white"
          >
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

                <button
                  type="button"
                  onClick={() => deleteNote(note.id)}
                  className="text-xs font-semibold text-red-600"
                >
                  Delete
                </button>
              </div>

              <audio controls src={note.url} className="w-full" />
            </div>
          ))}

          <button
            type="button"
            onClick={onProcess}
            disabled={processing}
            className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {processing ? "Processing..." : "Transcribe & Auto-fill"}
          </button>
        </div>
      )}
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid gap-5 md:grid-cols-2">{children}</div>;
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
        className="w-full rounded-2xl border border-slate-200 bg-[#faf9f5] px-5 py-4 outline-none transition focus:border-[#17395c]"
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
        className="w-full rounded-2xl border border-slate-200 bg-[#faf9f5] px-5 py-4 outline-none transition focus:border-[#17395c]"
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
