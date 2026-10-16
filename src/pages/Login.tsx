import { ArrowRight, Eye, EyeOff, KeyRound, LayoutDashboard, Mail, Truck, Users } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';

import { BRAND } from '@/brand';
import { BrandMark } from '@/components/layout';
import { toast } from '@/components/toast';
import { Button, Field } from '@/components/ui';
import { useStore } from '@/store';

const ROLES = [
  { icon: Users, label: 'Staff operations' },
  { icon: Truck, label: 'Delivery' },
  { icon: LayoutDashboard, label: 'Admin' },
];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!email.trim() || !password) return setError('Enter your email and password.');
    setBusy(true);
    setTimeout(() => {
      const err = useStore.getState().loginStaff(email, password);
      setBusy(false);
      if (err) return setError(err);
      toast('Welcome back');
      navigate('/', { replace: true });
    }, 450);
  };

  return (
    <div className="dots relative flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[45vh] bg-gradient-to-b from-brand-50 to-transparent" />
      <div className="relative w-full max-w-[420px] animate-rise">
        <div className="mb-7 flex flex-col items-center text-center">
          <BrandMark className="size-12" />
          <h1 className="mt-4 text-[26px] font-extrabold tracking-tight">Sign in to {BRAND.product}</h1>
          <p className="mt-1 max-w-xs text-[14px] text-muted">{BRAND.tagline}</p>
        </div>

        <div className="rounded-3xl bg-surface p-6 shadow-pop ring-1 ring-line sm:p-7">
          <form onSubmit={submit} className="space-y-4">
            <Field label="Work email" icon={Mail} type="email" autoComplete="username" autoFocus value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="name@company.in" />
            <Field
              label="Password"
              icon={KeyRound}
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Enter your password"
              error={error}
              suffix={
                <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((v) => !v)} className="text-faint hover:text-ink">
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              }
            />
            <div className="flex justify-end">
              <button type="button" onClick={() => toast('Ask your administrator to reset your password.')} className="text-[13px] font-semibold text-brand hover:underline">
                Forgot password?
              </button>
            </div>
            <Button type="submit" size="lg" className="w-full" loading={busy} iconRight={ArrowRight}>
              Sign in
            </Button>
          </form>

          <div className="mt-6 border-t border-line pt-5">
            <p className="text-center text-xs text-muted">One login for every team. You land on the workspace for your role.</p>
            <div className="mt-3 flex justify-center gap-2">
              {ROLES.map((r) => (
                <span key={r.label} className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-[12px] font-semibold text-ink-2">
                  <r.icon className="size-3.5 text-brand" /> {r.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-faint">© 2026 {BRAND.name}</p>
      </div>
    </div>
  );
}
