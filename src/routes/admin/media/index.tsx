import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { Upload, Copy, Trash2, Search, CheckCircle } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuthStore } from "@/lib/auth-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/media/")({
  head: () => ({ meta: [{ title: "Media Library — Admin" }] }),
  component: AdminMediaPage,
});

type MediaFile = { name: string; url: string; size: number; created_at: string };

export default function AdminMediaPage() {
  const navigate = useNavigate();
  const { user, initialized } = useAuthStore();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialized && !user) void navigate({ to: "/login" });
  }, [user, initialized, navigate]);
  useEffect(() => {
    if (!user) return;
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((d: any) => setFiles(d.files ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };
  const handleDelete = async (name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    await fetch(`/api/admin/media?name=${encodeURIComponent(name)}`, { method: "DELETE" });
    setFiles((p) => p.filter((f) => f.name !== name));
  };
  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setUploading(true);
    const form = new FormData();
    Array.from(fileList).forEach((f) => form.append("files", f));
    try {
      const res = await fetch("/api/admin/media", { method: "POST", body: form });
      const data: any = await res.json();
      setFiles((p) => [...(data.files ?? []), ...p]);
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const filtered = files.filter(
    (f) => !query || f.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <AdminLayout title="Media Library" subtitle={`${files.length} files`}>
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
          <Input
            id="media-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files…"
            className="pl-10 h-10 rounded-sm bg-white/5 border-white/10 text-white/80 placeholder:text-white/20 font-sans text-sm"
          />
        </div>
        <Button
          id="media-upload-btn"
          className="h-10 px-4 rounded-sm bg-primary hover:bg-primary/90 text-white font-sans text-xs uppercase tracking-widest gap-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="size-4" /> {uploading ? "Uploading…" : "Upload"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => void handleUpload(e.target.files)}
        />
      </div>

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
        className={`border-2 border-dashed rounded-sm mb-6 py-10 text-center transition-colors cursor-pointer ${dragOver ? "border-primary/60 bg-primary/5" : "border-white/10 hover:border-white/20"}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="size-8 text-white/20 mx-auto mb-3" />
        <p className="text-sm font-sans text-white/30">
          Drag &amp; drop images here, or click to browse
        </p>
        <p className="text-xs font-sans text-white/20 mt-1">PNG, JPG, WebP up to 10MB</p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square bg-white/5 rounded-sm animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/20 font-sans text-xs">
          {files.length === 0
            ? "No media files yet. Upload images to get started."
            : "No files match your search."}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((file) => (
            <div
              key={file.name}
              className="group relative aspect-square bg-[#161616] border border-white/10 rounded-sm overflow-hidden hover:border-white/30 transition-colors"
            >
              <img
                src={file.url}
                alt={file.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => handleCopy(file.url)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-sm transition-colors"
                >
                  {copied === file.url ? (
                    <CheckCircle className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4 text-white" />
                  )}
                </button>
                <button
                  onClick={() => void handleDelete(file.name)}
                  className="p-2 bg-white/10 hover:bg-red-500/30 rounded-sm transition-colors"
                >
                  <Trash2 className="size-4 text-white" />
                </button>
              </div>
              <div className="absolute bottom-0 inset-x-0 px-2 py-1 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-white/60 font-sans truncate">{file.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
