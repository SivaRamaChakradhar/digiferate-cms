
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  FolderOpen,
  Images,
  Upload,
  Image as ImageIcon,
  Pencil,
  Trash2,
  X,
  Loader2,
  ChevronRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Building2,
  ImagePlus,
} from "lucide-react";

import {
  getFacilityCategories,
  createFacilityCategory,
  updateFacilityCategory,
  deleteFacilityCategory,
  getFacilityImages,
  uploadFacilityImage,
  updateFacilityImage,
  deleteFacilityImage,
} from "../../services/facilityService";

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Something went wrong. Please try again.";

const normalizeList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.categories)) return response.categories;
  if (Array.isArray(response?.images)) return response.images;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const loadFacilityCategories = async () =>
  normalizeList(await getFacilityCategories());

const getImageUrl = (image) =>
  image.imageUrl || image.url || image.secureUrl || "";

function Facilities() {
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingImages, setLoadingImages] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [imageSearch, setImageSearch] = useState("");

  const [categoryModal, setCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  const [uploadModal, setUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [editingImage, setEditingImage] = useState(null);
  const [imageName, setImageName] = useState("");

  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      setError("");

      setCategories(await loadFacilityCategories());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    loadFacilityCategories()
      .then((list) => {
        if (!cancelled) setCategories(list);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoadingCategories(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const fetchImages = async (categoryId) => {
    try {
      setLoadingImages(true);
      setError("");

      const response = await getFacilityImages(categoryId);
      setImages(normalizeList(response));
    } catch (err) {
      setImages([]);
      setError(getErrorMessage(err));
    } finally {
      setLoadingImages(false);
    }
  };

  const openCategory = (category) => {
    setSelectedCategory(category);
    setImageSearch("");
    fetchImages(category.id);
  };

  const closeCategory = () => {
    setSelectedCategory(null);
    setImages([]);
    setImageSearch("");
    setError("");
  };

  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setCategoryModal(true);
  };

  const openEditCategory = (category, event) => {
    event?.stopPropagation();

    setEditingCategory(category);
    setCategoryName(category.name || "");
    setCategoryDescription(category.description || "");
    setCategoryModal(true);
  };

  const handleSaveCategory = async (event) => {
    event.preventDefault();

    if (!categoryName.trim()) return;

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        name: categoryName.trim(),
        description: categoryDescription.trim(),
      };

      if (editingCategory) {
        await updateFacilityCategory(editingCategory.id, payload);
      } else {
        await createFacilityCategory(payload);
      }

      setCategoryModal(false);
      await fetchCategories();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (category, event) => {
    event?.stopPropagation();

    const confirmed = window.confirm(
      `Delete "${category.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError("");
      await deleteFacilityCategory(category.id);

      if (selectedCategory?.id === category.id) {
        closeCategory();
      }

      await fetchCategories();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const resetUpload = () => {
    setUploadModal(false);
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG, PNG and WebP images are supported.");
      setSelectedFile(null);
      setPreviewUrl("");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB.");
      setSelectedFile(null);
      setPreviewUrl("");
      event.target.value = "";
      return;
    }

    setError("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadImage = async (event) => {
    event.preventDefault();

    if (!selectedFile || !selectedCategory) return;

    try {
      setSubmitting(true);
      setError("");

      await uploadFacilityImage(selectedCategory.id, selectedFile);

      resetUpload();
      await fetchImages(selectedCategory.id);
      await fetchCategories();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openEditImage = (image) => {
    setEditingImage(image);
    setImageName(image.title || image.name || image.fileName || "");
  };

  const handleUpdateImage = async (event) => {
    event.preventDefault();

    if (!editingImage) return;

    try {
      setSubmitting(true);
      setError("");

      await updateFacilityImage(editingImage.id, {
        title: imageName.trim(),
      });

      setEditingImage(null);
      await fetchImages(selectedCategory.id);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleImageStatus = async (image) => {
    try {
      setError("");

      await updateFacilityImage(image.id, {
        isActive: !image.isActive,
      });

      await fetchImages(selectedCategory.id);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteImage = async (image) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteFacilityImage(image.id);
      await fetchImages(selectedCategory.id);
      await fetchCategories();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      (category.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const filteredImages = useMemo(() => {
    return images.filter((image) =>
      (image.title || image.name || image.fileName || "")
        .toLowerCase()
        .includes(imageSearch.toLowerCase())
    );
  }, [images, imageSearch]);

  const totalImages = categories.reduce(
    (total, category) =>
      total + (category._count?.images || category.images?.length || 0),
    0
  );

  const activeImages = images.filter((image) => image.isActive).length;

  const formatDate = (date) => {
    if (!date) return "Recently uploaded";

    return new Date(date).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-7 pb-10">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <Building2 size={15} />
            <span>Content Management</span>
            <ChevronRight size={14} />
            <span className="text-gray-900">Facilities</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Facility Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Organize and manage hotel facility images by category.
          </p>
        </div>

        {!selectedCategory && (
          <button
            onClick={openCreateCategory}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Category
          </button>
        )}

        {selectedCategory && (
          <button
            onClick={() => {
              setSelectedFile(null);
              setPreviewUrl("");
              setUploadModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Upload size={18} />
            Upload Image
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {/* Category overview */}
      {!selectedCategory && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={<FolderOpen size={21} />}
              label="Total Categories"
              value={categories.length}
              color="blue"
            />
            <StatCard
              icon={<Images size={21} />}
              label="Total Images"
              value={totalImages}
              color="purple"
            />
            <StatCard
              icon={<ImageIcon size={21} />}
              label="Image Categories"
              value={categories.filter(
                (category) =>
                  (category._count?.images ??
                    category.images?.length ??
                    0) > 0
              ).length}
              color="emerald"
            />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Facility Categories
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Select a category to manage its images.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {loadingCategories ? (
              <LoadingState label="Loading facility categories..." />
            ) : filteredCategories.length === 0 ? (
              <EmptyState
                icon={<FolderOpen size={30} />}
                title="No categories found"
                description="Create your first facility category to get started."
                action={
                  <button
                    onClick={openCreateCategory}
                    className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Create Category
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredCategories.map((category) => {
                  const count =
                    category._count?.images ??
                    category.images?.length ??
                    0;

                  return (
                    <div
                      key={category.id}
                      onClick={() => openCategory(category)}
                      className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
                    >
                      <div className="flex h-36 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                          <FolderOpen size={30} />
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-gray-900">
                              {category.name}
                            </h3>
                            <p className="mt-1 line-clamp-2 min-h-10 text-sm text-gray-500">
                              {category.description ||
                                "Manage images in this category."}
                            </p>
                          </div>

                          <ChevronRight
                            size={19}
                            className="shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
                          />
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                          <span className="text-xs font-medium text-gray-500">
                            {count} {count === 1 ? "image" : "images"}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(event) =>
                                openEditCategory(category, event)
                              }
                              title="Edit category"
                              className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              onClick={(event) =>
                                handleDeleteCategory(category, event)
                              }
                              title="Delete category"
                              className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Selected category gallery */}
      {selectedCategory && (
        <>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <button
              onClick={closeCategory}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600"
            >
              <ArrowLeft size={16} />
              Back to categories
            </button>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedCategory.name}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedCategory.description ||
                    "Manage images for this facility category."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-lg bg-blue-50 px-3 py-2 font-medium text-blue-700">
                  {images.length} Total Images
                </span>
                <span className="rounded-lg bg-green-50 px-3 py-2 font-medium text-green-700">
                  {activeImages} Active
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Facility Image Gallery
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  View and manage uploaded images.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={imageSearch}
                  onChange={(e) => setImageSearch(e.target.value)}
                  placeholder="Search images..."
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {loadingImages ? (
              <LoadingState label="Loading facility images..." />
            ) : filteredImages.length === 0 ? (
              <EmptyState
                icon={<Images size={30} />}
                title="No images yet"
                description="Upload facility photos to populate this category."
                action={
                  <button
                    onClick={() => setUploadModal(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Upload size={16} />
                    Upload First Image
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-md"
                  >
                    <div className="group relative h-48 overflow-hidden bg-gray-100">
                      {getImageUrl(image) ? (
                        <img
                          src={getImageUrl(image)}
                          alt={
                            image.title ||
                            image.name ||
                            image.fileName ||
                            "Facility"
                          }
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                          <ImageIcon size={35} />
                        </div>
                      )}

                      <span
                        className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          image.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {image.isActive ? "Active" : "Inactive"}
                      </span>

                      <button
                        onClick={() => handleToggleImageStatus(image)}
                        title={
                          image.isActive ? "Deactivate image" : "Activate image"
                        }
                        className="absolute right-3 top-3 rounded-lg bg-white/90 p-2 text-gray-700 shadow-sm hover:bg-white"
                      >
                        {image.isActive ? (
                          <Eye size={16} />
                        ) : (
                          <EyeOff size={16} />
                        )}
                      </button>
                    </div>

                    <div className="p-4">
                      <h4 className="truncate text-sm font-semibold text-gray-900">
                        {image.title ||
                          image.name ||
                          image.fileName ||
                          "Facility image"}
                      </h4>

                      <p className="mt-1 text-xs text-gray-500">
                        Uploaded {formatDate(image.createdAt)}
                      </p>

                      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                        <button
                          onClick={() => openEditImage(image)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteImage(image)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
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
          </div>
        </>
      )}

      {/* Category create/edit modal */}
      {categoryModal && (
        <Modal
          title={editingCategory ? "Edit Category" : "Create Category"}
          onClose={() => setCategoryModal(false)}
        >
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <FormField label="Category Name">
              <input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. In-room Dining"
                required
                maxLength={80}
                className="form-input"
              />
            </FormField>

            <FormField label="Description (Optional)">
              <textarea
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Describe this facility category..."
                rows={3}
                className="form-input resize-none"
              />
            </FormField>

            <ModalActions
              onCancel={() => setCategoryModal(false)}
              loading={submitting}
              submitLabel={editingCategory ? "Save Changes" : "Create Category"}
            />
          </form>
        </Modal>
      )}

      {/* Image upload modal */}
      {uploadModal && (
        <Modal title="Upload Facility Image" onClose={resetUpload}>
          <form onSubmit={handleUploadImage} className="space-y-4">
            <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Uploading to: <strong>{selectedCategory?.name}</strong>
            </div>

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
              className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Selected preview"
                  className="mb-3 max-h-48 rounded-lg object-contain"
                />
              ) : (
                <ImagePlus size={35} className="mb-3 text-blue-600" />
              )}

              <span className="text-sm font-semibold text-gray-800">
                {selectedFile ? selectedFile.name : "Choose an image"}
              </span>
              <span className="mt-1 text-xs text-gray-500">
                JPEG, PNG or WebP · Maximum 10MB
              </span>
            </button>

            {selectedFile && (
              <p className="text-xs text-gray-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}

            <ModalActions
              onCancel={resetUpload}
              loading={submitting}
              submitLabel="Upload Image"
              disabled={!selectedFile}
            />
          </form>
        </Modal>
      )}

      {/* Image edit modal */}
      {editingImage && (
        <Modal
          title="Edit Image Details"
          onClose={() => setEditingImage(null)}
        >
          <form onSubmit={handleUpdateImage} className="space-y-4">
            <FormField label="Image Name">
              <input
                value={imageName}
                onChange={(e) => setImageName(e.target.value)}
                placeholder="Enter image name"
                required
                className="form-input"
              />
            </FormField>

            <ModalActions
              onCancel={() => setEditingImage(null)}
              loading={submitting}
              submitLabel="Save Changes"
            />
          </form>
        </Modal>
      )}

      <style>{`
        .form-input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 11px 13px;
          font-size: 14px;
          color: #111827;
          outline: none;
          background: white;
        }
        .form-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  );
}

function LoadingState({ label }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-gray-500">
      <Loader2 size={27} className="animate-spin text-blue-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center text-center">
      <div className="mb-4 rounded-2xl bg-gray-100 p-4 text-gray-500">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
      {action}
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={19} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({
  onCancel,
  loading,
  submitLabel,
  disabled = false,
}) {
  return (
    <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={loading || disabled}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {submitLabel}
      </button>
    </div>
  );
}

export default Facilities;
