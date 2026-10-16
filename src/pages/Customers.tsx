import { Mail, MapPin, Phone, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { Page } from '@/components/layout';
import { Avatar, CategoryTile, EmptyState, Modal, Panel, Row, SearchInput, StatusTag } from '@/components/ui';
import { date, inrShort } from '@/lib/format';
import { useStore } from '@/store';

export default function Customers() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const customers = useStore((s) => s.customers);
  const orders = useStore((s) => s.orders);
  const machines = useStore((s) => s.machines);
  const [q, setQ] = useState('');
  const focus = params.get('focus');
  const open = customers.find((c) => c.id === focus) ?? null;

  const stats = (id: string) => {
    const mine = orders.filter((o) => o.customerId === id && o.status !== 'Cancelled');
    return {
      count: mine.length,
      value: mine.reduce((a, o) => a + o.total, 0),
      pending: mine.reduce((a, o) => a + (o.advancePaid ? 0 : o.advance) + (o.balancePaid ? 0 : o.total - o.advance), 0),
      open: mine.filter((o) => o.status !== 'Delivered').length,
    };
  };

  const rows = useMemo(() => {
    const n = q.trim().toLowerCase();
    return customers.filter((c) => !n || `${c.name} ${c.company} ${c.city} ${c.phone} ${c.email}`.toLowerCase().includes(n));
  }, [customers, q]);

  const sel = open ? stats(open.id) : null;

  return (
    <Page screen="customers" title="Customers" subtitle={`${customers.length} registered companies`}>
      <div className="mb-4 flex">
        <SearchInput value={q} onChange={setQ} placeholder="Search by name, company, city or phone" />
      </div>
      {rows.length === 0 ? (
        <Panel>
          <EmptyState icon={Users} title="No customers match" />
        </Panel>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {rows.map((c) => {
            const st = stats(c.id);
            return (
              <Panel key={c.id} onClick={() => setParams({ focus: c.id })} className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={c.company} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{c.company}</p>
                    <p className="truncate text-[13px] text-muted">
                      {c.name} · {c.city}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-subtle p-3 text-center">
                  <div>
                    <p className="font-mono text-[15px]">{st.count}</p>
                    <p className="text-[11px] text-muted">Orders</p>
                  </div>
                  <div>
                    <p className="font-mono text-[15px]">{st.open}</p>
                    <p className="text-[11px] text-muted">Open</p>
                  </div>
                  <div>
                    <p className="font-mono text-[15px]">{inrShort(st.value)}</p>
                    <p className="text-[11px] text-muted">Value</p>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      <Modal open={!!open} onClose={() => setParams({})} title={open?.company ?? ''} sub={open ? `Customer since ${date(open.joinedAt)}` : undefined} wide>
        {open && sel && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <ul className="space-y-2 text-[13.5px]">
                <li className="flex items-center gap-2 font-semibold">
                  <Avatar name={open.name} size="sm" /> {open.name}
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="size-4 text-faint" /> {open.phone}
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="size-4 text-faint" /> {open.email}
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-faint" /> {open.address}, {open.city}
                </li>
              </ul>
              <dl className="rounded-xl bg-subtle px-4 py-2">
                <Row label="Lifetime value" mono>{inrShort(sel.value)}</Row>
                <Row label="Payment pending" mono>{inrShort(sel.pending)}</Row>
                <Row label="Open orders" mono>{sel.open}</Row>
              </dl>
            </div>
            <p className="pt-2 text-[13px] font-semibold text-ink-2">Orders</p>
            <ul className="divide-y divide-line overflow-hidden rounded-xl ring-1 ring-line">
              {orders
                .filter((o) => o.customerId === open.id)
                .map((o) => {
                  const m = machines.find((x) => x.id === o.machineId);
                  return (
                    <li key={o.id}>
                      <button type="button" onClick={() => navigate(`/order/${o.id}`)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-subtle">
                        <CategoryTile category={m?.category ?? ''} machineId={m?.id} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13.5px] font-semibold">
                            {o.qty} × {m?.name}
                          </span>
                          <span className="font-mono text-xs text-muted">{o.id}</span>
                        </span>
                        <StatusTag status={o.status} />
                      </button>
                    </li>
                  );
                })}
            </ul>
          </>
        )}
      </Modal>
    </Page>
  );
}
