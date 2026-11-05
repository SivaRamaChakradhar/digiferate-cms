import { useEffect, useMemo, useRef, useState } from "react";
import {
  Image as ImageIcon,
  Plus,
  Search,
  Upload,
  Trash2,
  Pencil,
  Power,
  X,
  RefreshCw,
  Wallpaper,
  Monitor,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  getWallpapers,
  uploadWallpaper,
  updateWallpaper,
  deleteWallpaper,
  updateWallpaperStatus,
} from "../../services/wallpaperService";

const Wallpapers = () => {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingWallpaper, setEditingWallpaper] = useState(null);

  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  const fileInputRef = useRef(null);

  const fetchWallpapers = async () => {
    try {
      setError("");
      const result = await getWallpapers();
      setWallpapers(result.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load wallpapers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallpapers();
  }, []);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const filteredWallpapers = useMemo(() => {
    return wallpapers.filter((wallpaper) =>
      (wallpaper.name || "")
        .toLowerCase()
        .includes(search.toLowerCase().trim())
    );
  }, [wallpapers, search]);

  const activeCount = wallpapers.filter((item) => item.isActive).length;

  const openCreateModal = () => {
    setEditingWallpaper(null);
    setName("");
    setFile(null);
    setPreview("");
    setModalOpen(true);
  };

  const openEditModal = (wallpaper) => {
    setEditingWallpaper(wallpaper);
    setName(wallpaper.name || "");
    setFile(null);
    setPreview("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingWallpaper(null);
    setName("");
    setFile(null);
    setPreview("");
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please select a JPEG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Please enter a wallpaper name.");
      return;
    }

    if (!editingWallpaper && !file) {
      setError("Please select an image.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingWallpaper) {
        await updateWallpaper(editingWallpaper.id, {
          name: name.trim(),
        });
      } else {
        await uploadWallpaper(name.trim(), file);
      }

      closeModal();
      await fetchWallpapers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save wallpaper."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (wallpaper) => {
    try {
      setActionId(wallpaper.id);
      setError("");

      await updateWallpaperStatus(
        wallpaper.id,
        !wallpaper.isActive
      );

      await fetchWallpapers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update wallpaper status."
      );
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (wallpaper) => {
    const confirmed = window.confirm(
      `Delete "${wallpaper.name}" permanently?`
    );

    if (!confirmed) return;

    try {
      setActionId(wallpaper.id);
      setError("");

      await deleteWallpaper(wallpaper.id);
      await fetchWallpapers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete wallpaper."
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Configuration</span>
            <span>/</span>
            <span className="text-gray-900">Wallpapers</span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            Wallpaper Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage the background images displayed on your screens.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700"
        >
          <Plus size={18} />
          Add Wallpaper
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Wallpapers"
          value={wallpapers.length}
          icon={<ImageIcon size={20} />}
          description="Images in your library"
        />

        <StatCard
          title="Active Wallpapers"
          value={activeCount}
          icon={<CheckCircle2 size={20} />}
          description="Currently enabled"
        />

        <StatCard
          title="Inactive Wallpapers"
          value={wallpapers.length - activeCount}
          icon={<Power size={20} />}
          description="Currently disabled"
        />
      </div>

      {/* Gallery */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Wallpaper Library
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Browse and manage your uploaded images.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search wallpapers..."
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <RefreshCw className="animate-spin text-gray-400" size={25} />
          </div>
        ) : filteredWallpapers.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-2xl bg-gray-100 p-4">
              <Wallpaper size={30} className="text-gray-500" />
            </div>

            <h3 className="font-semibold text-gray-900">
              {search ? "No matching wallpapers" : "No wallpapers yet"}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-gray-500">
              {search
                ? "Try another search term."
                : "Upload your first wallpaper to start building your library."}
            </p>

            {!search && (
              <button
                onClick={openCreateModal}
                className="mt-4 text-sm font-semibold text-gray-900 hover:underline"
              >
                Upload wallpaper
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredWallpapers.map((wallpaper) => (
              <div
                key={wallpaper.id}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  <img
                    src={wallpaper.imageUrl}
                    alt={wallpaper.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <span
                    className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
                      wallpaper.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {wallpaper.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-gray-900">
                        {wallpaper.name}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Added{" "}
                        {wallpaper.createdAt
                          ? new Date(wallpaper.createdAt).toLocaleDateString()
                          : "recently"}
                      </p>
                    </div>

                    <ImageIcon
                      size={18}
                      className="shrink-0 text-gray-400"
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
                    <button
                      onClick={() => openEditModal(wallpaper)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-2 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    <button
                      disabled={actionId === wallpaper.id}
                      onClick={() => handleToggleStatus(wallpaper)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-2 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
                    >
                      <Power size={14} />
                      {wallpaper.isActive ? "Disable" : "Enable"}
                    </button>

                    <button
                      disabled={actionId === wallpaper.id}
                      onClick={() => handleDelete(wallpaper)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-50 px-2 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upload/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingWallpaper ? "Edit Wallpaper" : "Add Wallpaper"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingWallpaper
                    ? "Update the wallpaper name."
                    : "Upload an image for your screens."}
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Wallpaper Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Hotel Lobby Background"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                />
              </div>

              {!editingWallpaper && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Wallpaper Image
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-gray-500 hover:bg-gray-50"
                  >
                    <Upload size={25} className="mb-3 text-gray-500" />

                    <span className="text-sm font-semibold text-gray-800">
                      {file ? file.name : "Click to choose an image"}
                    </span>

                    <span className="mt-1 text-xs text-gray-500">
                      JPEG, PNG or WebP · Maximum 10 MB
                    </span>
                  </button>

                  {preview && (
                    <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
                      <img
                        src={preview}
                        alt="Wallpaper preview"
                        className="max-h-52 w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <RefreshCw size={15} className="animate-spin" />
                  )}
                  {saving
                    ? "Saving..."
                    : editingWallpaper
                      ? "Save Changes"
                      : "Upload Wallpaper"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, description }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="rounded-xl bg-gray-100 p-3 text-gray-700">
        {icon}
      </div>

      <span className="text-2xl font-bold text-gray-900">{value}</span>
    </div>

    <h3 className="mt-4 text-sm font-semibold text-gray-800">{title}</h3>
    <p className="mt-1 text-xs text-gray-500">{description}</p>
  </div>
);

export default Wallpapers;
