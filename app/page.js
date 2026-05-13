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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const progress = ((step + 1) / steps.length) * 100;

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const applyTranscript = (text) => {
    const extracted = extractPropertyInfo(text);

    setForm((f) => ({
      ...f,
      voiceTranscript: text,
      propertyType: extracted.propertyType || f.propertyType,
      operation: extracted.operation || f.operation,
      city: extracted.city || f.city,
      neighborhood: extracted.neighborhood || f.neighborhood,
      address: extracted.address || f.address,
      bedrooms: extracted.bedrooms || f.bedrooms,
      bathrooms: extracted.bathrooms || f.bathrooms,
      surfaceSqm: extracted.surfaceSqm || f.surfaceSqm,
      plotSqm: extracted.plotSqm || f.plotSqm,
      terraceSqm: extracted.terraceSqm || f.terraceSqm,
      price: extracted.price || f.price,
      description: text || f.description,
    }));

    setMessage("Voice note processed. Please review the auto-filled fields.");
  };

  const validateAndGo = (targetStep) => {
    setMessage("");

    if (targetStep < step) {
      setStep(targetStep);
      return;
    }

    if (step === 0 && !form.agentEmail) {
      setMessage("Please select an agent.");
      return;
    }

    if (step === 1 && (!form.ownerName || !form.ownerPhone || !form.ownerEmail)) {
      setMessage("Please complete owner information.");
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
                Select Agent
              </h2>

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
                  <h2 className="text-2xl font-bold text-[#17395c]">
                    Property Details
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Fill manually or use voice note to auto-fill fields.
                  </p>
                </div>

                <VoiceBox
                  transcript={form.voiceTranscript}
                  onTranscript={applyTranscript}
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

                <Input label="Built sqm" type="number" value={form.surfaceSqm} onChange={(v) => update("surfaceSqm", v)} />

                <Input label="Plot sqm" type="number" value={form.plotSqm} onChange={(v) => update("plotSqm", v)} />

                <Input label="Terrace sqm" type="number" value={form.terraceSqm} onChange={(v) => update("terraceSqm", v)} />

                <Input label="Price €" type="number" value={form.price} onChange={(v) => update("price", v)} />

                <Input label="Commission" value={form.commission} onChange={(v) => update("commission", v)} />
              </Grid>

              <label className="mt-5 block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Description / Voice transcript
                </span>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-[#faf9f5] px-5 py-4 outline-none transition focus:border-[#17395c]"
                  placeholder="Speak or write the property description here..."
                />
              </label>
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
                <ReviewRow label="Agent" value={form.agentName} />
                <ReviewRow label="Owner" value={form.ownerName} />
                <ReviewRow label="Property" value={form.propertyTitle} />
                <ReviewRow label="Type" value={form.propertyType} />
                <ReviewRow label="Operation" value={form.operation} />
                <ReviewRow label="Address" value={`${form.address}, ${form.city}`} />
                <ReviewRow label="Price" value={form.price ? `€ ${form.price}` : ""} />
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

function VoiceBox({ transcript, onTranscript }) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [localTranscript, setLocalTranscript] = useState(transcript || "");
  const [fallback, setFallback] = useState(false);

  const startVoice = () => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      setFallback(true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-GB";
    recognition.interimResults = true;
    recognition.continuous = true;

    let finalText = localTranscript ? localTranscript + " " : "";

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalText += text + " ";
        } else {
          interimText += text;
        }
      }

      setLocalTranscript((finalText + interimText).trim());
    };

    recognition.onerror = () => {
      setListening(false);
      setFallback(true);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const stopVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setListening(false);
    onTranscript(localTranscript);
  };

  return (
    <div className="w-full rounded-3xl bg-[#f5f3ee] p-4 md:max-w-sm">
      <div className="font-semibold text-[#17395c]">Voice note</div>

      <p className="mt-1 text-xs text-slate-500">
        Works on Chrome/Android. On iPhone, use the manual box or keyboard microphone.
      </p>

      <div className="mt-4 flex gap-2">
        {!listening ? (
          <button
            type="button"
            onClick={startVoice}
            className="flex-1 rounded-2xl bg-[#17395c] px-4 py-3 text-sm font-semibold text-white"
          >
            🎙 Start
          </button>
        ) : (
          <button
            type="button"
            onClick={stopVoice}
            className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white"
          >
            Stop & Fill
          </button>
        )}

        <button
          type="button"
          onClick={() => onTranscript(localTranscript)}
          className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold"
        >
          Fill
        </button>
      </div>

      {(fallback || localTranscript) && (
        <textarea
          value={localTranscript}
          onChange={(e) => setLocalTranscript(e.target.value)}
          className="mt-4 min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none"
          placeholder="Speak using your phone keyboard microphone or paste the transcript here..."
        />
      )}
    </div>
  );
}

function extractPropertyInfo(text) {
  const t = text.toLowerCase();

  const result = {};

  if (t.includes("villa")) result.propertyType = "Villa";
  else if (t.includes("apartment") || t.includes("apartamento")) result.propertyType = "Apartment";
  else if (t.includes("penthouse") || t.includes("ático")) result.propertyType = "Penthouse";
  else if (t.includes("townhouse") || t.includes("adosado")) result.propertyType = "Townhouse";
  else if (t.includes("plot") || t.includes("solar")) result.propertyType = "Plot";
  else if (t.includes("commercial") || t.includes("local")) result.propertyType = "Commercial";

  if (t.includes("sale") || t.includes("venta")) result.operation = "Sale";
  if (t.includes("rental") || t.includes("rent") || t.includes("alquiler")) result.operation = "Rental";

  const priceMatch = text.match(/(?:€|eur|euros?)\s?([\d.,]+)/i) || text.match(/([\d.,]+)\s?(?:€|eur|euros?)/i);
  if (priceMatch) result.price = normalizeNumber(priceMatch[1]);

  const bedsMatch = text.match(/(\d+)\s?(?:bedrooms?|beds?|dormitorios?|habitaciones?)/i);
  if (bedsMatch) result.bedrooms = bedsMatch[1];

  const bathsMatch = text.match(/(\d+)\s?(?:bathrooms?|baths?|baños?)/i);
  if (bathsMatch) result.bathrooms = bathsMatch[1];

  const builtMatch = text.match(/(\d+)\s?(?:m2|m²|sqm|square meters?|metros construidos|built)/i);
  if (builtMatch) result.surfaceSqm = builtMatch[1];

  const plotMatch = text.match(/(\d+)\s?(?:m2|m²|sqm|square meters?|metros)\s?(?:plot|parcela)/i);
  if (plotMatch) result.plotSqm = plotMatch[1];

  const terraceMatch = text.match(/(\d+)\s?(?:m2|m²|sqm|square meters?|metros)\s?(?:terrace|terraza)/i);
  if (terraceMatch) result.terraceSqm = terraceMatch[1];

  const cities = ["Marbella", "Estepona", "Benahavis", "Benahavís", "Sotogrande", "Malaga", "Málaga", "Nueva Andalucia", "Nueva Andalucía"];
  const foundCity = cities.find((city) => t.includes(city.toLowerCase()));
  if (foundCity) result.city = foundCity;

  const neighborhoods = ["Golden Mile", "Puente Romano", "Sierra Blanca", "Nueva Andalucía", "Puerto Banús", "La Zagaleta", "Elviria", "Los Monteros"];
  const foundNeighborhood = neighborhoods.find((n) => t.includes(n.toLowerCase()));
  if (foundNeighborhood) result.neighborhood = foundNeighborhood;

  return result;
}

function normalizeNumber(value) {
  return value.replace(/[^\d]/g, "");
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
