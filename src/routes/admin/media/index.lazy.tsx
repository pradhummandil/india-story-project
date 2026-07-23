import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  Upload,
  Copy,
  Trash2,
  Search,
  CheckCircle,
  X,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createLazyFileRoute("/admin/media/")({
  component: AdminMediaPage,
});

type MediaFile = { name: string; url: string; size: number; created_at: string };

export default function AdminMediaPage() {
  const navigate = useNavigate();
  const { user, session, initialized } = useAuthStore();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState<MediaFile | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);

  const fetchFiles = (cursor?: string) => {
    if (cursor) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    let url = "/api/admin/media";
    if (cursor) {
      url += `?nextCursor=${encodeURIComponent(cursor)}`;
    }

    fetch(url, {
      headers: {
        Authorization: session ? `Bearer ${session.access_token}` : "",
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: any) => {
        if (cursor) {
          setFiles((p) => [...p, ...(d.files ?? [])]);
        } else {
          setFiles(d.files ?? []);
        }
        setNextCursor(d.nextCursor ?? null);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch media from Cloudinary.");
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  };

  useEffect(() => {
    if (user && session) {
      fetchFiles();
    }
  }, [user, session]);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Delete this image permanently from Cloudinary?\nName: ${file.name}`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/media?publicId=${encodeURIComponent(file.name)}`, {
        method: "DELETE",
        headers: {
          Authorization: session ? `Bearer ${session.access_token}` : "",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Delete failed");
      }
      setFiles((p) => p.filter((f) => f.name !== file.name));
      if (previewImage?.name === file.name) {
        setPreviewImage(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete file.");
    }
  };

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setUploading(true);
    setError(null);
    const form = new FormData();
    Array.from(fileList).forEach((f) => form.append("files", f));
    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: {
          Authorization: session ? `Bearer ${session.access_token}` : "",
        },
        body: form,
      });
      const data: any = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }
      setFiles((p) => [...(data.files ?? []), ...p]);
    } catch (err: any) {
      setError(err.message || "Failed to upload image.");
    }
    setUploading(false);
  };

  const filtered = files.filter(
    (f) => !query || f.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <AdminLayout title="Media Library" subtitle={`${files.length} files`}>
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="media-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files…"
            className="pl-10 h-10 rounded-lg bg-background border-border text-foreground placeholder:text-muted-foreground/60 font-sans text-sm focus-visible:ring-primary/45"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-10 px-4 rounded-lg border-border hover:bg-muted text-muted-foreground hover:text-foreground font-sans text-xs uppercase tracking-widest gap-2 bg-card"
            onClick={() => fetchFiles()}
            disabled={loading}
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button
            id="media-upload-btn"
            className="h-10 px-4 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground font-sans text-xs uppercase tracking-widest gap-2 font-bold shadow-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="size-4" /> {uploading ? "Uploading…" : "Upload"}
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleUpload(e.target.files)}
        />
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-lg font-sans">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleUpload(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-xl mb-6 py-10 text-center transition-colors cursor-pointer bg-card ${
          dragOver ? "border-primary/60 bg-primary/5" : "border-border hover:border-primary/40"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="size-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm font-sans text-muted-foreground font-medium">
          Drag &amp; drop images here, or click to browse
        </p>
        <p className="text-xs font-sans text-muted-foreground/60 mt-1">PNG, JPG, WebP up to 10MB</p>
      </div>

      {/* Grid */}
      {loading && files.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground font-sans text-xs border border-dashed border-border p-8 rounded-xl bg-card">
          {files.length === 0
            ? "No media files yet. Upload images to get started."
            : "No files match your search."}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((file) => (
            <div
              key={file.name}
              className="group relative aspect-square bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 shadow-sm transition-all duration-300"
            >
              <img
                src={file.url}
                alt={file.name}
                className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                onClick={() => setPreviewImage(file)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-colors flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(file.url)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-sm transition-colors text-white"
                    title="Copy URL"
                  >
                    {copied === file.url ? (
                      <CheckCircle className="size-4 text-emerald-400" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setPreviewImage(file)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-sm transition-colors text-white"
                    title="Preview Image"
                  >
                    <ExternalLink className="size-4" />
                  </button>
                  <button
                    onClick={() => void handleDelete(file)}
                    className="p-2 bg-white/10 hover:bg-red-500/30 rounded-sm transition-colors text-white hover:text-red-400"
                    title="Delete Image"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <div className="absolute bottom-0 inset-x-0 px-2 py-1 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-white/60 font-sans truncate">
                  {file.name.replace("india_story_project/", "")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Load More Button */}
      {nextCursor && (
        <div className="text-center mt-10">
          <Button
            onClick={() => fetchFiles(nextCursor)}
            disabled={loadingMore}
            variant="outline"
            className="h-10 px-6 rounded-sm border-white/10 hover:border-gold/50 text-white font-sans text-xs uppercase tracking-widest bg-transparent"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-4xl w-full bg-[#161616] border border-white/15 rounded-sm p-4 flex flex-col">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/80 hover:bg-black text-white hover:text-red-400 transition-colors"
              title="Close"
            >
              <X className="size-4" />
            </button>
            <div className="aspect-video w-full overflow-hidden rounded-sm bg-black flex items-center justify-center">
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs text-white/40 font-sans uppercase font-bold tracking-wider">
                  Public ID / Name
                </p>
                <p className="text-sm text-white/80 font-mono truncate mt-0.5">
                  {previewImage.name}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  onClick={() => handleCopy(previewImage.url)}
                  variant="outline"
                  className="h-9 px-3 rounded-sm border-white/10 hover:bg-white/5 text-white/80 font-sans text-xs uppercase tracking-widest gap-2 bg-transparent"
                >
                  {copied === previewImage.url ? (
                    <>
                      <CheckCircle className="size-3.5 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" /> Copy Link
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => void handleDelete(previewImage)}
                  className="h-9 px-3 rounded-sm bg-red-600 hover:bg-red-700 text-white font-sans text-xs uppercase tracking-widest gap-2"
                >
                  <Trash2 className="size-3.5" /> Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
