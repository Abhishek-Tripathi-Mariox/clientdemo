import { Camera, Check, CircleCheck, Flag, IndianRupee, KeyRound, Navigation, PackageX, PenLine, Phone, Truck, Warehouse } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { BRAND } from '@/brand';
import { Page } from '@/components/layout';
import { ActivityFeed } from '@/components/timeline';
import { toast } from '@/components/toast';
import { Avatar, Button, CategoryTile, cx, EmptyState, Field, Modal, Panel, PanelHead, Row, StatusTag, Tag } from '@/components/ui';
import { date, dateTime, inr } from '@/lib/format';
import { useStaffUser, useStore } from '@/store';

const PROOFS = [
  { key: 'Signature captured', icon: PenLine, sub: 'Receiver signs on the device' },
  { key: 'Photo proof uploaded', icon: Camera, sub: 'Photo of the machine at site' },
  { key: 'OTP verified', icon: KeyRound, sub: 'Code sent to the customer' },
] as const;
const STEPS = ['Assigned', 'In transit', 'Delivered'] as const;

export default function DeliveryDetail() {
  const { id } = useParams();
  const me = useStaffUser()!;
  const d = useStore((s) => s.deliveries.find((x) => x.id === id));
  const o = useStore((s) => s.orders.find((x) => x.id === d?.orderId));
  const c = useStore((s) => s.customers.find((x) => x.id === o?.customerId));
  const m = useStore((s) => s.machines.find((x) => x.id === o?.machineId));
  const driver = useStore((s) => s.staff.find((x) => x.id === d?.assignedTo));
  const [completing, setCompleting] = useState(false);
  const [receivedBy, setReceivedBy] = useState('');
  const [proof, setProof] = useState<(typeof PROOFS)[number]['key']>('Signature captured');
  const [busy, setBusy] = useState(false);

  // Delivery executives only see their own assignments.
  if (!d || !o || !c || !m || (me.role === 'delivery' && d.assignedTo !== me.id))
    return (
      <Page screen="delivery" title="Delivery not found" crumbs={[{ label: 'Deliveries', to: '/' }, { label: id ?? '' }]}>
        <Panel>
          <EmptyState icon={PackageX} title="This delivery is not available" body="It may have been reassigned to someone else." />
        </Panel>
      </Page>
    );

  const canUpdate = me.role === 'delivery' || me.role === 'admin';
  const step = STEPS.indexOf(d.status);
  const balanceDue = o.balancePaid ? 0 : o.total - o.advance;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${o.siteAddress}, ${o.city}`)}`;

  return (
    <Page
      screen="delivery"
      crumbs={[{ label: me.role === 'delivery' ? 'My route' : 'Deliveries', to: me.role === 'delivery' ? '/' : '/deliveries' }, { label: d.id }]}
      title={
        <span className="flex flex-wrap items-center gap-3">
          {d.id} <StatusTag status={d.status} short />
          {d.priority === 'High' && <Tag label="High priority" icon={Flag} tone="red" />}
        </span>
      }
      subtitle={`${c.company} · ${o.city} · scheduled ${date(d.scheduled)}`}>
      <div className="grid items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Panel className="overflow-hidden">
            <div className="grid grid-cols-3">
              {STEPS.map((s, i) => (
                <div key={s} className={cx('flex items-center gap-2 px-4 py-3 text-[13px] font-semibold', i <= step ? 'bg-brand-50 text-brand-700' : 'text-faint', i > 0 && 'border-l border-line')}>
                  <span className={cx('grid size-5 place-items-center rounded-full text-[11px]', i < step || s === 'Delivered' && i === step ? 'bg-brand text-white' : i === step ? 'bg-ink text-white' : 'bg-slate-50 ring-1 ring-line')}>
                    {i < step || (s === 'Delivered' && i === step) ? <Check className="size-3" strokeWidth={3} /> : i + 1}
                  </span>
                  {s}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-[24px_1fr] gap-x-3 border-t border-line px-5 py-5">
              <Warehouse className="size-5 text-faint" />
              <div>
                <p className="font-semibold">{BRAND.name} yard</p>
                <p className="text-[13px] text-muted">{d.vehicle}</p>
              </div>
              <span className="ml-[9px] h-8 border-l-2 border-dashed border-line-strong" />
              <span />
              <Flag className="size-5 text-coral" />
              <div>
                <p className="font-semibold">{o.siteAddress}</p>
                <p className="text-[13px] text-muted">
                  {o.city} · {c.name}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-line p-4">
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-surface text-sm font-semibold ring-1 ring-inset ring-line-strong hover:bg-subtle">
                <Navigation className="size-4" /> Directions
              </a>
              <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-surface text-sm font-semibold ring-1 ring-inset ring-line-strong hover:bg-subtle">
                <Phone className="size-4" /> Call {c.name.split(' ')[0]}
              </a>
            </div>
          </Panel>

          {canUpdate && d.status !== 'Delivered' && (
            <div className="flex flex-col gap-4 rounded-2xl bg-ink p-5 text-white sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/50">Next step</p>
                <p className="text-[15px] font-bold">{d.status === 'Assigned' ? 'Pick up the machine and start the trip' : 'Hand over at site and collect proof'}</p>
              </div>
              {d.status === 'Assigned' ? (
                <Button
                  size="lg"
                  icon={Truck}
                  loading={busy}
                  onClick={() => {
                    setBusy(true);
                    setTimeout(() => {
                      useStore.getState().startDelivery(d.id);
                      setBusy(false);
                      toast(`${d.id} is in transit`);
                    }, 400);
                  }}>
                  Start delivery
                </Button>
              ) : (
                <Button size="lg" icon={CircleCheck} onClick={() => setCompleting(true)}>
                  Complete delivery
                </Button>
              )}
            </div>
          )}
          {d.status === 'Delivered' && (
            <Panel className="flex items-start gap-3 p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-green-50 text-green">
                <CircleCheck className="size-5" />
              </span>
              <div>
                <p className="font-bold">Delivered {d.deliveredAt && dateTime(d.deliveredAt)}</p>
                <p className="text-[13px] text-muted">
                  Received by {d.receivedBy} · {d.proof}
                </p>
              </div>
            </Panel>
          )}

          <Panel>
            <PanelHead title="Delivery log" />
            <div className="border-t border-line px-5 py-4">
              <ActivityFeed items={[...d.log].reverse().map((l) => ({ title: l.status, at: l.at, note: l.note }))} />
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel>
            <PanelHead title="Load" />
            <div className="flex gap-3 border-t border-line px-5 py-4">
              <CategoryTile category={m.category} machineId={m.id} />
              <div>
                <p className="font-semibold">
                  {o.qty} × {m.name}
                </p>
                <p className="text-[13px] text-muted">
                  {m.brand} · order{' '}
                  {me.role === 'delivery' ? (
                    o.id
                  ) : (
                    <Link to={`/order/${o.id}`} className="text-brand hover:underline">
                      {o.id}
                    </Link>
                  )}
                </p>
              </div>
            </div>
          </Panel>
          <Panel>
            <PanelHead title="Customer" />
            <div className="border-t border-line px-5 py-4">
              <div className="flex items-center gap-3">
                <Avatar name={c.name} />
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-[13px] text-muted">{c.company}</p>
                </div>
              </div>
              <dl className="mt-3">
                <Row label="Phone">{c.phone}</Row>
                <Row label="Driver">{driver?.name}</Row>
              </dl>
            </div>
          </Panel>
          <Panel className={cx('flex items-center gap-3 p-4', balanceDue > 0 && 'ring-amber/40!')}>
            <span className={cx('grid size-9 shrink-0 place-items-center rounded-xl', balanceDue ? 'bg-amber-50 text-amber' : 'bg-green-50 text-green')}>
              <IndianRupee className="size-[18px]" />
            </span>
            <div>
              <p className="text-[13px] text-muted">Balance to collect</p>
              <p className="font-mono">{balanceDue ? inr(balanceDue) : 'Fully paid'}</p>
            </div>
          </Panel>
        </div>
      </div>

      <Modal
        open={completing}
        onClose={() => setCompleting(false)}
        title="Complete delivery"
        sub="Record who received the machine and how it was verified."
        footer={
          <Button
            size="lg"
            className="w-full"
            icon={CircleCheck}
            disabled={receivedBy.trim().length < 2}
            onClick={() => {
              useStore.getState().completeDelivery(d.id, receivedBy.trim(), proof);
              setCompleting(false);
              toast(`${d.id} delivered`);
            }}>
            Mark as delivered
          </Button>
        }>
        {balanceDue > 0 && <div className="rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-amber">Balance of {inr(balanceDue)} is still pending. Confirm with the office before handover.</div>}
        <Field label="Received by" icon={PenLine} value={receivedBy} onChange={(e) => setReceivedBy(e.target.value)} placeholder="Name and designation" autoFocus />
        <div>
          <p className="mb-2 text-[13px] font-semibold text-ink-2">Proof of delivery</p>
          <div className="space-y-2" role="radiogroup">
            {PROOFS.map((p) => (
              <button key={p.key} type="button" role="radio" aria-checked={proof === p.key} onClick={() => setProof(p.key)} className={cx('flex w-full items-center gap-3 rounded-xl p-3 text-left ring-1 ring-inset transition', proof === p.key ? 'bg-brand-50 ring-2 ring-brand' : 'ring-line-strong hover:bg-subtle')}>
                <span className="grid size-9 place-items-center rounded-lg bg-surface ring-1 ring-line">
                  <p.icon className="size-4" />
                </span>
                <span>
                  <span className="block text-[13.5px] font-semibold">{p.key}</span>
                  <span className="block text-xs text-muted">{p.sub}</span>
                </span>
              </button>
            ))}
          </div>
          {proof === 'Photo proof uploaded' && <p className="mt-2 text-xs text-muted">Camera capture is simulated in the prototype.</p>}
        </div>
      </Modal>
    </Page>
  );
}
