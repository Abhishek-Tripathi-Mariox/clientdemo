# KaviRaj Demo — Operations Panel

React.js web panel for the operations team: **Vite + React 19 + TypeScript + Tailwind CSS 4 +
React Router 7 + Zustand**. One login, three role-based experiences:

- **Staff operations**: review incoming requests, confirm, move orders through
  processing → ready, assign deliveries, view customers, activity log.
- **Delivery**: assigned deliveries, address and customer details, start delivery,
  confirm delivery with receiver name and proof, delivery history.
- **Super admin**: 6-KPI dashboard, orders pipeline, deliveries, customers, machinery
  catalog (add / edit / publish), staff accounts and permission matrix, reports, audit log.

Design: top navigation with a ⌘K / Ctrl+K quick search, notifications pop-up and account menu;
orders as a list or a Kanban board; a horizontal order tracker with a "next step" action bar;
centred dialogs that become bottom sheets on phones. Below 1280 px the navigation becomes a
scrollable strip under the header, and tables turn into stacked rows.

Branding lives in `src/brand.ts` (name, tagline, initials) and the colour tokens in
`src/index.css` (`@theme`). "KaviRaj Demo" is a placeholder until the client confirms the name.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build in ./dist
npm run preview    # serve the production build locally
```

`dist` is a single-page app: configure the host (S3/CloudFront, Nginx, Netlify, Vercel…) to
serve `index.html` for unknown paths.

## Demo logins (password `demo123`)

| Role | Email |
| --- | --- |
| Staff operations | `staff@demo.com` |
| Delivery | `delivery@demo.com` |
| Super admin | `admin@demo.com` |

## Data

Sample data (`src/data/seed.ts`) kept in the browser's localStorage by the Zustand store
(`src/store/index.ts`), which acts as the mock API. The panel and the customer app are not
connected yet: in M03 each store action becomes a REST call to the shared Node.js backend, and
the pages don't change.

## Structure

```
src/main.tsx              router and auth guards
src/pages/                one file per screen (Dashboard, Orders, OrderDetail, Deliveries,
                          DeliveryDetail, History, Customers, Machinery, Staff, Reports,
                          Notifications, Activity, Login)
src/components/layout.tsx app shell, top nav, ⌘K palette, page frame, stat cards, data table
src/components/ui.tsx     buttons, tags, panels, fields, segmented control, tabs, toggle, modal
src/components/ops.tsx    orders table + board, deliveries table, route card, schedule dialog
src/components/charts.tsx column chart, stacked bar, ranked list, progress ring
src/components/timeline.tsx order stepper and activity feed
src/lib/roles.ts          navigation per role and the permission matrix
```
