# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Better Excel Finances is a personal finance tracking application that provides two main features:
1. **Net Worth Tracking**: Users can add asset/debt accounts and categorize funds (e.g., savings allocated to sinking fund vs house fund)
2. **Monthly Spending Tracking**: Users upload credit card statement CSVs (Discover/Capital One format) to visualize spending by category

This is a Next.js 15 app using the App Router, written in TypeScript with React 19, using Prisma + PostgreSQL for data persistence and NextAuth v5 (beta) for authentication via Google OAuth.

## Commands

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Database (Prisma)
- `npm run prisma:generate` - Generate Prisma client (runs automatically on `npm install`)
- `npm run prisma:migrate` - Deploy migrations (maps to `prisma migrate deploy`)
- `npx prisma migrate dev` - Create and apply dev migrations (for local development)
- `npx prisma studio` - Open Prisma Studio to view/edit data

## Architecture

### Server/Client Boundary

- **Server Actions** (`app/actions/*.ts`): All files with `"use server"` directive. These encapsulate server-side logic with Prisma + auth
  - `app/actions/financial.ts` - Net worth sections and table data operations
  - `app/upload/actions.ts` - CSV upload, transaction CRUD, spending analytics

- **Client Components** (`app/components/`, `components/ui/`): Default to client-side unless marked with `"use server"`
  - `app/components/` - Main application UI components
  - `components/ui/` - Reusable shadcn/ui components

### Authentication Flow

- `auth.ts` (root) exports `auth()`, `signIn()`, `signOut()` from NextAuth
- Auth provider: Google OAuth (configured in `auth.ts`)
- Session management: Prisma adapter stores sessions in database
- `app/layout.tsx` wraps app with `ClientSessionProvider` for client-side session access
- Server actions call `auth()` to get session and always guard with:
  ```ts
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  ```

### Database Layer

- **Prisma Client**: Always import from `app/lib/prisma.ts` (singleton pattern to prevent connection exhaustion)
- **Schema** (`prisma/schema.prisma`):
  - `Section` - Net worth account sections (assets/debts) with monthly snapshots
  - `SectionItem` - Individual line items within a section
  - `TableData` - Monthly aggregated net worth data (keyed by `userId_date`)
  - `Category` - User-defined spending categories (unique on `[userId, name]`)
  - `Transaction` - Individual spending transactions from CSV uploads (unique on `[date, description, amount, userId]`)
  - `User`, `Account`, `Session`, `VerificationToken`, `Authenticator` - NextAuth models

### Date Handling

**Critical**: All date operations normalize to UTC to avoid timezone issues

- Server actions use `Date.UTC()` for month boundaries:
  ```ts
  const normalized = new Date(Date.UTC(year, month, 15, 0, 0, 0, 0));
  ```
- When creating or querying monthly records, always normalize to UTC
- Examples in `app/actions/financial.ts` (see `fetchSections`, `updateTableData`)

### CSV Upload & AI Categorization Flow

1. User uploads CSV via `app/upload/page.tsx`
2. `uploadCsv()` action parses CSV with PapaParse (`app/utils/uploadUtils.ts`)
3. Detects statement format:
   - Debit/Credit columns (Capital One)
   - Memo column with sales as negative amounts (Chase)
   - Amount column (Discover and standard formats)
4. Normalizes transactions to UTC date, positive spending amounts, and `statementMonth` (format: `M-YYYY`)
5. Fetches user-defined categories (`Category` model in Prisma)
6. Categorization Engine (`app/lib/categorization/jevCategorizer.ts`):
   - Fast-path matching: checks exact and case-insensitive matches as well as common financial synonyms
   - AI Decision Classification: invokes TypeSafe's Jev model (`typesafe/jev-1.14`) via OpenRouter's Decisions API (`POST https://openrouter.ai/api/alpha/decisions`) using structured `choice` questions and sample merchant descriptions
   - Fallback protection: if API is offline or unconfigured, preserves original category or sets to "Uncategorized" without failing upload
7. Saves transactions using `prisma.transaction.createMany({ skipDuplicates: true })` to prevent duplicates
8. Returns structured feedback to `UploadForm.tsx` (total imported, count auto-categorized, category mappings applied)

### Data Upsert Pattern

For monthly aggregated data, use upsert to create-or-update:
```ts
await prisma.tableData.upsert({
  where: { userId_date: { userId: session.user.id, date: normalizedDate } },
  update: { sectionValue: newValue },
  create: { userId: session.user.id, date: normalizedDate, sectionValue: newValue },
});
```

### Routing Structure

