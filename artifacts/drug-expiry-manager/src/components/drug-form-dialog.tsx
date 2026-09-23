import { X, Plus, Save, CalendarDays } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import type { Drug, DrugInput, DrugUpdate } from '@workspace/api-client-react';

type Props = { open: boolean; drug?: Drug | null; pending?: boolean; onClose: () => void; onSubmit: (data: DrugInput | DrugUpdate) => void };

export function DrugFormDialog({ open, drug, pending, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [alternativeNames, setAlternativeNames] = useState('');
  const [brandNames, setBrandNames] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (!open) return;
    setName(drug?.name ?? ''); setAlternativeNames(drug?.alternativeNames?.join(', ') ?? ''); setBrandNames(drug?.brandNames?.join(', ') ?? '');
    setExpiryDate(drug?.expiryDate?.slice(0, 10) ?? ''); setBatchNumber(drug?.batchNumber ?? ''); setNotes(drug?.notes ?? ''); setError('');
  }, [open, drug]);
  if (!open) return null;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !expiryDate) { setError('Name and expiry date are required.'); return; }
    onSubmit({ name: name.trim(), alternativeNames: alternativeNames.split(',').map((x) => x.trim()).filter(Boolean), brandNames: brandNames.split(',').map((x) => x.trim()).filter(Boolean), expiryDate, batchNumber: batchNumber.trim() || undefined, notes: notes.trim() || undefined });
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 p-4 backdrop-blur-sm" role="presentation">
    <div className="w-full max-w-[620px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="drug-dialog-title">
      <div className="flex items-start justify-between border-b border-border px-6 py-5"><div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">{drug ? 'Record revision' : 'New inventory record'}</p><h2 id="drug-dialog-title" className="mt-1 text-xl font-extrabold tracking-tight">{drug ? `Edit ${drug.name}` : 'Add a medicine'}</h2></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" data-testid="button-close-drug-dialog"><X size={18} /></button></div>
      <form onSubmit={submit} className="space-y-5 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="sm:col-span-2"><span className="field-label">Medicine name <b>*</b></span><input autoFocus value={name} onChange={(e) => setName(e.target.value)} className="field-input" placeholder="e.g. Amoxicillin 500mg" data-testid="input-drug-name" /></label>
          <label><span className="field-label">Brand names</span><input value={brandNames} onChange={(e) => setBrandNames(e.target.value)} className="field-input" placeholder="Comma separated" data-testid="input-brand-names" /></label>
          <label><span className="field-label">Alternative names</span><input value={alternativeNames} onChange={(e) => setAlternativeNames(e.target.value)} className="field-input" placeholder="Comma separated" data-testid="input-alternative-names" /></label>
          <label><span className="field-label">Expiry date <b>*</b></span><span className="relative block"><CalendarDays size={16} className="pointer-events-none absolute left-3 top-3 text-muted-foreground" /><input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="field-input pl-10" data-testid="input-expiry-date" /></span></label>
          <label><span className="field-label">Batch number</span><input value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} className="field-input font-mono" placeholder="Optional batch ID" data-testid="input-batch-number" /></label>
        </div>
        <label><span className="field-label">Notes</span><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="field-input min-h-[84px] resize-y" placeholder="Storage or handling notes for the team" data-testid="input-drug-notes" /></label>
        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert" data-testid="status-form-error">{error}</p>}
        <div className="flex justify-end gap-3 border-t border-border pt-5"><button type="button" onClick={onClose} className="button-quiet" data-testid="button-cancel-drug">Cancel</button><button type="submit" disabled={pending} className="button-primary">{drug ? <Save size={16} /> : <Plus size={16} />}{pending ? 'Saving…' : drug ? 'Save changes' : 'Add record'}</button></div>
      </form>
    </div>
  </div>;
}