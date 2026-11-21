import Link from "next/link";
import { ArrowRight, ArrowUpRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroProductDemo } from "./components/HeroProductDemo";
import {
  RulesSandboxCard,
  MonthRolloverCard,
  CsvNormalizationCard,
  NetWorthTrajectoryCard,
} from "./components/BentoDemos";

interface Props {
  readonly searchParams: Promise<{
    error?: string;
  }>;
}

export default async function LandingPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const isSignupsClosed = error === "SignupsClosed";

  return (
    <div className="min-h-screen bg-[#141414] text-[#f4f0e1] selection:bg-[#00A896]/30 selection:text-[#f4f0e1]">
      {/* Subtle Architectural Grid Backdrop (top hero region only) */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[640px] landing-grid [mask-image:radial-gradient(ellipse_75%_65%_at_50%_0%,#000_45%,transparent_100%)]" />

      {/* Sticky Minimal Navigation */}
      <header className="sticky top-0 z-50 border-b border-[#f4f0e1]/[0.08] bg-[#141414]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link
            href="/landing"
            className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4f0e1] rounded-md"
          >
            {/* Geometric ledger mark in brand colors */}
            <div className="flex h-7 w-7 items-end justify-center gap-[3px] rounded-md border border-[#f4f0e1]/[0.12] bg-[#1E2228] p-1.5">
              <span className="h-2 w-1 rounded-[1px] bg-[#7B0323]" />
              <span className="h-3 w-1 rounded-[1px] bg-[#f4f0e1]/75" />
              <span className="h-4 w-1 rounded-[1px] bg-[#00A896]" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-[#f4f0e1]">
              BetterExcelFinances
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-xs font-medium text-[#f4f0e1]/60 md:flex">
            <a
              href="#preview"
              className="transition-colors hover:text-[#f4f0e1]"
            >
              Live Preview
            </a>
            <a
              href="#capabilities"
              className="transition-colors hover:text-[#f4f0e1]"
            >
              Capabilities
            </a>
            <a
              href="#workflow"
              className="transition-colors hover:text-[#f4f0e1]"
            >
              Workflow
            </a>
          </nav>

          <Button asChild variant="primary" size="sm" className="px-4">
            <Link href="/api/auth/signin?callbackUrl=/">
              Open App
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="relative">
        {/* Hero Section */}
        <section className="px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          {isSignupsClosed && (
            <div className="mx-auto mb-10 max-w-2xl rounded-xl border border-amber-500/35 bg-[#1E2228] px-5 py-3.5 text-center shadow-lg">
              <p className="text-sm font-semibold text-amber-200">
                We are not currently accepting any more users.
              </p>
              <p className="mt-1 text-xs text-amber-200/70">
                Existing users can still sign in with their registered Google
                account.
              </p>
            </div>
          )}

          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f4f0e1]/[0.1] bg-[#1E2228]/80 px-3.5 py-1 text-xs text-[#f4f0e1]/80">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00A896]" />
              <span>AI merchant-level categorization</span>
            </div>

            <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-[#f4f0e1] sm:text-6xl sm:leading-[1.06]">
              Personal finance, built like a real ledger.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-[#f4f0e1]/65 sm:text-lg">
              Track assets and debts month by month, drop in your credit card
              statements, and let AI categorize every merchant using your own
              plain-English rules.
            </p>

            <div className="mt-8 flex items-center justify-center">
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="h-11 px-6 text-sm"
              >
                <a href="#capabilities">Check out the Rules Sandbox</a>
              </Button>
            </div>

            {/* Quiet factual capability strip — no vanity metrics */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] text-[#f4f0e1]/45">
              <span>Credit Card Statement CSVs</span>
              <span className="hidden text-[#f4f0e1]/20 sm:inline">•</span>
              <span>Custom per-category AI notes</span>
              <span className="hidden text-[#f4f0e1]/20 sm:inline">•</span>
              <span>No bank password sharing</span>
            </div>
          </div>

          {/* Interactive Framed App Stage */}
          <div id="preview" className="mt-14 scroll-mt-24 sm:mt-16">
            <HeroProductDemo />
          </div>
        </section>

        {/* Architectural Bento Grid — Interactive Product Demos */}
        <section
          id="capabilities"
          className="scroll-mt-20 border-t border-[#f4f0e1]/[0.08] px-6 py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <span className="font-mono text-xs uppercase tracking-widest text-[#00A896]">
                Capabilities
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#f4f0e1] sm:text-4xl">
                Everything a great finance spreadsheet does, without the formula
                rot.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#f4f0e1]/60">
                Built around the monthly review ritual: snapshot your net worth,
                upload your statements, and inspect where every dollar went.
              </p>
            </div>

            {/* 1px-hairline shared-border architectural bento */}
            <div className="mt-12 overflow-hidden rounded-2xl border border-[#f4f0e1]/[0.08] bg-[#1E2228]/35">
              <div className="grid grid-cols-1 divide-y divide-[#f4f0e1]/[0.08] lg:grid-cols-12 lg:divide-y-0">
                <div className="lg:col-span-7 lg:border-r lg:border-b lg:border-[#f4f0e1]/[0.08]">
                  <RulesSandboxCard />
                </div>
                <div className="lg:col-span-5 lg:border-b lg:border-[#f4f0e1]/[0.08]">
                  <MonthRolloverCard />
                </div>
                <div className="lg:col-span-5 lg:border-r lg:border-[#f4f0e1]/[0.08]">
                  <CsvNormalizationCard />
                </div>
                <div className="lg:col-span-7">
                  <NetWorthTrajectoryCard />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Step Workflow Strip */}
        <section
          id="workflow"
          className="scroll-mt-20 border-t border-[#f4f0e1]/[0.08] px-6 py-20 sm:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#00A896]">
                  Monthly Workflow
                </span>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#f4f0e1]">
                  Five minutes at the end of every month.
                </h2>
              </div>
              <p className="max-w-sm text-sm text-[#f4f0e1]/55">
                No fragile Plaid disconnects. Just your exported statements and
                a balance sheet you completely control.
              </p>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[#f4f0e1]/[0.08] bg-[#f4f0e1]/[0.08] md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Set categories & personal notes",
                  body: 'Create your own budget buckets and tell the AI your preferences once — like "Costco always goes under Groceries" or "Flights go under Vacation".',
                },
                {
                  step: "02",
                  title: "Upload your credit card statements",
                  body: "Drop in your credit card statement CSVs. Formats auto-detect, duplicates skip safely, and every merchant routes to the right category.",
                },
                {
                  step: "03",
                  title: "Update balances & review trends",
                  body: "Roll last month's accounts forward in one click, adjust balances, and watch your assets, debts, and net worth compound over time.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex flex-col justify-between bg-[#141414] p-7"
                >
                  <div>
                    <span className="font-mono text-xs font-semibold text-[#00A896]">
                      {item.step}
                    </span>
                    <h3 className="mt-4 text-lg font-semibold tracking-tight text-[#f4f0e1]">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-[#f4f0e1]/60">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="border-t border-[#f4f0e1]/[0.08] px-6 py-20 sm:py-28">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-[#f4f0e1]/[0.1] bg-[#1A1D22] px-6 py-14 text-center sm:px-12">
            {/* Subtle top hairline accent */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00A896]/60 to-transparent" />

            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#f4f0e1]/[0.08] bg-[#141414] px-3 py-1 font-mono text-[11px] text-[#f4f0e1]/65">
              <Lock className="h-3 w-3 text-[#00A896]" />
              <span>Private by design · CSV-first · No bank logins</span>
            </div>

            <h2 className="mt-5 text-balance text-3xl font-bold tracking-tight text-[#f4f0e1] sm:text-4xl">
              Leave the broken spreadsheet behind.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#f4f0e1]/60 sm:text-base">
              Sign in with Google to set up your categories, import your first
              statement, and build a net worth history you actually trust.
            </p>

            <div className="mt-8 flex justify-center">
              <Button
                asChild
                variant="primary"
                size="lg"
                className="h-11 px-8 text-sm font-semibold"
              >
                <Link href="/api/auth/signin?callbackUrl=/">
                  Start Tracking
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-[#f4f0e1]/[0.08] px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-[#f4f0e1]/45 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#f4f0e1]/75">
              BetterExcelFinances
            </span>
            <span>·</span>
            <span>Personal balance sheet &amp; AI spending ledger</span>
          </div>
          <Link
            href="/api/auth/signin?callbackUrl=/"
            className="transition-colors hover:text-[#f4f0e1]"
          >
            Sign In
          </Link>
        </div>
      </footer>
    </div>
  );
}
