import { Check, Mail, Minus, Phone, Plus, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import { Page } from '@/components/layout';
import { toast } from '@/components/toast';
import { Avatar, Button, cx, Field, Modal, Panel, PanelHead, Segmented, Tag } from '@/components/ui';
import type { Role, StaffMember } from '@/data/types';
import { PERMISSIONS, ROLE_LABEL } from '@/lib/roles';
import { useStaffUser, useStore } from '@/store';

const ROLES: Role[] = ['staff', 'delivery', 'admin'];
const ROLE_NAME: Record<Role, string> = { staff: 'Staff', delivery: 'Delivery', admin: 'Admin' };
const ROLE_NAMES = ROLES.map((r) => ROLE_NAME[r]);
const ROLE_TONE = { staff: 'blue', delivery: 'brand', admin: 'violet' } as const;

export default function Staff() {
  const me = useStaffUser()!;
  const staff = useStore((s) => s.staff);
  const [draft, setDraft] = useState<StaffMember | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isNew = draft ? !staff.some((m) => m.id === draft.id) : false;
  const patch = (p: Partial<StaffMember>) => setDraft((d) => (d ? { ...d, ...p } : d));

  const open = (m: StaffMember) => {
    setErrors({});
    setDraft(m);
  };

  const save = () => {
    if (!draft) return;
    const e: Record<string, string> = {};
    if (draft.name.trim().length < 2) e.name = 'Enter a name';
    if (!/^\S+@\S+\.\S+$/.test(draft.email)) e.email = 'Enter a valid email';
    else if (staff.some((m) => m.email.toLowerCase() === draft.email.toLowerCase() && m.id !== draft.id)) e.email = 'This email is already in use';
    setErrors(e);
    if (Object.keys(e).length) return;
    useStore.getState().saveStaff({ ...draft, name: draft.name.trim(), email: draft.email.trim().toLowerCase(), title: draft.title.trim() || ROLE_LABEL[draft.role] });
    toast(isNew ? 'Account created · invite sent' : 'Account updated');
    setDraft(null);
  };

  return (
    <Page
      screen="staff"
      title="Team & roles"
      subtitle={`${staff.filter((m) => m.active).length} active accounts across ${ROLES.length} roles`}
      actions={
        <Button icon={Plus} onClick={() => open({ id: `ST-${Date.now().toString().slice(-4)}`, name: '', role: 'staff', title: '', email: '', phone: '', active: true })}>
          Invite member
        </Button>
      }>
      <div className="space-y-5">
        {ROLES.map((r) => {
          const people = staff.filter((m) => m.role === r);
          return (
            <section key={r}>
              <h2 className="mb-3 flex items-center gap-2 text-[15px] font-bold">
                {ROLE_LABEL[r]} <span className="font-mono text-xs font-normal text-muted">{people.length}</span>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {people.map((m) => (
                  <Panel key={m.id} onClick={() => open(m)} className={cx('p-4', !m.active && 'opacity-60')}>
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">
                          {m.name} {m.id === me.id && <span className="text-xs font-medium text-muted">(you)</span>}
                        </p>
                        <p className="truncate text-[13px] text-muted">{m.title}</p>
                      </div>
                      <Tag label={m.active ? 'Active' : 'Inactive'} />
                    </div>
                    <div className="mt-3 space-y-1 text-[13px] text-ink-2">
                      <p className="flex items-center gap-2 truncate">
                        <Mail className="size-3.5 text-faint" /> {m.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="size-3.5 text-faint" /> {m.phone || '—'}
                      </p>
                    </div>
                  </Panel>
                ))}
              </div>
            </section>
          );
        })}

        <Panel>
          <PanelHead title="Permission matrix" sub="What each role can do across the platform" />
          <div className="overflow-x-auto border-t border-line">
            <table className="w-full min-w-[520px] text-[13.5px]">
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-muted">
                    Permission
                  </th>
                  {ROLES.map((r) => (
                    <th key={r} scope="col" className="w-28 px-4 py-3 text-center">
                      <Tag label={ROLE_NAME[r]} tone={ROLE_TONE[r]} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {PERMISSIONS.map((p) => (
                  <tr key={p.key}>
                    <td className="px-5 py-3">{p.label}</td>
                    {ROLES.map((r) => (
                      <td key={r} className="px-4 py-3 text-center">
                        {p.roles.includes(r) ? (
                          <span className="mx-auto grid size-6 place-items-center rounded-md bg-brand-50 text-brand" aria-label="Allowed">
                            <Check className="size-4" strokeWidth={2.6} />
                          </span>
                        ) : (
                          <Minus className="mx-auto size-4 text-line-strong" aria-label="Not allowed" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={isNew ? 'Invite team member' : 'Edit account'}
        sub={isNew ? 'They will receive an email invite to set up their login.' : draft?.email}
        footer={
          draft && (
            <>
              {!isNew && draft.id !== me.id && (
                <Button
                  variant={draft.active ? 'danger' : 'outline'}
                  className="flex-1"
                  onClick={() => {
                    useStore.getState().toggleStaff(draft.id);
                    toast(draft.active ? 'Account deactivated' : 'Account activated');
                    setDraft(null);
                  }}>
                  {draft.active ? 'Deactivate' : 'Activate'}
                </Button>
              )}
              <Button className="flex-[1.5]" onClick={save}>
                {isNew ? 'Create account' : 'Save'}
              </Button>
            </>
          )
        }>
        {draft && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={draft.name} onChange={(e) => patch({ name: e.target.value })} error={errors.name} />
              <Field label="Job title" value={draft.title} onChange={(e) => patch({ title: e.target.value })} placeholder="e.g. Delivery Executive" />
              <Field label="Email" type="email" value={draft.email} onChange={(e) => patch({ email: e.target.value })} error={errors.email} />
              <Field label="Phone" type="tel" value={draft.phone} onChange={(e) => patch({ phone: e.target.value })} />
            </div>
            <div>
              <p className="mb-2 text-[13px] font-semibold text-ink-2">Role</p>
              <Segmented label="Role" options={ROLE_NAMES} value={ROLE_NAME[draft.role]} onChange={(v) => patch({ role: ROLES.find((r) => ROLE_NAME[r] === v)! })} />
            </div>
            <div className="rounded-xl bg-subtle p-4">
              <p className="mb-2 flex items-center gap-2 text-[13px] font-semibold">
                <ShieldCheck className="size-4 text-brand" /> This role can
              </p>
              <ul className="grid gap-1.5 text-[13px] text-ink-2 sm:grid-cols-2">
                {PERMISSIONS.filter((p) => p.roles.includes(draft.role)).map((p) => (
                  <li key={p.key} className="flex items-center gap-2">
                    <Check className="size-3.5 text-brand" /> {p.label}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </Modal>
    </Page>
  );
}
