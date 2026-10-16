import { BellOff, CheckCheck } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';

import { Page } from '@/components/layout';
import { Button, cx, EmptyState, Panel } from '@/components/ui';
import type { Notification } from '@/data/types';
import { timeAgo } from '@/lib/format';
import { useStaffUser, useStore } from '@/store';

const dayKey = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const diff = Math.floor((new Date(today.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 86400000);
  return diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
};

export default function Notifications() {
  const navigate = useNavigate();
  const me = useStaffUser()!;
  const all = useStore((s) => s.notifications);
  const items = useMemo(() => all.filter((n) => n.audience === me.role && (!n.userId || n.userId === me.id)), [all, me]);
  const unread = items.filter((n) => !n.read).length;
  const groups = items.reduce<Record<string, Notification[]>>((acc, n) => ({ ...acc, [dayKey(n.at)]: [...(acc[dayKey(n.at)] ?? []), n] }), {});

  return (
    <Page
      screen="notifications"
      title="Notifications"
      subtitle={unread ? `${unread} unread` : 'You are all caught up'}
      actions={
        unread > 0 && (
          <Button variant="outline" size="sm" icon={CheckCheck} onClick={() => useStore.getState().markNotificationsRead(me.role, me.id)}>
            Mark all read
          </Button>
        )
      }>
      {items.length === 0 ? (
        <Panel>
          <EmptyState icon={BellOff} title="No notifications" body="Requests, assignments and delivery updates will appear here." />
        </Panel>
      ) : (
        <div className="max-w-4xl space-y-6">
          {Object.entries(groups).map(([day, list]) => (
            <section key={day}>
              <h2 className="mb-2 text-[13px] font-semibold text-muted">{day}</h2>
              <Panel className="divide-y divide-line overflow-hidden">
                {list.map((n) => (
                  <button key={n.id} type="button" disabled={!n.link} onClick={() => n.link && navigate(n.link)} className={cx('flex w-full gap-3 px-5 py-4 text-left transition enabled:hover:bg-subtle', !n.read && 'bg-brand-50/40')}>
                    <span className={cx('mt-1.5 size-2 shrink-0 rounded-full', n.read ? 'bg-line-strong' : 'bg-coral')} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold">{n.title}</span>
                      <span className="block text-[13px] text-muted">{n.body}</span>
                    </span>
                    <span className="shrink-0 text-xs text-faint">{timeAgo(n.at)}</span>
                  </button>
                ))}
              </Panel>
            </section>
          ))}
        </div>
      )}
    </Page>
  );
}
