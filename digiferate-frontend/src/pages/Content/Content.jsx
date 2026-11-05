
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  FileText,
  Image,
  Video,
  Archive,
  Pencil,
  X,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import {
  getContent,
  createContent,
  updateContent,
  archiveContent,
} from "../../services/contentService";

const Content = () => {
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    title: "",
    message: "",
  });

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getContent();
      setContentItems(result.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load content."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const filteredContent = useMemo(() => {
    return contentItems.filter((item) => {
      const query = search.toLowerCase();

      const matchesSearch =
        (item.title || "").toLowerCase().includes(query) ||
        (item.message || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [contentItems, search, statusFilter]);

  const stats = {
    total: contentItems.length,
    published: contentItems.filter(
      (item) => item.status === "PUBLISHED"
    ).length,
    draft: contentItems.filter(
      (item) => item.status === "DRAFT"
    ).length,
    archived: contentItems.filter(
      (item) => item.status === "ARCHIVED"
    ).length,
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({ title: "", message: "" });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title || "",
      message: item.message || "",
    });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setForm({ title: "", message: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim() && !form.message.trim()) {
      setError("Enter a title or message.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingItem) {
        await updateContent(editingItem.id, {
          title: form.title.trim() || null,
          message: form.message.trim() || null,
        });
        setSuccess("Content updated successfully.");
      } else {
        await createContent({
          title: form.title.trim() || undefined,
          message: form.message.trim() || undefined,
        });
        setSuccess("Content created successfully.");
      }

      closeModal();
      await fetchContent();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save content."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (item) => {
    const confirmed = window.confirm(
      `Archive "${item.title || "Untitled content"}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await archiveContent(item.id);
      setSuccess("Content archived successfully.");
      await fetchContent();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to archive content."
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getAssetCount = (item) => item.assets?.length || 0;

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Content Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and organize content for your digital screens.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Plus size={18} />
          Create Content
        </button>
      </div>

      {/* Notifications */}
      {error && !showModal && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Content",
            value: stats.total,
            icon: FileText,
            color: "bg-indigo-50 text-indigo-600",
          },
          {
            label: "Published",
            value: stats.published,
            icon: FileText,
            color: "bg-green-50 text-green-600",
          },
          {
            label: "Drafts",
            value: stats.draft,
            icon: Pencil,
            color: "bg-amber-50 text-amber-600",
          },
          {
            label: "Archived",
            value: stats.archived,
            icon: Archive,
            color: "bg-slate-100 text-slate-600",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {stat.label}
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {stat.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content listing */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">
              All Content
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Manage your text, images and video content.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search content..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              <option value="ALL">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <button
              onClick={fetchContent}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500">
            <LoaderCircle className="animate-spin" size={20} />
            Loading content...
          </div>
        ) : filteredContent.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
            <div className="rounded-2xl bg-slate-100 p-4">
              <FileText size={30} className="text-slate-400" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-700">
              No content found
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Create your first content item or change your search filters.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Create Content
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Content</th>
                  <th className="px-6 py-4 font-semibold">Assets</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Created</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredContent.map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">
                        {item.title || "Untitled content"}
                      </div>
                      <p className="mt-1 max-w-sm truncate text-sm text-slate-500">
                        {item.message || "No message"}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Image size={16} />
                        {getAssetCount(item)}
                        <span className="text-slate-400">assets</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.status === "PUBLISHED"
                            ? "bg-green-50 text-green-700"
                            : item.status === "ARCHIVED"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(item.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          disabled={item.status === "ARCHIVED"}
                          title="Edit content"
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Pencil size={17} />
                        </button>

                        {item.status !== "ARCHIVED" && (
                          <button
                            onClick={() => handleArchive(item)}
                            title="Archive content"
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Archive size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (
          <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-500">
            Showing {filteredContent.length} of {contentItems.length} content items
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {editingItem ? "Edit Content" : "Create Content"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Add a title and message for your screen content.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Content Title
                </label>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="e.g. Welcome to Grand Hotel"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Message
                </label>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  placeholder="Write the message you want to display..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving && (
                    <LoaderCircle size={16} className="animate-spin" />
                  )}
                  {editingItem ? "Save Changes" : "Create Content"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Content;
