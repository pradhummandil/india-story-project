import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Image as ImageIcon,
  FileText,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useContributor, regionDots } from "@/lib/contributor-store";
import { themes } from "@/lib/stories-data";
import { useAuthStore } from "@/lib/auth-store";

const steps = [
  { id: 0, label: "Themes", icon: Sparkles },
  { id: 1, label: "Location", icon: MapPin },
  { id: 2, label: "Media", icon: ImageIcon },
  { id: 3, label: "Story", icon: FileText },
  { id: 4, label: "Submit", icon: Send },
];

export function ShareStoryWizard() {
  const { submit } = useContributor();
  const [step, setStep] = useState(0);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [region, setRegion] = useState<string>("");
  const [media, setMedia] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [done, setDone] = useState(false);

  const toggleTheme = (t: string) => {
    setSelectedThemes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const canNext =
    (step === 0 && selectedThemes.length > 0) ||
    (step === 1 && !!region) ||
    step === 2 ||
    (step === 3 && title.length > 3 && body.length > 20) ||
    step === 4;

  const next = () => setStep((s) => Math.min(steps.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const { session } = useAuthStore();

  const handleSubmit = async () => {
    if (!session) return;
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title,
          excerpt: body.length > 150 ? body.slice(0, 150) + "..." : body,
          content: body,
          themes: selectedThemes.join(", "),
          stateName: region,
          imageUrl:
            media > 0 ? "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800" : null,
        }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const errorData = await res.json();
        alert(`Failed to submit: ${errorData.error || "Unknown error"}`);
      }
    } catch (e) {
      console.error("Story submission failed:", e);
      alert("An error occurred during story submission.");
    }
  };

  const handleReset = () => {
    setStep(0);
    setSelectedThemes([]);
    setRegion("");
    setMedia(0);
    setTitle("");
    setBody("");
    setDone(false);
  };

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="glass rounded-3xl p-6 md:p-10 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero opacity-20 pointer-events-none" />
      <div className="relative">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((s, i) => {
            const active = i === step;
            const complete = i < step || done;
            return (
              <div key={s.id} className="flex-1 flex items-center">
                <motion.div
                  animate={{
                    scale: active ? 1.05 : 1,
                  }}
                  className={`flex items-center gap-2 ${active ? "text-gold" : complete ? "text-foreground" : "text-muted-foreground/60"}`}
                >
                  <span
                    className={`grid place-items-center size-8 rounded-full border ${
                      complete
                        ? "bg-gradient-to-br from-gold to-saffron border-transparent text-gold-foreground"
                        : active
                          ? "border-gold/60 bg-gold/10"
                          : "border-border/60"
                    }`}
                  >
                    {complete ? <Check className="size-4" /> : <s.icon className="size-4" />}
                  </span>
                  <span className="hidden md:inline text-xs uppercase tracking-widest">
                    {s.label}
                  </span>
                </motion.div>
                {i < steps.length - 1 && <div className="flex-1 h-px bg-border/40 mx-2" />}
              </div>
            );
          })}
        </div>

        <div className="h-1 rounded-full bg-border/40 overflow-hidden mb-8">
          <motion.div
            animate={{ width: `${done ? 100 : progress}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="h-full bg-gradient-to-r from-gold to-saffron"
          />
        </div>

        <div className="min-h-[280px]">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="text-center py-10"
              >
                <div className="mx-auto size-16 rounded-full bg-gradient-to-br from-gold to-saffron grid place-items-center shadow-glow mb-5">
                  <Check className="size-7 text-gold-foreground" />
                </div>
                <h3 className="font-display text-3xl mb-2">Submitted for review</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your story has joined the archive of changemakers. We'll get back to you when our
                  editors review it.
                </p>
                <Button
                  onClick={handleReset}
                  className="mt-6 btn-premium bg-gradient-to-r from-gold to-saffron text-gold-foreground border-0"
                >
                  Share another
                </Button>
              </motion.div>
            ) : step === 0 ? (
              <motion.div
                key="cat"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <h3 className="font-display text-2xl mb-1">Choose your themes</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  What kind of story is this? Pick one or more.
                </p>
                <div className="flex flex-wrap gap-2">
                  {themes
                    .filter((c) => c !== "All")
                    .map((c) => (
                      <button
                        key={c}
                        onClick={() => toggleTheme(c)}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${
                          selectedThemes.includes(c)
                            ? "bg-gradient-to-r from-gold to-saffron text-gold-foreground shadow-glow"
                            : "glass text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                </div>
              </motion.div>
            ) : step === 1 ? (
              <motion.div
                key="loc"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <h3 className="font-display text-2xl mb-1">Where did it happen?</h3>
                <p className="text-sm text-muted-foreground mb-5">Pick a region of India.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {regionDots.map((r) => (
                    <button
                      key={r.region}
                      onClick={() => setRegion(r.region)}
                      className={`px-3 py-2 rounded-xl text-xs text-left transition-all border ${
                        region === r.region
                          ? "border-gold/60 bg-gold/10 text-foreground"
                          : "border-border/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <MapPin className="size-3 inline mr-1 text-gold" />
                      {r.region}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : step === 2 ? (
              <motion.div
                key="med"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <h3 className="font-display text-2xl mb-1">Add photos or video</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  Drop in visuals that bring this story to life. (Optional)
                </p>
                <label className="block border border-dashed border-border/60 rounded-2xl p-10 text-center cursor-pointer hover:border-gold/60 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => setMedia(e.target.files?.length ?? 0)}
                  />
                  <ImageIcon className="size-8 text-gold mx-auto mb-3" />
                  <div className="text-sm">Drag files here or click to upload</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {media > 0
                      ? `${media} file${media > 1 ? "s" : ""} attached`
                      : "PNG, JPG, MP4 up to 50MB each"}
                  </div>
                </label>
              </motion.div>
            ) : step === 3 ? (
              <motion.div
                key="story"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="font-display text-2xl mb-1">Tell the story</h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    A clear title and a few paragraphs are enough to start.
                  </p>
                </div>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Story title"
                  className="h-12 bg-transparent border-border focus-visible:ring-gold/40"
                />
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What happened, who is the hero, what changed because of them..."
                  className="min-h-[180px] bg-transparent border-border focus-visible:ring-gold/40"
                />
                <div className="text-xs text-muted-foreground">{body.length} characters</div>
              </motion.div>
            ) : (
              <motion.div
                key="sub"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <h3 className="font-display text-2xl mb-1">Review & submit</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  A quick check before we send it to editors.
                </p>
                <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                  <Row label="Themes" value={selectedThemes.join(", ") || "—"} />
                  <Row label="Region" value={region} />
                  <Row label="Media" value={media > 0 ? `${media} attached` : "None"} />
                  <Row label="Title" value={title} />
                  <div className="sm:col-span-2 glass rounded-xl p-4">
                    <div className="text-xs uppercase tracking-widest text-gold mb-2">Story</div>
                    <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap">
                      {body}
                    </p>
                  </div>
                </dl>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        {!done && (
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={back}
              disabled={step === 0}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ChevronLeft className="size-4" /> Back
            </button>
            {step < steps.length - 1 ? (
              <Button
                onClick={next}
                disabled={!canNext}
                className="btn-premium bg-gradient-to-r from-gold to-saffron text-gold-foreground border-0 disabled:opacity-40"
              >
                Continue <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="btn-premium bg-gradient-to-r from-gold to-saffron text-gold-foreground border-0"
              >
                Submit story <Send className="size-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="text-xs uppercase tracking-widest text-gold mb-1">{label}</div>
      <div className="text-sm">{value || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}