- `/` - Root page redirects to `/landing` (unauthenticated) or `/dashboard` (authenticated)
- `/dashboard` - Net worth tracking interface (main feature)
  - Query params: `?month=YYYY-MM` to view specific month
  - Server component that fetches sections + table data
- `/upload` - CSV upload and transaction viewer
  - Statement month selection
  - Category-based spending visualization (pie chart, table)
  - Transaction list with inline editing

## Key Patterns

### Server Action Template

When adding new server actions:
```ts
"use server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function myAction(input: { date: string }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Normalize dates to UTC when dealing with months
  const d = new Date(input.date);
  const normalized = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 15, 0, 0, 0, 0)
  );

  // Your logic here
}
```

### Import Aliases

- `@/` maps to project root (configured in `tsconfig.json`)
- Examples: `@/auth`, `@/app/lib/prisma`, `@/app/actions/financial`

### Styling

- Tailwind CSS with `tailwindcss-animate` plugin
- shadcn/ui components in `components/ui/`
- Global styles in `app/globals.css`

## UI/Styling Guidelines

**IMPORTANT**: When making UI changes or creating new components, always reference `UI_STYLE_GUIDE.md` for styling patterns and design tokens.

Key points for UI consistency:
- **Colors**: Use `#f4f0e1` for text, `#141414` for backgrounds, `#1E2228` for surfaces
- **Financial Indicators**: Green (`#00A896`) for assets, Red (`#7B0323`) for debts
- **Buttons**: Use `variant="primary"` for CTAs, `variant="secondary"` for alternatives, `variant="ghost"` for icon buttons
- **Forms**: Always use the standardized input styling with `bg-[#1E2228]`, `border-gray-600/700`, and `focus-visible:ring-[#f4f0e1]`
- **Spacing**: Use `gap-4` as default, `p-6` for card padding
- **Typography**: Inter font, use `font-medium` + `uppercase tracking-wide` for labels

See `UI_STYLE_GUIDE.md` for complete documentation of all styling patterns, component variants, and copy-paste examples.

## Important Constraints

### What NOT to do

- **Never instantiate PrismaClient directly** - always import from `app/lib/prisma.ts`
- **Never assume local timezones** - use UTC normalization for month-level operations
- **Never skip auth checks** - all server actions must validate `session?.user?.id`
- **Never modify NextAuth flow** without clear justification - it's wired into the app layout

### Transaction Uniqueness

The `Transaction` model enforces uniqueness on `[date, description, amount, userId]`. When importing CSVs:
- Use `createMany({ skipDuplicates: true })` to handle re-uploads
- The composite key prevents duplicate transactions from multiple uploads of the same statement

## Environment Variables

Required for local development (set in `.env` or `.env.local`):

- `DATABASE_URL` - PostgreSQL connection string (e.g., `postgresql://user:pass@localhost:5432/dbname`)
- `NEXTAUTH_SECRET` - Secret for signing session cookies/tokens
- `NEXTAUTH_URL` - Base URL for callbacks (e.g., `http://localhost:3000`)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

## Quick Local Setup

1. Set environment variables in `.env` file
2. `npm install` (automatically runs `prisma generate`)
3. `npm run dev` and open `http://localhost:3000`

## Testing Locally

- Run `npm run dev` and test via browser at `http://localhost:3000`
- For server action changes, test by using the relevant page (dashboard for financial actions, upload for transaction actions)
- Use Prisma Studio (`npx prisma studio`) to inspect database state

## File Organization Reference

```
app/
├── actions/           # Server actions (Prisma + auth logic)
├── components/        # Shared UI components
├── dashboard/         # Net worth tracking pages
├── upload/            # CSV upload and transaction pages
├── lib/              # Shared utilities (Prisma client, etc.)
├── types/            # TypeScript type definitions
└── utils/            # Helper functions (currency, dates, etc.)

prisma/
└── schema.prisma     # Database schema

auth.ts               # NextAuth configuration
components/ui/        # shadcn/ui components
```

## Common Tasks

### Adding a new server action
1. Create or edit file in `app/actions/`
2. Add `"use server"` directive at top
3. Import `auth` and `prisma`
4. Guard with session check
5. Use UTC dates for monthly operations

### Modifying database schema
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive_name` to create migration
3. Run `npm run prisma:generate` to update Prisma client types
4. Update TypeScript types in `app/types/` if needed

### Adding a new page
1. Create folder in `app/` with `page.tsx`
2. For authenticated pages, add session check and redirect pattern (see `app/dashboard/page.tsx`)
3. Use `export const dynamic = "force-dynamic"` if page depends on real-time data
