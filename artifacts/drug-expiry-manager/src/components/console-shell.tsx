import { Activity, ArrowUpRight, Boxes, ChevronRight, CircleHelp, LayoutDashboard, Menu, PackageSearch, PlugZap, ShieldCheck, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useState, type ReactNode } from 'react';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/drugs', label: 'Drug records', icon: Boxes },
  { href: '/extension', label: 'LavaBMS bridge', icon: PlugZap },
];

export function ConsoleShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col bg-sidebar px-4 py-5 text-sidebar-foreground transition-transform duration-300 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-3">
          <Link href="/" className="flex items-center gap-3" data-testid="link-brand">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"><ShieldCheck size={19} strokeWidth={2.5} /></span>
            <span><span className="block text-[13px] font-extrabold tracking-[0.18em]">LAVABMS</span><span className="block font-mono text-[9px] uppercase tracking-[0.2em] text-sidebar-foreground/55">expiry console</span></span>
          </Link>
          <button type="button" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent md:hidden" data-testid="button-close-menu"><X size={17} /></button>
        </div>
        <div className="mx-3 mt-9 mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/45">Workspace</div>
        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = location === href;
            return <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold transition-colors ${active ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_8px_24px_rgba(0,0,0,.16)]' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'}`} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}>
              <Icon size={17} strokeWidth={active ? 2.4 : 1.8} /><span>{label}</span>{active && <ChevronRight className="ml-auto" size={15} />}
            </Link>;
          })}
        </nav>
        <div className="mt-auto space-y-3">
          <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-4">
            <div className="mb-3 flex items-center gap-2"><Activity size={14} className="text-sidebar-primary" /><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-sidebar-foreground/60">System pulse</span></div>
            <p className="text-[12px] leading-5 text-sidebar-foreground/75">Expiry warnings are ready to travel with every sale.</p>
            <Link href="/extension" className="mt-3 flex items-center gap-1 text-[11px] font-bold text-sidebar-primary" data-testid="link-system-pulse">Connection details <ArrowUpRight size={13} /></Link>
          </div>
          <div className="flex items-center gap-2 px-3 text-[11px] text-sidebar-foreground/40"><CircleHelp size={14} /> <span>Safety-first inventory ops</span></div>
        </div>
      </aside>
      {mobileOpen && <button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm md:hidden" data-testid="button-dismiss-menu" />}
      <main className="min-h-[100dvh] md:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border/80 bg-background/90 px-5 backdrop-blur-md md:px-10">
          <button type="button" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary md:hidden" data-testid="button-open-menu"><Menu size={20} /></button>
          <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:flex"><PackageSearch size={14} className="text-primary" /> Inventory control / <span className="text-foreground">expiry watch</span></div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> live workspace</div>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-accent text-[11px] font-extrabold text-accent-foreground">PA</div>
          </div>
        </header>
        <div className="mx-auto max-w-[1440px] px-5 py-7 md:px-10 md:py-10">{children}</div>
      </main>
    </div>
  );
}