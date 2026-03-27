Next.js Log Viewer — Build Plan
Stack: Next.js (App Router) · Prisma · MariaDB · Tailwind CSS · TypeScript
1. Project initialization
Scaffold the project and install dependencies:

npx create-next-app@latest log-viewer --typescript --tailwind --app
cd log-viewer
npm install prisma @prisma/client
npx prisma init

Set the database connection string in .env:

DATABASE_URL="mysql://user:password@localhost:3306/your_logs_db"

2. Prisma schema
Run the introspection command to auto-generate the schema from the existing MariaDB tables. Prisma will detect all four tables and their foreign key relationships automatically:

npx prisma db pull
npx prisma generate

This produces typed models for: deployments, steps, events, and child_events.

3. File structure

app/
  page.tsx                        ← deployments list
  deployments/[id]/page.tsx       ← deployment detail + steps
  steps/[id]/page.tsx             ← step log viewer
  api/
    deployments/route.ts          ← GET list with search
    deployments/[id]/route.ts     ← GET single deployment
    steps/[id]/route.ts           ← GET step + logs

lib/
  prisma.ts                       ← singleton PrismaClient

components/
  StatusBadge.tsx                 ← pending/running/success/failed chip
  DurationLabel.tsx               ← formats duration_ms → "8m 32s"
  LogPanel.tsx                    ← scrollable log output, stdout/stderr split

4. Data access patterns
Prisma singleton (lib/prisma.ts)
Attach the PrismaClient to the global object in development to prevent connection exhaustion on hot reload. In production a new instance is created normally.
Deployments list query
Use prisma.deployments.findMany with include: { steps: true } to fetch step summaries alongside each deployment. Derive an overall status from the step statuses: if any step is failed the deployment is failed; if all are success it is complete.
Step log query
Use prisma.steps.findUnique with nested include for both events and child_events, ordered by created_at. Accept an optional ?type=stdout|stderr URL param and apply it as a where clause on child_events to support filtering.

5. API routes
All data fetching is server-side via Next.js Route Handlers (app/api/...):

    • GET /api/deployments — list with optional ?search= and ?date= query params
    • GET /api/deployments/[id] — single deployment with all steps
    • GET /api/steps/[id] — step detail with events and child_events (?type=stdout|stderr filter)

6. Pages & UI
Deployments list (/)
Shows deployment ID (truncated UUID), creation time, step count, and derived overall status. Each row links to the deployment detail page. Includes a search input that filters by deployment ID substring.
Deployment detail (/deployments/[id])
Renders a vertical timeline of steps. Each step shows: name, status badge, start time, and duration. Each row is a link to the step log viewer.
Step log viewer (/steps/[id])
Two sections:
    • Events timeline at the top — shows start → finish/error sequence with timestamps and total duration
    • Log panel below — dark background <pre> block with monospace font. stderr lines are highlighted in muted red. Includes a stdout/stderr toggle and a text input for client-side log search

7. Key components
StatusBadge
Maps the steps.status enum to Tailwind color classes:
    • success → green
    • failed → red
    • running → blue
    • pending → gray
DurationLabel
Converts duration_ms to a human-readable string (e.g. 8m 32s). Falls back to computing from started_at / finished_at if duration_ms is null.
LogPanel
Accepts an array of child_events. Renders each line with its log_type styled differently. Supports controlled filtering via a type prop and client-side text search via Array.filter.

8. Search
Two levels of search:
    • Deployments list: controlled <input> filtering client-side for small datasets. For larger datasets, pass ?q= as a URL search param and add where: { id: { contains: q } } to the Prisma query.
    • Log viewer: fully client-side. Load all child_events once and filter in the component with Array.filter on the log field.

9. Optional extras
    • Relative timestamps — use the date-fns library for '3 minutes ago' labels on the deployments list
    • Auto-refresh — add a useEffect poll interval on the deployment detail page while any step has status: running
    • Pagination — add take / skip to the deployments query once the table grows
    
    
    
cd /Volume1/www/moneygoup
git pull origin main
python3 deepmoney_sync.py
docker stop moneygoup
docker rm moneygoup
docker build -t moneygoup .
docker run -d  --name moneygoup -p 3001:3001 --env-file .env.production  moneygoup    


