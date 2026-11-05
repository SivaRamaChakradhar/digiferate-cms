import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Monitor,
  MapPin,
  Copy,
  Trash2,
  Link2,
  Unlink,
  X,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  Tv,
} from "lucide-react";

import {
  getScreens,
  createScreen,
  generatePairingCode,
  getScreenPairing,
  unpairScreen,
  deleteScreen,
} from "../../services/screenService";

const initialForm = {
  customName: "",
  area: "",
  city: "",
  state: "",
  country: "",
};

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong. Please try again."
  );
}

function StatusBadge({ status }) {
  const paired = status?.toUpperCase() === "PAIRED";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        paired
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          paired ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />
      {paired ? "Paired" : "Unpaired"}
    </span>
  );
}

function FormField({ label, name, value, onChange, placeholder }) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

export default function Screens() {
  const [screens, setScreens] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState(null);
  const [pairingCode, setPairingCode] = useState(null);
  const [pairingDetails, setPairingDetails] = useState(null);

  const showNotice = (type, message) => {
    setNotice({ type, message });
  };

  const fetchScreens = async () => {
    setLoading(true);

    try {
      const response = await getScreens();
      setScreens(response.data || []);
    } catch (error) {
      showNotice("error", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreens();
  }, []);

  const filteredScreens = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return screens;

    return screens.filter((screen) =>
      [
        screen.customName,
        screen.area,
        screen.city,
        screen.state,
        screen.country,
        screen.status,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [screens, search]);

  const pairedCount = screens.filter(
    (screen) => screen.status?.toUpperCase() === "PAIRED",
  ).length;

  const unpairedCount = screens.length - pairedCount;

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateScreen = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setNotice(null);

    try {
      const response = await createScreen(form);

      await fetchScreens();

      setForm(initialForm);
      setShowForm(false);

      showNotice(
        "success",
        response.message || "Screen created successfully.",
      );
    } catch (error) {
      showNotice("error", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateCode = async (screen) => {
    setActionId(screen.id);
    setNotice(null);
    setPairingCode(null);

    try {
      const response = await generatePairingCode(screen.id);

      setPairingCode({
        screenName: screen.customName,
        code: response.data?.code,
        expiresAt: response.data?.expiresAt,
      });

      showNotice(
        "success",
        response.message || "Pairing code generated successfully.",
      );
    } catch (error) {
      showNotice("error", getErrorMessage(error));
    } finally {
      setActionId(null);
    }
  };

  const handleCopyCode = async () => {
    if (!pairingCode?.code) return;

    try {
      await navigator.clipboard.writeText(pairingCode.code);
      showNotice("success", "Pairing code copied to clipboard.");
    } catch {
      showNotice("error", "Unable to copy the pairing code.");
    }
  };

  const handleViewPairing = async (screen) => {
    setActionId(screen.id);
    setPairingDetails(null);
    setNotice(null);

    try {
      const response = await getScreenPairing(screen.id);

      setPairingDetails({
        screenName: screen.customName,
        data: response.data,
      });
    } catch (error) {
      showNotice("error", getErrorMessage(error));
    } finally {
      setActionId(null);
    }
  };

  const handleUnpair = async (screen) => {
    const confirmed = window.confirm(
      `Are you sure you want to unpair "${screen.customName}"?`,
    );

    if (!confirmed) return;

    setActionId(screen.id);
    setNotice(null);

    try {
      const response = await unpairScreen(screen.id);

      setPairingDetails(null);
      setPairingCode(null);

      await fetchScreens();

      showNotice(
        "success",
        response.message || "Screen unpaired successfully.",
      );
    } catch (error) {
      showNotice("error", getErrorMessage(error));
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (screen) => {
    const confirmed = window.confirm(
      `Delete "${screen.customName}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setActionId(screen.id);
    setNotice(null);

    try {
      const response = await deleteScreen(screen.id);

      setScreens((previous) =>
        previous.filter((item) => item.id !== screen.id),
      );

      showNotice(
        "success",
        response.message || "Screen deleted successfully.",
      );
    } catch (error) {
      showNotice("error", getErrorMessage(error));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Screen Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Register, pair, and manage your digital signage screens.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm((previous) => !previous);
            setNotice(null);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          {showForm ? <X size={17} /> : <Plus size={17} />}
          {showForm ? "Close Form" : "Add New Screen"}
        </button>
      </div>

      {/* Notifications */}
      {notice && (
        <div
          className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
          )}
          <span>{notice.message}</span>
          <button
            onClick={() => setNotice(null)}
            className="ml-auto"
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total Screens"
          value={screens.length}
          icon={Monitor}
          iconStyle="bg-blue-50 text-blue-600"
        />
        <SummaryCard
          label="Paired Screens"
          value={pairedCount}
          icon={Link2}
          iconStyle="bg-emerald-50 text-emerald-600"
        />
        <SummaryCard
          label="Unpaired Screens"
          value={unpairedCount}
          icon={Unlink}
          iconStyle="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Create screen form */}
      {showForm && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Register a New Screen
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter the screen details to register a new device location.
            </p>
          </div>

          <form onSubmit={handleCreateScreen}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FormField
                label="Screen Name"
                name="customName"
                value={form.customName}
                onChange={handleFormChange}
                placeholder="e.g. Hotel Lobby TV"
              />

              <FormField
                label="Area"
                name="area"
                value={form.area}
                onChange={handleFormChange}
                placeholder="e.g. Main Lobby"
              />

              <FormField
                label="City"
                name="city"
                value={form.city}
                onChange={handleFormChange}
                placeholder="e.g. Hyderabad"
              />

              <FormField
                label="State"
                name="state"
                value={form.state}
                onChange={handleFormChange}
                placeholder="e.g. Telangana"
              />

              <FormField
                label="Country"
                name="country"
                value={form.country}
                onChange={handleFormChange}
                placeholder="e.g. India"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(initialForm);
                }}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <LoaderCircle size={16} className="animate-spin" />
                )}
                {submitting ? "Creating..." : "Create Screen"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Pairing code result */}
      {pairingCode && (
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Pairing code generated
              </p>
              <p className="mt-1 text-sm text-blue-700">
                Screen: {pairingCode.screenName}
              </p>
              <p className="mt-1 text-xs text-blue-600">
                Expires: {formatDate(pairingCode.expiresAt)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-lg border border-blue-200 bg-white px-4 py-2 font-mono text-2xl font-bold tracking-[0.25em] text-blue-800">
                {pairingCode.code || "—"}
              </span>

              <button
                onClick={handleCopyCode}
                disabled={!pairingCode.code}
                className="rounded-lg bg-blue-600 p-3 text-white hover:bg-blue-700 disabled:opacity-50"
                title="Copy pairing code"
              >
                <Copy size={18} />
              </button>

              <button
                onClick={() => setPairingCode(null)}
                className="rounded-lg border border-blue-200 bg-white p-3 text-blue-700 hover:bg-blue-100"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Pairing details */}
      {pairingDetails && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Pairing Details
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {pairingDetails.screenName}
              </p>
            </div>
            <button
              onClick={() => setPairingDetails(null)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              aria-label="Close pairing details"
            >
              <X size={18} />
            </button>
          </div>

          {pairingDetails.data ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <DetailItem
                label="Device Name"
                value={pairingDetails.data.device?.deviceName}
              />
              <DetailItem
                label="Device Model"
                value={pairingDetails.data.device?.deviceModel}
              />
              <DetailItem
                label="Paired At"
                value={formatDate(pairingDetails.data.pairedAt)}
              />
            </div>
          ) : (
            <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              No active device pairing exists for this screen.
            </p>
          )}
        </section>
      )}

      {/* Screen list */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">Registered Screens</h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage all your registered display devices.
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search screens..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              onClick={fetchScreens}
              disabled={loading}
              className="rounded-lg border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              title="Refresh screens"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-slate-500">
            <LoaderCircle size={19} className="animate-spin" />
            Loading screens...
          </div>
        ) : filteredScreens.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center px-4 text-center">
            <div className="mb-3 rounded-full bg-slate-100 p-4">
              <Tv size={25} className="text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-800">
              {search ? "No matching screens" : "No screens registered yet"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {search
                ? "Try a different search term."
                : "Create your first screen to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Screen</th>
                  <th className="px-5 py-4 font-semibold">Location</th>
                  <th className="px-5 py-4 font-semibold">Pairing Code</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Paired At</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredScreens.map((screen) => (
                  <tr
                    key={screen.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                          <Monitor size={19} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {screen.customName}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {screen.area || "Area not specified"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin size={14} className="text-slate-400" />
                        {[screen.city, screen.state, screen.country]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono text-slate-600">
                      {screen.pairingCode || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={screen.status} />
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {formatDate(screen.pairedAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {screen.status?.toUpperCase() === "PAIRED" ? (
                          <>
                            <ActionButton
                              icon={Monitor}
                              label="View pairing"
                              onClick={() => handleViewPairing(screen)}
                              loading={actionId === screen.id}
                            />
                            <ActionButton
                              icon={Unlink}
                              label="Unpair"
                              onClick={() => handleUnpair(screen)}
                              disabled={actionId === screen.id}
                            />
                          </>
                        ) : (
                          <ActionButton
                            icon={Link2}
                            label="Generate pairing code"
                            onClick={() => handleGenerateCode(screen)}
                            loading={actionId === screen.id}
                          />
                        )}

                        <ActionButton
                          icon={Trash2}
                          label="Delete screen"
                          onClick={() => handleDelete(screen)}
                          disabled={actionId === screen.id}
                          danger
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredScreens.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            Showing {filteredScreens.length} of {screens.length} screens
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, iconStyle }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`rounded-lg p-2.5 ${iconStyle}`}>
          <Icon size={19} />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  loading,
  disabled,
  danger,
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      title={label}
      aria-label={label}
      className={`rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "text-slate-400 hover:bg-red-50 hover:text-red-600"
          : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"
      }`}
    >
      {loading ? (
        <LoaderCircle size={17} className="animate-spin" />
      ) : (
        <Icon size={17} />
      )}
    </button>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value || "Not available"}
      </p>
    </div>
  );
}