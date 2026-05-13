'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, FileCheck, Home, Upload, User } from 'lucide-react';

const requiredFields = [
  'agentName',
  'agentEmail',
  'agentPhone',
  'propertyTitle',
  'propertyType',
  'address',
  'city',
  'neighborhood',
  'bedrooms',
  'bathrooms',
  'surfaceSqm',
  'price',
  'commission',
  'ownerName',
  'ownerPhone',
  'ownerEmail'
];

const requiredDocs = [
  { key: 'titleDeed', label: 'Title deed' },
  { key: 'ownerId', label: 'Owner ID / Passport' },
  { key: 'authorization', label: 'Signed authorization form' },
  { key: 'photos', label: 'Property photos', multiple: true },
  { key: 'floorplan', label: 'Floorplan' },
  { key: 'energyCertificate', label: 'Energy certificate' }
];

const initialForm = {
  agentName: '',
  agentEmail: '',
  agentPhone: '',
  propertyTitle: '',
  propertyType: '',
  address: '',
  city: '',
  neighborhood: '',
  gpsLink: '',
  bedrooms: '',
  bathrooms: '',
  surfaceSqm: '',
  price: '',
  commission: '',
  ownerName: '',
  ownerPhone: '',
  ownerEmail: '',
  ownershipStatus: '',
  notes: ''
};

