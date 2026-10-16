import { RefreshCw, RotateCcw, TriangleAlert } from 'lucide-react';
import { useRouteError } from 'react-router';

import { BRAND } from '@/brand';
import { Button, Panel } from '@/components/ui';
import { STORAGE_KEY } from '@/store';

/** Shown instead of the raw stack trace when a page throws. */
export default function ErrorPage() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : String(error ?? 'Unknown error');
  if (import.meta.env.DEV) console.error(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <Panel className="w-full max-w-md p-7 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber">
          <TriangleAlert className="size-6" />
        </span>
        <h1 className="mt-4 text-xl font-bold">Something went wrong</h1>
        <p className="mt-1 text-[14px] text-muted">
          {BRAND.product} hit an unexpected problem on this page. Reloading usually fixes it. If it keeps happening, reset the demo data.
        </p>
        <p className="mt-3 truncate rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-muted" title={message}>
          {message}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button icon={RefreshCw} onClick={() => window.location.reload()}>
            Reload page
          </Button>
          <Button
            variant="outline"
            icon={RotateCcw}
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              window.location.assign('/login');
            }}>
            Reset demo data
          </Button>
        </div>
      </Panel>
    </div>
  );
}
