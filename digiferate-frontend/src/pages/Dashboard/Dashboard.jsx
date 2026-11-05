import {
  Monitor,
  Images,
  Users,
  HardDrive,
} from "lucide-react";

const stats = [
  {
    title: "Total Screens",
    value: "0",
    description: "Screens registered",
    icon: Monitor,
  },
  {
    title: "Active Media",
    value: "0",
    description: "Media files available",
    icon: Images,
  },
  {
    title: "Total Visitors",
    value: "0",
    description: "Audience engagement",
    icon: Users,
  },
  {
    title: "Storage Used",
    value: "0 GB",
    description: "Cloud storage",
    icon: HardDrive,
  },
];

function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here's an overview of your digital signage platform.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <Icon size={21} />
                </div>
              </div>

              <h2 className="mt-5 text-3xl font-bold text-slate-900">
                {stat.value}
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
          <h3 className="font-semibold text-slate-800">
            Audience Overview
          </h3>

          <div className="flex min-h-64 items-center justify-center">
            <p className="text-sm text-slate-400">
              Analytics will appear here.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-800">
            Screen Status
          </h3>

          <div className="flex min-h-64 items-center justify-center">
            <p className="text-sm text-slate-400">
              Screen statistics will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;