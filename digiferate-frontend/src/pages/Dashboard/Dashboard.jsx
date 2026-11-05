
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Monitor,
  Images,
  HardDrive,
  CheckCircle2,
  CircleDashed,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

const getList = (response) => {
  const body = response?.data;

  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.data?.data)) return body.data.data;

  return [];
};

const isPaired = (screen) => {
  if (screen.isPaired === true || screen.isPaired === false) {
    return screen.isPaired;
  }

  if (screen.pairedAt || screen.paired_at) return true;

  const status = String(screen.status || "").toLowerCase();

  return ["paired", "active", "connected"].includes(status);
};

const formatStorage = (bytes) => {
  if (!bytes || bytes <= 0) return "0 MB";

  const gb = bytes / (1024 ** 3);

  if (gb >= 1) return `${gb.toFixed(2)} GB`;

  const mb = bytes / (1024 ** 2);
  return `${mb.toFixed(2)} MB`;
};

function Dashboard() {
  const [screens, setScreens] = useState([]);
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      api.get("/screens"),
      api.get("/content"),
    ]);

    const errors = [];

    if (results[0].status === "fulfilled") {
      setScreens(getList(results[0].value));
    } else {
      console.error("Failed to fetch screens:", results[0].reason);
      errors.push("screens");
    }

    if (results[1].status === "fulfilled") {
      setContentItems(getList(results[1].value));
    } else {
      console.error("Failed to fetch content:", results[1].reason);
      errors.push("content");
    }

    if (errors.length === 2) {
      setError("Unable to load dashboard data. Please check your backend connection.");
    } else if (errors.length > 0) {
      setError(`Some dashboard information could not be loaded: ${errors.join(" and ")}.`);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const pairedScreens = useMemo(
    () => screens.filter(isPaired).length,
    [screens]
  );

  const mediaAssets = useMemo(
    () => contentItems.flatMap((content) => content.assets || []),
    [contentItems]
  );

  const storageBytes = useMemo(
    () =>
      mediaAssets.reduce(
        (total, asset) =>
          total +
          Number(asset.sizeBytes || asset.size_bytes || asset.size || 0),
        0
      ),
    [mediaAssets]
  );

  const stats = [
    {
      title: "Total Screens",
      value: screens.length,
      description: "Screens registered",
      icon: Monitor,
    },
    {
      title: "Paired Screens",
      value: pairedScreens,
      description: "Successfully connected",
      icon: CheckCircle2,
    },
    {
      title: "Active Media",
      value: mediaAssets.length,
      description: "Media files available",
      icon: Images,
    },
    {
      title: "Storage Used",
      value: formatStorage(storageBytes),
      description: "Based on uploaded media",
      icon: HardDrive,
    },
  ];

  const unpairedScreens = screens.length - pairedScreens;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here's an overview of your digital signage platform.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

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
                {loading ? "..." : stat.value}
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

          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <div className="mb-3 rounded-full bg-slate-100 p-4 text-slate-400">
              <Images size={28} />
            </div>
            <p className="text-sm font-medium text-slate-600">
              No audience analytics available
            </p>
            <p className="mt-1 max-w-sm text-xs text-slate-400">
              Audience traffic and demographics will appear here
              once the required analytics data is integrated.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-800">
            Screen Status
          </h3>

          <div className="mt-6 space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  Paired
                </span>
                <span className="font-semibold text-slate-800">
                  {loading ? "..." : pairedScreens}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${screens.length ? (pairedScreens / screens.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <CircleDashed size={16} className="text-amber-500" />
                  Unpaired
                </span>
                <span className="font-semibold text-slate-800">
                  {loading ? "..." : unpairedScreens}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{
                    width: `${screens.length ? (unpairedScreens / screens.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-500">
                Total registered screens
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {loading ? "..." : screens.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
