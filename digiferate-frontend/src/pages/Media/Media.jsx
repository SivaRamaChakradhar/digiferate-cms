
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Upload,
  Image as ImageIcon,
  Video,
  Trash2,
  X,
  Film,
  FileImage,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";
import {
  getAllMedia,
  uploadMedia,
  deleteMedia,
} from "../../services/mediaService";

const Media = () => {
  const [media, setMedia] = useState([]);
  const [contentItems, setContentItems] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedContent, setSelectedContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fileInputRef = useRef(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [mediaData, contentResponse] = await Promise.all([
        getAllMedia(),
        api.get("/content"),
      ]);

      setMedia(mediaData);
      setContentItems(contentResponse.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load media library."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredMedia = useMemo(() => {
    return media.filter((item) => {
      const type = String(item.assetType || "").toUpperCase();

      const matchesFilter =
        filter === "ALL" || type === filter;

      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        (item.fileName || "").toLowerCase().includes(query) ||
        (item.contentTitle || "").toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [media, filter, search]);

  const imageCount = media.filter(
    (item) => String(item.assetType).toUpperCase() === "IMAGE"
  ).length;

  const videoCount = media.filter(
    (item) => String(item.assetType).toUpperCase() === "VIDEO"
  ).length;

  const formatSize = (bytes) => {
    const size = Number(bytes || 0);

    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const isValidType =
      file.type.startsWith("image/") ||
      file.type.startsWith("video/");

    if (!isValidType) {
      alert("Please select an image or video file.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedContent || !selectedFile) {
      alert("Please select a content item and a file.");
      return;
    }

    try {
      setUploading(true);

      await uploadMedia(selectedContent, selectedFile);

      setShowUploadModal(false);
      setSelectedContent("");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadData();
    } catch (err) {
      alert(
        err.response?.data?.message || "Media upload failed."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete "${item.fileName || "this media"}"? This will also remove the file from Cloudinary.`
    );

    if (!confirmed) return;

    try {
      await deleteMedia(item.contentId, item.id);
      setMedia((previous) =>
        previous.filter((mediaItem) => mediaItem.id !== item.id)
      );
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to delete media."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Media Library
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage images and videos used in your digital signage content.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Upload size={16} />
            Upload Media
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Media</p>
            <FileImage className="text-blue-600" size={20} />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {media.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Images</p>
            <ImageIcon className="text-purple-600" size={20} />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {imageCount}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Videos</p>
            <Video className="text-orange-600" size={20} />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {videoCount}
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search media or content..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-2">
          {["ALL", "IMAGE", "VIDEO"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                filter === type
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {type === "ALL" ? "All" : type === "IMAGE" ? "Images" : "Videos"}
            </button>
          ))}
        </div>
      </div>

      {/* Media content */}
      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-gray-200 bg-white">
          <LoaderCircle className="animate-spin text-blue-600" size={28} />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={loadData}
            className="mt-3 text-sm font-semibold text-red-700 underline"
          >
            Try again
          </button>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Film className="text-gray-500" size={25} />
          </div>
          <h3 className="mt-4 font-semibold text-gray-900">
            No media found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload an image or video to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMedia.map((item) => {
            const isVideo =
              String(item.assetType).toUpperCase() === "VIDEO";

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-md"
              >
                <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gray-100">
                  {isVideo ? (
                    <video
                      src={item.url}
                      controls
                      preload="metadata"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.fileName || "Uploaded image"}
                      className="h-full w-full object-cover"
                    />
                  )}

                  <span className="absolute left-3 top-3 rounded-md bg-black/70 px-2 py-1 text-xs font-medium text-white">
                    {isVideo ? "VIDEO" : "IMAGE"}
                  </span>
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <h3
                      className="truncate text-sm font-semibold text-gray-900"
                      title={item.fileName}
                    >
                      {item.fileName || "Untitled media"}
                    </h3>
                    <p className="mt-1 truncate text-xs text-gray-500">
                      Content: {item.contentTitle}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatSize(item.sizeBytes)}</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>

                  <button
                    onClick={() => handleDelete(item)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Upload Media
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Select the content item to attach your file to.
                </p>
              </div>

              <button
                onClick={() => setShowUploadModal(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Content item
                </label>

                <select
                  value={selectedContent}
                  onChange={(event) => setSelectedContent(event.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Choose content</option>
                  {contentItems
                    .filter((content) => content.status !== "ARCHIVED")
                    .map((content) => (
                      <option key={content.id} value={content.id}>
                        {content.title || content.message || "Untitled content"}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Select image or video
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  required
                  className="w-full rounded-lg border border-gray-200 p-3 text-sm"
                />

                {selectedFile && (
                  <p className="mt-2 text-xs text-gray-500">
                    Selected: {selectedFile.name} (
                    {formatSize(selectedFile.size)})
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                    setSelectedContent("");
                  }}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading && (
                    <LoaderCircle size={16} className="animate-spin" />
                  )}
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Media;
