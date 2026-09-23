import { AlertCircle, Check, Clock3 } from 'lucide-react';
import type { DrugStatus } from '@workspace/api-client-react';

const config: Record<DrugStatus, { label: string; className: string; icon: typeof Check }> = {
  good: { label: 'Within range', className: 'border-primary/25 bg-primary/10 text-primary', icon: Check },
  expiring: { label: 'Expiring soon', className: 'border-accent/50 bg-accent/25 text-foreground', icon: Clock3 },
  expired: { label: 'Expired', className: 'border-destructive/25 bg-destructive/10 text-destructive', icon: AlertCircle },
};

export function StatusBadge({ status }: { status: DrugStatus }) {
  const item = config[status];
  const Icon = item.icon;
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] ${item.className}`} data-testid={`status-badge-${status}`}><Icon size={12} strokeWidth={2.5} />{item.label}</span>;
}