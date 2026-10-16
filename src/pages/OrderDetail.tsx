import { Ban, CheckCircle2, Factory, Mail, MapPin, PackageCheck, PackageX, Phone, Truck } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { Page } from '@/components/layout';
import { AssignDeliveryModal } from '@/components/ops';
import { ActivityFeed, Stepper } from '@/components/timeline';
import { toast } from '@/components/toast';
import { Avatar, Button, CategoryTile, EmptyState, Field, Modal, Panel, PanelHead, Row, StatusTag, Tag } from '@/components/ui';
import type { OrderStatus } from '@/data/types';
import { date, dateTime, inr } from '@/lib/format';
import { useStore } from '@/store';

const NEXT: Partial<Record<OrderStatus, { label: string; hint: string; to?: OrderStatus; icon: typeof Truck }>> = {
  Requested: { label: 'Confirm request', hint: 'Check stock and pricing, then confirm so the customer can pay the advance.', to: 'Confirmed', icon: CheckCircle2 },
  Confirmed: { label: 'Start processing', hint: 'Move the order to the plant for preparation and pre-delivery inspection.', to: 'Processing', icon: Factory },
  Processing: { label: 'Mark ready for dispatch', hint: 'Final QC passed and the machine is ready to leave the yard.', to: 'Ready', icon: PackageCheck },
  Ready: { label: 'Schedule delivery', hint: 'Pick a driver, a date and a vehicle.', icon: Truck },
  Assigned: { label: 'Reassign delivery', hint: 'The driver will start the delivery from the delivery panel.', icon: Truck },
};

