"use client";

import { useMemo, useState } from "react";

const steps = ["Agent", "Owner", "Property", "Documents", "Review"];

const initialForm = {
  agentName: "",
  agentEmail: "",
  agentPhone: "",
  ownerName: "",
  ownerPhone: "",
  ownerEmail: "",
  ownershipStatus: "",
  propertyTitle: "",
  propertyType: "",
  address: "",
  city: "",
  neighborhood: "",
  gpsLink: "",
  bedrooms: "3",
  bathrooms: "2",
  surfaceSqm: "",
  price: "",
  commission: "",
  notes: "",
};

const requiredDocs = [
  ["titleDeed", "Escritura / Title deed"],
  ["ownerId", "DNI/NIE propietario / Owner ID"],
  ["authorization", "Autorización firmada / Signed authorization"],
  ["photos", "Fotos de la propiedad / Property photos"],
  ["floorplan", "Plano / Floorplan"],
  ["energyCertificate", "Certificado energético / Energy certificate"],
];

export default function Page() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const progress = Math.round(((step + 1) / steps.length) * 100);

  const missingDocs = requiredDocs.filter(([key]) => !files[key]?.length);

  const update = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const validateStep = () => {
    const requiredByStep = {
      0: ["agentName", "agentEmail", "agentPhone"],
      1: ["ownerName", "ownerPhone", "ownerEmail"],
      2: [
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
      ],
    };

    const missing = (requiredByStep[step] || []).filter((k) => !String(form[k] || "").trim());

    if (missing.length) {
      setMessage("Please complete all required fields before continuing.");
      return false;
    }

    if (step === 3 && missingDocs.length) {
      setMessage("All required documents must be uploaded before continuing.");
      return false;
    }

    setMessage("");
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const back = () => {
    setMessage("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async () => {
    setLoading(true);
    setMessage("");

    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      data.append(key, value);
    });

    Object.entries(files).forEach(([key, fileList]) => {
      fileList.forEach((file) => data.append(key, file));
    });

    const res = await fetch("/api/listings", {
      method: "POST",
      body: data,
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(json.error || "Submission failed.");
      return;
    }

    setMessage("Listing submitted successfully. It is now ready for the pipeline.");
  };

  return (
    <main className="min-h-screen bg-[#f5f3ee] px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <header className="rounded-3xl bg-[#17395c] p-6 text-white shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Alta de Propiedad</h1>
              <p className="mt-1 text-sm text-white/75">Property Intake Form</p>
            </div>
            <div className="text-right text-sm text-white/75">
              Step {step + 1} of {steps.length}
            </div>
          </div>

          <div className="mt-5 h-2 rounded-full bg-white/20">
            <div
              className="h-2 rounded-full bg-emerald-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-5 gap-2">
            {steps.map((s, i) => (
              <div
                key={s}
                className={`rounded-full py-2 text-center text-xs ${
                  i === step ? "bg-white text-[#17395c]" : i < step ? "bg-emerald-400 text-[#17395c]" : "bg-white/10"
                }`}
              >
                {s}
              </div>
            ))}
          </div>
        </header>

        {message && (
          <div className="mt-5 rounded-2xl bg-white p-4 text-sm font-medium text-[#17395c] shadow">
            {message}
          </div>
        )}

        <section className="mt-6 rounded-3xl bg-white p-6 shadow">
          {step === 0 && (
            <Step title="1. Agente / Agent">
              <Grid>
                <Input label="Nombre del agente / Agent name *" value={form.agentName} onChange={(v) => update("agentName", v)} />
                <Input label="Email del agente / Agent email *" type="email" value={form.agentEmail} onChange={(v) => update("agentEmail", v)} />
                <Input label="Teléfono / Phone *" value={form.agentPhone} onChange={(v) => update("agentPhone", v)} />
              </Grid>
            </Step>
          )}

          {step === 1 && (
            <Step title="2. Propietario / Owner">
              <Grid>
                <Input label="Nombre propietario / Owner name *" value={form.ownerName} onChange={(v) => update("ownerName", v)} />
                <Input label="Teléfono propietario / Owner phone *" value={form.ownerPhone} onChange={(v) => update("ownerPhone", v)} />
                <Input label="Email propietario / Owner email *" type="email" value={form.ownerEmail} onChange={(v) => update("ownerEmail", v)} />
                <Select
                  label="Ownership status"
                  value={form.ownershipStatus}
                  onChange={(v) => update("ownershipStatus", v)}
                  options={["Single owner", "Multiple owners", "Company owned", "Power of attorney"]}
                />
              </Grid>
            </Step>
          )}

          {step === 2 && (
            <Step title="3. Detalles de la propiedad / Property Details">
              <Grid>
                <Input label="Título / Property title *" value={form.propertyTitle} onChange={(v) => update("propertyTitle", v)} />
                <Select
                  label="Tipo / Type *"
                  value={form.propertyType}
                  onChange={(v) => update("propertyType", v)}
                  options={["Villa", "Apartment", "Penthouse", "Townhouse", "Land", "Commercial"]}
                />
                <Input label="Dirección / Address *" value={form.address} onChange={(v) => update("address", v)} />
                <Input label="Ciudad / City *" value={form.city} onChange={(v) => update("city", v)} />
                <Input label="Zona / Neighborhood *" value={form.neighborhood} onChange={(v) => update("neighborhood", v)} />
                <Input label="GPS / Maps link" value={form.gpsLink} onChange={(v) => update("gpsLink", v)} />
                <Input label="Dormitorios / Bedrooms *" type="number" value={form.bedrooms} onChange={(v) => update("bedrooms", v)} />
                <Input label="Baños / Bathrooms *" type="number" value={form.bathrooms} onChange={(v) => update("bathrooms", v)} />
                <Input label="M² construidos / Built sqm *" type="number" value={form.surfaceSqm} onChange={(v) => update("surfaceSqm", v)} />
                <Input label="Precio / Price € *" type="number" value={form.price} onChange={(v) => update("price", v)} />
                <Input label="Comisión / Commission *" value={form.commission} onChange={(v) => update("commission", v)} />
              </Grid>
            </Step>
          )}

          {step === 3 && (
            <Step title="4. Documentación requerida / Required Documents">
              <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800">
                All documents are mandatory. Missing documents = no pipeline entry.
              </div>

              <div className="space-y-3">
                {requiredDocs.map(([key, label]) => (
                  <label key={key} className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-[#faf9f5] p-4">
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-slate-500">{files[key]?.length ? `${files[key].length} file(s) selected` : "PDF, image or document"}</div>
                    </div>
                    <input
                      type="file"
                      multiple={key === "photos"}
                      className="max-w-[180px] text-xs"
                      onChange={(e) => setFiles((f) => ({ ...f, [key]: Array.from(e.target.files || []) }))}
                    />
                  </label>
                ))}
              </div>
            </Step>
          )}

          {step === 4 && (
            <Step title="5. Review & Submit">
              <Review form={form} missingDocs={missingDocs} />
              <textarea
                className="mt-5 min-h-[100px] w-full rounded-2xl border border-slate-200 bg-[#faf9f5] p-4 outline-none focus:border-[#17395c]"
                placeholder="Notas adicionales / Additional notes"
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </Step>
          )}

          <div className="mt-6 flex gap-3">
            {step > 0 && (
              <button onClick={back} className="flex-1 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-medium">
                Back
              </button>
            )}

            {step < steps.length - 1 ? (
              <button onClick={next} className="flex-1 rounded-2xl bg-[#17395c] px-5 py-3 font-medium text-white">
                Continue
              </button>
            ) : (
              <button onClick={submit} disabled={loading} className="flex-1 rounded-2xl bg-emerald-600 px-5 py-3 font-medium text-white disabled:opacity-50">
                {loading ? "Submitting..." : "Submit to Pipeline"}
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Step({ title, children }) {
  return (
    <div>
      <h2 className="mb-5 text-lg font-semibold text-[#17395c]">{title}</h2>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-[#faf9f5] px-4 py-3 outline-none focus:border-[#17395c]"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-[#faf9f5] px-4 py-3 outline-none focus:border-[#17395c]"
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function Review({ form, missingDocs }) {
  const rows = [
    ["Agent", form.agentName],
    ["Owner", form.ownerName],
    ["Property", form.propertyTitle],
    ["Type", form.propertyType],
    ["Address", `${form.address}, ${form.city}`],
    ["Price", form.price ? `€${Number(form.price).toLocaleString("es-ES")}` : ""],
    ["Documents", missingDocs.length ? `${missingDocs.length} missing` : "All uploaded"],
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-3 border-b border-slate-100 last:border-0">
          <div className="bg-[#faf9f5] p-3 text-sm font-medium text-slate-500">{label}</div>
          <div className="col-span-2 p-3 text-sm font-semibold">{value || "—"}</div>
        </div>
      ))}
    </div>
  );
}
