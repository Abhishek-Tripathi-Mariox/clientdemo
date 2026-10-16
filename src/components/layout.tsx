import { ArrowRight, Bell, ChevronDown, ChevronRight, ClipboardList, Command, LogOut, Package, Search, ShieldOff, Users } from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';

import { BRAND } from '@/brand';
import { Avatar, CategoryTile, cx, EmptyState, Panel } from '@/components/ui';
import { canAccess, NAV, ROLE_LABEL } from '@/lib/roles';
import { timeAgo } from '@/lib/format';
import { useStaffUser, useStore } from '@/store';

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cx('size-8', className)} aria-hidden>
      <rect width="64" height="64" rx="16" fill="var(--color-brand)" />
      <path d="M19 20v24M35 20L20 34M25 29l11 15" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="46" cy="42" r="5" fill="var(--color-coral)" />
    </svg>
  );
}

function useOutside(ref: React.RefObject<HTMLElement | null>, onOut: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && onOut();
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ref, onOut, active]);
}

function NotificationsMenu() {
  const me = useStaffUser()!;
  const navigate = useNavigate();
  const all = useStore((s) => s.notifications);
  const items = useMemo(() => all.filter((n) => n.audience === me.role && (!n.userId || n.userId === me.id)), [all, me]);
  const unread = items.filter((n) => !n.read).length;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, () => setOpen(false), open);

  return (
    <div ref={ref} className="relative">
      <button type="button" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} aria-expanded={open} onClick={() => setOpen((v) => !v)} className="relative grid size-9 place-items-center rounded-xl text-ink-2 transition hover:bg-slate-50">
        <Bell className="size-[18px]" />
        {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-white ring-2 ring-surface">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-40 w-[360px] max-w-[calc(100vw-2rem)] animate-pop overflow-hidden rounded-2xl bg-surface shadow-pop ring-1 ring-line">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-bold">Notifications</p>
            {unread > 0 && (
              <button type="button" className="text-xs font-semibold text-brand hover:underline" onClick={() => useStore.getState().markNotificationsRead(me.role, me.id)}>
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {items.slice(0, 6).map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (n.link) navigate(n.link);
                }}
                className="flex w-full gap-3 border-b border-line px-4 py-3 text-left last:border-0 hover:bg-subtle">
                <span className={cx('mt-1.5 size-2 shrink-0 rounded-full', n.read ? 'bg-line-strong' : 'bg-coral')} />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold">{n.title}</span>
                  <span className="line-clamp-2 block text-xs text-muted">{n.body}</span>
                  <span className="mt-0.5 block text-[11px] text-faint">{timeAgo(n.at)}</span>
                </span>
              </button>
            ))}
            {items.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted">No notifications yet.</p>}
          </div>
          <Link to="/notifications" onClick={() => setOpen(false)} className="flex items-center justify-center gap-1 border-t border-line py-2.5 text-[13px] font-semibold text-brand hover:bg-subtle">
            View all <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const me = useStaffUser()!;
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, () => setOpen(false), open);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-expanded={open} aria-label="Account menu" onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition hover:bg-slate-50">
        <Avatar name={me.name} size="sm" />
        <span className="hidden text-left leading-tight md:block">
          <span className="block text-[13px] font-semibold">{me.name}</span>
          <span className="block text-[11px] text-muted">{ROLE_LABEL[me.role]}</span>
        </span>
        <ChevronDown className="hidden size-4 text-faint md:block" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-40 w-64 animate-pop rounded-2xl bg-surface p-2 shadow-pop ring-1 ring-line">
          <div className="px-3 py-2.5">
            <p className="font-semibold">{me.name}</p>
            <p className="text-xs text-muted">{me.email}</p>
            <p className="mt-2 inline-block rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">{ROLE_LABEL[me.role]}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          <button
            type="button"
            onClick={() => {
              useStore.getState().logoutStaff();
              navigate('/login', { replace: true });
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold text-red hover:bg-red-50">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/** ⌘K quick search across pages, orders, customers and machines. */
function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const me = useStaffUser()!;
  const navigate = useNavigate();
  const orders = useStore((s) => s.orders);
  const customers = useStore((s) => s.customers);
  const machines = useStore((s) => s.machines);
  const deliveries = useStore((s) => s.deliveries);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);

  const results = useMemo(() => {
    const n = q.trim().toLowerCase();
    const has = (t: string) => !n || t.toLowerCase().includes(n);
    type Item = { key: string; group: string; title: string; sub: string; to: string; icon: ReactNode };
    const out: Item[] = [];
    for (const p of NAV[me.role]) if (has(p.label)) out.push({ key: `p-${p.to}`, group: 'Pages', title: p.label, sub: 'Go to page', to: p.to, icon: <p.icon className="size-4" /> });
    if (n) {
      if (canAccess(me.role, 'order'))
        for (const o of orders) {
          const c = customers.find((x) => x.id === o.customerId);
          if (has(`${o.id} ${c?.company} ${c?.name}`)) out.push({ key: o.id, group: 'Orders', title: `${o.id} · ${c?.company}`, sub: o.status, to: `/order/${o.id}`, icon: <ClipboardList className="size-4" /> });
        }
      if (me.role === 'delivery')
        for (const d of deliveries.filter((x) => x.assignedTo === me.id))
          if (has(`${d.id} ${d.orderId}`)) out.push({ key: d.id, group: 'Deliveries', title: d.id, sub: d.status, to: `/delivery/${d.id}`, icon: <Package className="size-4" /> });
      if (canAccess(me.role, 'customers'))
        for (const c of customers) if (has(`${c.company} ${c.name} ${c.city}`)) out.push({ key: c.id, group: 'Customers', title: c.company, sub: `${c.name} · ${c.city}`, to: `/customers?focus=${c.id}`, icon: <Users className="size-4" /> });
      if (canAccess(me.role, 'machinery'))
        for (const m of machines) if (has(`${m.name} ${m.id} ${m.brand}`)) out.push({ key: m.id, group: 'Machinery', title: m.name, sub: m.category, to: `/machinery?focus=${m.id}`, icon: <CategoryTile category={m.category} machineId={m.id} size="sm" /> });
    }
    return out.slice(0, 12);
  }, [q, me, orders, customers, machines, deliveries]);

  useEffect(() => {
    if (open) {
      setQ('');
      setSel(0);
    }
  }, [open]);
  useEffect(() => setSel(0), [q]);
  if (!open) return null;

  const go = (to: string) => {
    onClose();
    navigate(to);
  };

  let lastGroup = '';
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-xl animate-pop overflow-hidden rounded-2xl bg-surface shadow-pop ring-1 ring-line">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-5 text-faint" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'ArrowDown') setSel((s) => Math.min(s + 1, results.length - 1));
              if (e.key === 'ArrowUp') setSel((s) => Math.max(s - 1, 0));
              if (e.key === 'Enter' && results[sel]) go(results[sel].to);
            }}
            placeholder="Search orders, customers, machines or pages…"
            aria-label="Search"
            className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-faint"
          />
          <kbd className="rounded-md bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] text-muted ring-1 ring-line">Esc</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && <p className="px-3 py-8 text-center text-sm text-muted">No results for “{q}”.</p>}
          {results.map((r, i) => {
            const header = r.group !== lastGroup;
            lastGroup = r.group;
            return (
              <div key={r.key}>
                {header && <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">{r.group}</p>}
                <button type="button" onMouseEnter={() => setSel(i)} onClick={() => go(r.to)} className={cx('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left', i === sel && 'bg-brand-50')}>
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-slate-50 text-ink-2">{r.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-semibold">{r.title}</span>
                    <span className="block truncate text-xs text-muted">{r.sub}</span>
                  </span>
                  {i === sel && <ArrowRight className="size-4 text-brand" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Top navigation shell; on small screens the nav becomes a scrollable strip under the header. */
export function AppShell() {
  const me = useStaffUser()!;
  const { pathname } = useLocation();
  const [palette, setPalette] = useState(false);
  const pending = useStore((s) => s.orders.filter((o) => o.status === 'Requested').length);

  useEffect(() => window.scrollTo(0, 0), [pathname]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette((v) => !v);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const links = NAV[me.role].filter((n) => n.screen !== 'notifications');

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-md">
        <div className="flex h-14 w-full items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <BrandMark />
            <span className="hidden text-[17px] font-extrabold tracking-tight sm:block">{BRAND.name}</span>
          </Link>
          <nav className="hidden flex-1 items-center gap-0.5 xl:flex" aria-label="Main">
            {links.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) => cx('flex h-9 items-center gap-2 whitespace-nowrap rounded-xl px-3 text-[13px] font-semibold transition', isActive ? 'bg-brand-50 text-brand-700' : 'text-muted hover:bg-slate-50 hover:text-ink')}>
                {n.label}
                {n.screen === 'requests' && pending > 0 && <span className="rounded-md bg-coral px-1.5 text-[10px] font-bold text-white">{pending}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <button type="button" onClick={() => setPalette(true)} className="hidden h-9 items-center gap-2 rounded-xl bg-slate-50 pl-3 pr-2 text-[13px] text-muted ring-1 ring-inset ring-line transition hover:text-ink md:flex">
              <Search className="size-4" />
              Search
              <kbd className="ml-4 flex items-center gap-0.5 rounded-md bg-surface px-1.5 py-0.5 font-mono text-[11px] ring-1 ring-line">
                <Command className="size-3" />K
              </kbd>
            </button>
            <button type="button" aria-label="Search" onClick={() => setPalette(true)} className="grid size-9 place-items-center rounded-xl text-ink-2 hover:bg-slate-50 md:hidden">
              <Search className="size-[18px]" />
            </button>
            <NotificationsMenu />
            <UserMenu />
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2 scrollbar-none sm:px-5 xl:hidden" aria-label="Main">
          {links.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) => cx('flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold transition', isActive ? 'bg-ink text-white' : 'text-muted hover:bg-slate-50')}>
              <n.icon className="size-3.5" />
              {n.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="w-full px-4 pb-4 pt-4 sm:px-6 lg:px-8 lg:pt-5">
        <Outlet />
      </main>
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </div>
  );
}

/** Page frame: breadcrumb, title, actions and a role check. */
export function Page({ screen, title, subtitle, actions, crumbs, children }: { screen: string; title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; crumbs?: { label: string; to?: string }[]; children: ReactNode }) {
  const me = useStaffUser();
  const allowed = !!me && canAccess(me.role, screen);
  return (
    <div className="animate-rise">
      {crumbs && (
        <nav aria-label="Breadcrumb" className="mb-1 flex items-center gap-1 text-[13px] text-muted">
          {crumbs.map((c, i) => (
            <span key={c.label} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="size-3.5 text-faint" />}
              {c.to ? (
                <Link to={c.to} className="font-medium hover:text-brand">
                  {c.label}
                </Link>
              ) : (
                <span className="font-semibold text-ink">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[22px] font-extrabold leading-tight tracking-tight sm:text-2xl">{title}</h1>
          {subtitle && <div className="mt-0.5 text-[13px] text-muted">{subtitle}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {allowed ? (
        children
      ) : (
        <Panel>
          <EmptyState icon={ShieldOff} title="No access" body="Your role does not have permission to view this section." />
        </Panel>
      )}
    </div>
  );
}

export function Stat({ label, value, icon: Icon, tone = 'brand', foot, onClick }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; tone?: 'brand' | 'coral' | 'blue' | 'violet' | 'amber' | 'green'; foot?: ReactNode; onClick?: () => void }) {
  const tint = { brand: 'bg-brand-50 text-brand', coral: 'bg-coral-50 text-coral', blue: 'bg-blue-50 text-blue', violet: 'bg-violet-50 text-violet', amber: 'bg-amber-50 text-amber', green: 'bg-green-50 text-green' }[tone];
  return (
    <Panel onClick={onClick} className="px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[12.5px] font-semibold text-muted">{label}</span>
        <span className={cx('grid size-7 shrink-0 place-items-center rounded-lg', tint)}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-1.5 font-mono text-[24px] font-medium leading-none tracking-tight">{value}</p>
      {foot && <div className="mt-1 truncate text-xs text-muted">{foot}</div>}
    </Panel>
  );
}

export type Column<T> = { key: string; label: string; className?: string; render: (row: T) => ReactNode; hideOnMobile?: boolean };

/** Table on md+, stacked list rows on phones. */
export function DataTable<T>({ rows, columns, rowKey, onRowClick, empty }: { rows: T[]; columns: Column<T>[]; rowKey: (r: T) => string; onRowClick?: (r: T) => void; empty?: ReactNode }) {
  if (rows.length === 0) return <Panel>{empty ?? <p className="p-6 text-sm text-muted">Nothing here yet.</p>}</Panel>;
  const visible = columns.filter((c) => !c.hideOnMobile);
  const [first, ...rest] = visible;
  return (
    <Panel className="overflow-hidden">
      <ul className="divide-y divide-line md:hidden">
        {rows.map((r) => (
          <li key={rowKey(r)}>
            <div
              role={onRowClick ? 'button' : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
              onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(r) : undefined}
              className={cx('block px-4 py-3', onRowClick && 'cursor-pointer active:bg-subtle')}>
              <div className="mb-2">{first!.render(r)}</div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px]">
                {rest.map((c) => (
                  <span key={c.key} className="flex items-center gap-1.5">
                    <span className="text-faint">{c.label}</span>
                    {c.render(r)}
                  </span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
      {/* Scrolls sideways inside the card when the table is wider than its container. */}
      <div className="hidden overflow-x-auto md:block">
      <table className="w-full text-left text-[13.5px]">
        <thead>
          <tr className="border-b border-line">
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cx('px-4 py-2.5 text-xs font-semibold text-muted first:pl-5 last:pr-5', c.className)}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr key={rowKey(r)} onClick={onRowClick ? () => onRowClick(r) : undefined} className={cx(onRowClick && 'cursor-pointer transition-colors hover:bg-subtle')}>
              {columns.map((c) => (
                <td key={c.key} className={cx('px-4 py-2.5 align-middle first:pl-5 last:pr-5', c.className)}>
                  {c.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </Panel>
  );
}