export default function OrderDetail() {
  const { id } = useParams();
  const o = useStore((s) => s.orders.find((x) => x.id === id));
  const c = useStore((s) => s.customers.find((x) => x.id === o?.customerId));
  const m = useStore((s) => s.machines.find((x) => x.id === o?.machineId));
  const d = useStore((s) => s.deliveries.find((x) => x.id === o?.deliveryId));
  const driver = useStore((s) => s.staff.find((x) => x.id === d?.assignedTo));
  const owner = useStore((s) => s.staff.find((x) => x.id === o?.handledBy));
  const previous = useStore((s) => s.orders.filter((x) => x.customerId === o?.customerId && x.id !== id).length);
  const [assign, setAssign] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [reason, setReason] = useState('');

  if (!o || !c || !m)
    return (
      <Page screen="order" title="Order not found" crumbs={[{ label: 'Orders', to: '/orders' }, { label: id ?? '' }]}>
        <Panel>
          <EmptyState icon={PackageX} title="This order does not exist" body="It may have been removed, or the link is wrong." />
        </Panel>
      </Page>
    );

  const next = NEXT[o.status];
  const cancellable = ['Requested', 'Confirmed', 'Processing'].includes(o.status);
  const run = () => {
    if (!next) return;
    if (!next.to) return setAssign(true);
    useStore.getState().setOrderStatus(o.id, next.to);
    toast(`${o.id} moved to ${next.to}`);
  };

  return (
    <Page
      screen="order"
      crumbs={[{ label: 'Orders', to: '/orders' }, { label: o.id }]}
      title={
        <span className="flex flex-wrap items-center gap-3">
          {o.id} <StatusTag status={o.status} />
        </span>
      }
      subtitle={`Placed ${dateTime(o.placedAt)} · ${c.company}`}
      actions={cancellable && <Button variant="danger" icon={Ban} onClick={() => setCancel(true)}>Cancel order</Button>}>
      <Panel className="mb-4 p-5">
        <Stepper order={o} />
      </Panel>

      {next && (
        <div className="mb-4 flex flex-col gap-4 rounded-2xl bg-ink p-5 text-white sm:flex-row sm:items-center">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10">
            <next.icon className="size-5" />
          </span>
          <div className="flex-1">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/50">Next step</p>
            <p className="text-[15px] font-bold">{next.label}</p>
            <p className="text-[13px] text-white/70">{next.hint}</p>
            {o.status === 'Confirmed' && !o.advancePaid && <p className="mt-1 text-[13px] text-amber-50">Advance not received yet — you can still proceed for trusted accounts.</p>}
          </div>
          <Button variant={o.status === 'Assigned' ? 'outline' : 'primary'} size="lg" onClick={run}>
            {next.label}
          </Button>
        </div>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <Panel>
            <PanelHead title="Order details" />
            <div className="flex gap-4 border-t border-line px-5 py-4">
              <CategoryTile category={m.category} machineId={m.id} size="lg" />
              <div className="min-w-0 flex-1">
                <Link to="/machinery" className="font-bold hover:text-brand">
                  {m.name}
                </Link>
                <p className="text-[13px] text-muted">
                  {m.brand} · {m.category} · {m.id}
                </p>
                <p className="mt-2 text-[13px]">
                  Quantity <span className="font-mono font-medium">{o.qty}</span> · Unit price <span className="font-mono font-medium">{inr(o.unitPrice)}</span>
                </p>
              </div>
            </div>
            {o.note && (
              <div className="mx-5 mb-5 rounded-xl bg-coral-50 px-4 py-3">
                <p className="text-[12px] font-semibold text-coral">Customer note</p>
                <p className="text-[13.5px] text-ink">{o.note}</p>
              </div>
            )}
          </Panel>

          <Panel>
            <PanelHead title="Activity" sub="Every status change, who made it and when" />
            <div className="border-t border-line px-5 py-4">
              <ActivityFeed items={[...o.history].reverse().map((h) => ({ title: h.status, by: h.by, at: h.at, note: h.note }))} />
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel>
            <PanelHead title="Customer" action={<Tag label={`${previous} previous`} tone="slate" />} />
            <div className="border-t border-line px-5 py-4">
              <div className="flex items-center gap-3">
                <Avatar name={c.name} />
                <div>
                  <p className="font-semibold">{c.company}</p>
                  <p className="text-[13px] text-muted">{c.name}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-[13px]">
                <li className="flex items-center gap-2">
                  <Phone className="size-4 text-faint" />
                  <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="hover:text-brand">
                    {c.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="size-4 text-faint" />
                  <a href={`mailto:${c.email}`} className="truncate hover:text-brand">
                    {c.email}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-faint" />
                  {o.siteAddress}, {o.city}
                </li>
              </ul>
              <p className="mt-4 text-xs text-muted">Handled by {owner?.name ?? 'nobody yet'}</p>
            </div>
          </Panel>

          <Panel>
            <PanelHead title="Payment" action={<Tag label={o.balancePaid ? 'Fully paid' : o.advancePaid ? 'Advance paid' : 'Unpaid'} tone={o.balancePaid ? 'green' : o.advancePaid ? 'blue' : 'amber'} />} />
            <dl className="border-t border-line px-5 py-3">
              <Row label="Subtotal" mono>{inr(o.unitPrice * o.qty)}</Row>
              <Row label="Dealer discount" mono>− {inr(o.discount)}</Row>
              <Row label="GST 18%" mono>{inr(o.gst)}</Row>
            </dl>
            <div className="flex items-center justify-between border-t border-line px-5 py-3">
              <span className="font-semibold">Total</span>
              <span className="font-mono text-lg font-medium">{inr(o.total)}</span>
            </div>
            <div className="grid grid-cols-2 gap-px border-t border-line bg-line">
              <div className="bg-surface px-5 py-3">
                <p className="text-xs text-muted">Advance 30%</p>
                <p className="font-mono">{inr(o.advance)}</p>
              </div>
              <div className="bg-surface px-5 py-3">
                <p className="text-xs text-muted">Balance</p>
                <p className="font-mono">{inr(o.total - o.advance)}</p>
              </div>
            </div>
          </Panel>

          {d && (
            <Panel>
              <PanelHead title="Delivery" action={<Link to={`/delivery/${d.id}`} className="text-[13px] font-semibold text-brand hover:underline">{d.id}</Link>} />
              <dl className="border-t border-line px-5 py-3">
                <Row label="Status"><StatusTag status={d.status} short /></Row>
                <Row label="Driver">{driver?.name ?? '—'}</Row>
                <Row label="Scheduled">{date(d.scheduled)}</Row>
                <Row label="Vehicle">{d.vehicle}</Row>
                {d.proof && <Row label="Proof">{d.proof}</Row>}
              </dl>
            </Panel>
          )}
        </div>
      </div>

      {assign && <AssignDeliveryModal order={o} open onClose={() => setAssign(false)} />}
      <Modal
        open={cancel}
        onClose={() => setCancel(false)}
        title={`Cancel ${o.id}?`}
        sub="The order leaves the pipeline. This cannot be undone in the prototype."
        footer={
          <>
            <Button variant="outline" className="flex-1" onClick={() => setCancel(false)}>
              Keep order
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              disabled={reason.trim().length < 3}
              onClick={() => {
                useStore.getState().setOrderStatus(o.id, 'Cancelled', reason.trim());
                setCancel(false);
                toast(`${o.id} cancelled`);
              }}>
              Cancel order
            </Button>
          </>
        }>
        <Field label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Customer chose a different model" autoFocus />
      </Modal>
    </Page>
  );
}