export default function Page() {
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const missingFields = useMemo(
    () => requiredFields.filter((field) => !String(form[field] || '').trim()),
    [form]
  );

  const missingDocs = useMemo(
    () => requiredDocs.filter((doc) => !files[doc.key] || files[doc.key].length === 0),
    [files]
  );

  const isComplete = missingFields.length === 0 && missingDocs.length === 0;

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateFile(key, fileList) {
    setFiles((current) => ({ ...current, [key]: Array.from(fileList || []) }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setMessage(null);

    if (!isComplete) {
      setMessage({ type: 'error', text: 'Incomplete listing. Please add every required field and document.' });
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));

      requiredDocs.forEach((doc) => {
        (files[doc.key] || []).forEach((file) => payload.append(doc.key, file));
      });

      const response = await fetch('/api/listings', {
        method: 'POST',
        body: payload
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Submission failed.');
      }

      setMessage({ type: 'success', text: `Listing submitted. Status: ${result.status}` });
      setForm(initialForm);
      setFiles({});
      setSubmitted(false);
      event.currentTarget.reset();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-slate-900 p-3 text-white shadow-sm">
            <Home className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Property Intake Form</h1>
            <p className="mt-1 text-slate-600">Agents must submit all required information and documents.</p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Section title="Agent Information" icon={<User className="h-5 w-5" />}>
              <Input label="Agent name" value={form.agentName} onChange={(v) => updateField('agentName', v)} required />
              <Input label="Agent email" type="email" value={form.agentEmail} onChange={(v) => updateField('agentEmail', v)} required />
              <Input label="Agent phone" value={form.agentPhone} onChange={(v) => updateField('agentPhone', v)} required />
            </Section>

            <Section title="Property Information" icon={<Home className="h-5 w-5" />}>
              <Input label="Property title" value={form.propertyTitle} onChange={(v) => updateField('propertyTitle', v)} required />
              <Select label="Property type" value={form.propertyType} onChange={(v) => updateField('propertyType', v)} required options={['Apartment', 'Villa', 'Townhouse', 'Land', 'Commercial', 'Other']} />
              <Input label="Address" value={form.address} onChange={(v) => updateField('address', v)} required />
              <Input label="City" value={form.city} onChange={(v) => updateField('city', v)} required />
              <Input label="Neighborhood" value={form.neighborhood} onChange={(v) => updateField('neighborhood', v)} required />
              <Input label="Google Maps / GPS link" value={form.gpsLink} onChange={(v) => updateField('gpsLink', v)} />
              <Input label="Bedrooms" type="number" value={form.bedrooms} onChange={(v) => updateField('bedrooms', v)} required />
              <Input label="Bathrooms" type="number" value={form.bathrooms} onChange={(v) => updateField('bathrooms', v)} required />
              <Input label="Surface area sqm" type="number" value={form.surfaceSqm} onChange={(v) => updateField('surfaceSqm', v)} required />
              <Input label="Asking price" type="number" value={form.price} onChange={(v) => updateField('price', v)} required />
              <Input label="Commission" value={form.commission} onChange={(v) => updateField('commission', v)} required />
            </Section>

            <Section title="Owner Information" icon={<User className="h-5 w-5" />}>
              <Input label="Owner full name" value={form.ownerName} onChange={(v) => updateField('ownerName', v)} required />
              <Input label="Owner phone" value={form.ownerPhone} onChange={(v) => updateField('ownerPhone', v)} required />
              <Input label="Owner email" type="email" value={form.ownerEmail} onChange={(v) => updateField('ownerEmail', v)} required />
              <Select label="Ownership status" value={form.ownershipStatus} onChange={(v) => updateField('ownershipStatus', v)} options={['Single owner', 'Multiple owners', 'Company owned', 'Power of attorney', 'Other']} />
            </Section>

            <Section title="Required Documentation" icon={<FileCheck className="h-5 w-5" />}>
              {requiredDocs.map((doc) => (
                <FileInput key={doc.key} label={doc.label} onChange={(fileList) => updateFile(doc.key, fileList)} required multiple={doc.multiple} />
              ))}
            </Section>

            <Card>
              <label className="text-sm font-medium text-slate-700">Internal notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                placeholder="Anything the listing manager should know..."
              />
            </Card>

            {message && <Alert type={message.type}>{message.text}</Alert>}

            <button disabled={loading} type="submit" className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Listing'}
            </button>
          </form>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <Card>
              <h2 className="text-lg font-semibold text-slate-900">Submission Status</h2>
              <div className="mt-4 rounded-2xl bg-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Current status</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${isComplete ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {isComplete ? 'READY' : 'INCOMPLETE'}
                  </span>
                </div>
              </div>
              <ChecklistBlock title="Missing fields" items={missingFields.map(fieldLabel)} emptyText="All required fields added." showErrors={submitted} />
              <ChecklistBlock title="Missing documents" items={missingDocs.map((doc) => doc.label)} emptyText="All required documents uploaded." showErrors={submitted} />
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Section({ title, icon, children }) {
  return (
    <Card>
      <div className="mb-5 flex items-center gap-2 text-slate-900">
        {icon}
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </Card>
  );
}

function Card({ children }) {
  return <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">{children}</div>;
}

function Input({ label, value, onChange, type = 'text', required = false }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}{required ? ' *' : ''}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400" required={required} />
    </label>
  );
}

function Select({ label, value, onChange, options, required = false }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}{required ? ' *' : ''}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400" required={required}>
        <option value="">Select...</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function FileInput({ label, onChange, required = false, multiple = false }) {
  return (
    <label className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 transition hover:bg-slate-100">
      <div className="flex items-start gap-3">
        <Upload className="mt-0.5 h-5 w-5 text-slate-500" />
        <div>
          <span className="text-sm font-medium text-slate-700">{label}{required ? ' *' : ''}</span>
          <p className="mt-1 text-xs text-slate-500">Upload PDF, JPG, PNG, or document files.</p>
        </div>
      </div>
      <input type="file" multiple={multiple} onChange={(e) => onChange(e.target.files)} className="mt-3 w-full text-sm text-slate-600" required={required} />
    </label>
  );
}

function Alert({ type, children }) {
  return (
    <div className={`rounded-2xl p-4 text-sm ${type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
      <div className="flex items-center gap-2">
        {type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
        <span>{children}</span>
      </div>
    </div>
  );
}

function ChecklistBlock({ title, items, emptyText, showErrors }) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="mt-2 space-y-2">
        {items.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-green-700"><CheckCircle2 className="h-4 w-4" />{emptyText}</div>
        ) : showErrors ? (
          items.map((item) => <div key={item} className="flex items-center gap-2 text-sm text-red-700"><AlertCircle className="h-4 w-4" />{item}</div>)
        ) : (
          <p className="text-sm text-slate-500">Submit to check completeness.</p>
        )}
      </div>
    </div>
  );
}

function fieldLabel(field) {
  const labels = {
    agentName: 'Agent name', agentEmail: 'Agent email', agentPhone: 'Agent phone', propertyTitle: 'Property title', propertyType: 'Property type', address: 'Address', city: 'City', neighborhood: 'Neighborhood', bedrooms: 'Bedrooms', bathrooms: 'Bathrooms', surfaceSqm: 'Surface area sqm', price: 'Asking price', commission: 'Commission', ownerName: 'Owner full name', ownerPhone: 'Owner phone', ownerEmail: 'Owner email'
  };
  return labels[field] || field;
}
