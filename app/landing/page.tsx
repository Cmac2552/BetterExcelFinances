import Link from "next/link";
import Image from "next/image";

export default async function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 text-white">
      <nav className="fixed w-full top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="flex justify-center items-end space-x-1 h-6">
              <div className="w-2 h-4 bg-emerald-500 rounded-t-sm"></div>
              <div className="w-2 h-5 bg-emerald-400 rounded-t-sm"></div>
              <div className="w-2 h-6 bg-emerald-500 rounded-t-sm"></div>
              <div className="w-2 h-4 bg-emerald-400 rounded-t-sm"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-slate-300 bg-clip-text text-transparent">
              BetterExcelFinances
            </span>
          </div>
          <Link
            href="/api/auth/signin?callbackUrl=/"
            className="px-6 py-2 rounded-lg font-medium text-slate-200 hover:text-white border border-white/20 hover:border-white/40 transition-all duration-300"
          >
            Sign In
          </Link>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                Financial clarity,{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-slate-300 bg-clip-text text-transparent">
                  finally simple
                </span>
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
                Stop drowning in spreadsheets. Get real-time insights into your
                finances with powerful analytics that actually make sense.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/api/auth/signin?callbackUrl=/"
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-slate-300 text-slate-900 rounded-lg font-semibold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 text-center"
              >
                Start for Free
              </Link>
            </div>

            <div className="pt-8 space-y-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-slate-300 bg-clip-text text-transparent">
                  10+ hours
                </span>
                <span className="text-slate-400">saved per month</span>
              </div>
              <p className="text-sm text-slate-500">
                Average time users save by leaving spreadsheets behind
              </p>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-3xl rounded-3xl"></div>
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src="/images/dashboard.png"
                alt="BetterExcelFinances Dashboard"
                width={800}
                height={600}
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-30"></div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="py-24 px-6 border-t border-white/5 bg-gradient-to-b from-transparent to-slate-900/50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-5xl font-bold">
              Powerful features that{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-slate-300 bg-clip-text text-transparent">
                actually work
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Everything you need to take control of your financial picture
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "📊",
                title: "Real-time Analytics",
                description:
                  "See your spending patterns and trends at a glance with beautiful, interactive charts",
              },
              {
                icon: "🎯",
                title: "Smart Categorization",
                description:
                  "Automatically organize transactions into meaningful categories for better insights",
              },

              {
                icon: "📈",
                title: "Budget Management",
                description:
                  "Set goals, track progress, and get alerts when you're approaching your limits",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-8 rounded-xl border border-white/10 hover:border-emerald-500/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:bg-gradient-to-br hover:from-slate-800 hover:to-slate-900 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold">Ready to take control?</h2>
            <p className="text-xl text-slate-400">
              Join others who've already transformed their financial lives.
            </p>
          </div>
          <Link
            href="/api/auth/signin?callbackUrl=/"
            className="inline-block group px-10 py-4 bg-gradient-to-r from-emerald-500 to-slate-300 text-slate-900 rounded-lg font-semibold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105"
          >
            Start for Free
          </Link>
        </div>
      </section>
    </div>
  );
}
