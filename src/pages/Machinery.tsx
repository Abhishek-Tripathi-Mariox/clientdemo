import { LayoutGrid, Package, Plus, Rows3, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';

import { type Column, DataTable, Page } from '@/components/layout';
import { toast } from '@/components/toast';
import { Button, CategoryTile, ChoiceGrid, cx, EmptyState, Field, Modal, Panel, SearchInput, Segmented, Tag, TextArea, Toggle } from '@/components/ui';
import { CATEGORIES } from '@/data/seed';
import type { Availability, Machine } from '@/data/types';
import { inr, inrShort } from '@/lib/format';
import { machineImage } from '@/lib/images';
import { useStore } from '@/store';

const AVAIL: Availability[] = ['In stock', 'Limited', 'Made to order'];
const VIEWS = ['Grid', 'Table'] as const;

type Draft = Omit<Machine, 'price' | 'stock' | 'leadTimeDays'> & { price: string; stock: string; leadTimeDays: string };

const blank = (): Draft => ({
  id: `MH-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
  name: '',
  category: CATEGORIES[0],
  brand: '',
  price: '',
  tagline: '',
  description: '',
  specs: [{ label: 'Operating weight', value: '' }],
  stock: '0',
  availability: 'In stock',
  leadTimeDays: '14',
  active: true,
});
const toDraft = (m: Machine): Draft => ({ ...m, price: String(m.price), stock: String(m.stock), leadTimeDays: String(m.leadTimeDays) });
const digits = (v: string) => v.replace(/\D/g, '');

export default function Machinery() {
  const [params, setParams] = useSearchParams();
  const machines = useStore((s) => s.machines);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('All');
  const [view, setView] = useState<(typeof VIEWS)[number]>('Grid');
  const [draft, setDraft] = useState<Draft | null>(() => {
    const m = machines.find((x) => x.id === params.get('focus'));
    return m ? toDraft(m) : null;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isNew = draft ? !machines.some((m) => m.id === draft.id) : false;
  const patch = (p: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...p } : d));

  const rows = useMemo(() => {
    const n = q.trim().toLowerCase();
    return machines.filter((m) => (cat === 'All' || m.category === cat) && (!n || `${m.name} ${m.brand} ${m.id}`.toLowerCase().includes(n)));
  }, [machines, q, cat]);

  const open = (d: Draft) => {
    setErrors({});
    setDraft(d);
  };
  const close = () => {
    setDraft(null);
    if (params.get('focus')) setParams({});
  };
  const toggle = (m: Machine) => {
    useStore.getState().toggleMachine(m.id);
    toast(m.active ? `${m.name} hidden from the catalog` : `${m.name} published`);
  };

  const save = () => {
    if (!draft) return;
    const e: Record<string, string> = {};
    if (draft.name.trim().length < 3) e.name = 'Enter a machine name';
    if (!draft.brand.trim()) e.brand = 'Enter the brand';
    if (!(Number(draft.price) > 0)) e.price = 'Enter a valid price';
    setErrors(e);
    if (Object.keys(e).length) return;
    useStore.getState().saveMachine({
      ...draft,
      name: draft.name.trim(),
      brand: draft.brand.trim(),
      tagline: draft.tagline.trim() || draft.name.trim(),
      description: draft.description.trim() || draft.tagline.trim(),
      specs: draft.specs.filter((s) => s.label.trim() && s.value.trim()),
      price: Number(draft.price),
      stock: Number(draft.stock) || 0,
      leadTimeDays: Number(draft.leadTimeDays) || 0,
    });
    toast(isNew ? 'Machine added to the catalog' : 'Machine updated');
    close();
  };

  const cols: Column<Machine>[] = [
    {
      key: 'name',
      label: 'Machine',
      render: (m) => (
        <div className="flex items-center gap-3">
          <CategoryTile category={m.category} machineId={m.id} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-semibold">{m.name}</p>
            <p className="truncate text-xs text-muted">
              {m.id} · {m.brand}
            </p>
          </div>
        </div>
      ),
    },
    { key: 'cat', label: 'Category', hideOnMobile: true, render: (m) => m.category },
    { key: 'price', label: 'Price', className: 'whitespace-nowrap text-right', render: (m) => <span className="font-mono">{inr(m.price)}</span> },
    { key: 'stock', label: 'Stock', className: 'text-right', render: (m) => <span className="font-mono">{m.stock}</span> },
    { key: 'avail', label: 'Availability', render: (m) => <Tag label={m.availability} /> },
    { key: 'live', label: 'Listed', render: (m) => <Toggle checked={m.active} label={`List ${m.name} in the catalog`} onChange={() => toggle(m)} /> },
  ];

  const counts = Object.fromEntries(['All', ...CATEGORIES].map((c) => [c, c === 'All' ? machines.length : machines.filter((m) => m.category === c).length]));

  return (
    <Page
      screen="machinery"
      title="Machinery catalog"
      subtitle={`${machines.filter((m) => m.active).length} of ${machines.length} machines listed for customers`}
      actions={
        <>
          <Segmented label="View" options={VIEWS} value={view} onChange={setView} icons={{ Grid: LayoutGrid, Table: Rows3 }} />
          <Button icon={Plus} onClick={() => open(blank())}>
            Add machine
          </Button>
        </>
      }>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['All', ...CATEGORIES].map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={cat === c}
            onClick={() => setCat(c)}
            className={cx('flex shrink-0 items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-3 text-[13px] font-semibold ring-1 ring-inset transition', cat === c ? 'bg-ink text-white ring-ink' : 'bg-surface ring-line hover:bg-subtle')}>
            {c === 'All' ? <span className="grid size-7 place-items-center rounded-lg bg-slate-50 text-ink-2"><Package className="size-4" /></span> : <CategoryTile category={c} size="sm" />}
            {c}
            <span className={cx('font-mono text-xs', cat === c ? 'text-white/60' : 'text-faint')}>{counts[c]}</span>
          </button>
        ))}
      </div>
      <div className="mb-4 flex">
        <SearchInput value={q} onChange={setQ} placeholder="Search by name, brand or ID" />
      </div>

      {view === 'Table' ? (
        <DataTable rows={rows} columns={cols} rowKey={(m) => m.id} onRowClick={(m) => open(toDraft(m))} empty={<EmptyState icon={Package} title="No machines match" />} />
      ) : rows.length === 0 ? (
        <Panel>
          <EmptyState icon={Package} title="No machines match" />
        </Panel>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {rows.map((m) => (
            <Panel key={m.id} onClick={() => open(toDraft(m))} className={cx('flex flex-col overflow-hidden', !m.active && 'opacity-60')}>
              <div className="relative">
                <img src={machineImage(m.id, m.category)} alt={m.name} loading="lazy" className="aspect-[16/10] w-full bg-slate-50 object-cover" />
                <span className="absolute left-3 top-3 rounded-lg bg-white/90 px-2 py-0.5 text-[12px] font-semibold text-ink backdrop-blur">{m.category}</span>
                <span className="absolute right-3 top-3 rounded-full bg-white/90 p-1 backdrop-blur">
                  <Toggle checked={m.active} label={`List ${m.name} in the catalog`} onChange={() => toggle(m)} />
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="font-bold leading-snug">{m.name}</p>
                <p className="text-[13px] text-muted">
                  {m.brand} · {m.id}
                </p>
                <p className="mt-2 line-clamp-2 flex-1 text-[13px] text-ink-2">{m.tagline}</p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <span className="font-mono text-[15px]">{inrShort(m.price)}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-muted">{m.stock} in stock</span>
                    <Tag label={m.availability} />
                  </span>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <Modal
        open={!!draft}
        onClose={close}
        wide
        title={isNew ? 'Add machine' : 'Edit machine'}
        sub={draft && !isNew ? draft.id : 'It will appear in the customer app when listed.'}
        footer={
          <>
            <Button variant="outline" className="flex-1" onClick={close}>
              Cancel
            </Button>
            <Button className="flex-[2]" onClick={save}>
              {isNew ? 'Add to catalog' : 'Save changes'}
            </Button>
          </>
        }>
        {draft && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={draft.name} onChange={(e) => patch({ name: e.target.value })} error={errors.name} placeholder="Hydraulic Excavator EX-300" />
              <Field label="Brand" value={draft.brand} onChange={(e) => patch({ brand: e.target.value })} error={errors.brand} placeholder="Kaveri Earthmovers" />
            </div>
            <div>
              <p className="mb-2 text-[13px] font-semibold text-ink-2">Category</p>
              <ChoiceGrid options={CATEGORIES} value={draft.category as (typeof CATEGORIES)[number]} onChange={(v) => patch({ category: v })} />
            </div>
            <div className="grid grid-cols-[2fr_1fr_1fr] gap-3">
              <Field label="Price (₹)" inputMode="numeric" value={draft.price} onChange={(e) => patch({ price: digits(e.target.value) })} error={errors.price} placeholder="5240000" />
              <Field label="Stock" inputMode="numeric" value={draft.stock} onChange={(e) => patch({ stock: digits(e.target.value) })} />
              <Field label="Lead days" inputMode="numeric" value={draft.leadTimeDays} onChange={(e) => patch({ leadTimeDays: digits(e.target.value) })} />
            </div>
            <div>
              <p className="mb-2 text-[13px] font-semibold text-ink-2">Availability</p>
              <Segmented label="Availability" options={AVAIL} value={draft.availability} onChange={(v) => patch({ availability: v })} />
            </div>
            <Field label="Tagline" value={draft.tagline} onChange={(e) => patch({ tagline: e.target.value })} placeholder="One line shown on the catalog card" />
            <TextArea label="Description" value={draft.description} onChange={(e) => patch({ description: e.target.value })} />
            <div>
              <p className="mb-2 text-[13px] font-semibold text-ink-2">Specifications</p>
              <div className="space-y-2">
                {draft.specs.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Field aria-label="Specification" value={s.label} placeholder="Specification" onChange={(e) => patch({ specs: draft.specs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
                    </div>
                    <div className="flex-1">
                      <Field aria-label="Value" value={s.value} placeholder="Value" onChange={(e) => patch({ specs: draft.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} />
                    </div>
                    <button type="button" aria-label="Remove specification" onClick={() => patch({ specs: draft.specs.filter((_, j) => j !== i) })} className="grid size-10 place-items-center rounded-xl text-faint hover:bg-red-50 hover:text-red">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" icon={Plus} className="mt-2" onClick={() => patch({ specs: [...draft.specs, { label: '', value: '' }] })}>
                Add specification
              </Button>
            </div>
          </>
        )}
      </Modal>
    </Page>
  );
}
