import React, { useEffect, useState, useRef } from "react";
import { useAudioStore, type Episode } from "@/lib/audio-store";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  ChevronDown,
  Download,
  X,
  Languages,
  UserCheck,
  Gauge,
  Sparkles,
  Radio,
  Volume1,
  Music,
  Disc,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { motion, AnimatePresence } from "framer-motion";

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

export default function PodcastPlayer() {
  const {
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    playbackSpeed,
    voice,
    language,
    playerOpen,
    audio,
    playEpisode,
    stopEpisode,
    togglePlay,
    seek,
    setSpeed,
    setVoice,
    setLanguage,
    setPlayerOpen,
  } = useAudioStore();

  const { session } = useAuthStore();
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [catalog, setCatalog] = useState<Episode[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const hasCheckedSavedProgressRef = useRef(false);

  // Initialize store event listeners
  useEffect(() => {
    useAudioStore.getState().init();
  }, []);

  // Fetch quick episodes catalog inside the player
  useEffect(() => {
    if (playerOpen && catalog.length === 0) {
      setLoadingCatalog(true);
      fetch("/api/podcast/episodes")
        .then((res) => res.json())
        .then((data) => {
          if (data?.episodes) {
            setCatalog(data.episodes);
          }
        })
        .catch((err) => console.error("Error loading podcast episodes:", err))
        .finally(() => setLoadingCatalog(false));
    }
  }, [playerOpen, catalog.length]);

  // Sync continue listening state ONLY ONCE on initial mount if user is logged in
  useEffect(() => {
    if (session?.access_token && !currentEpisode && !hasCheckedSavedProgressRef.current) {
      hasCheckedSavedProgressRef.current = true;
      fetch("/api/audio-progress", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.items && data.items.length > 0) {
            const latest = data.items[0];
            useAudioStore.setState({
              currentEpisode: latest.story,
              currentTime: latest.currentTime,
              duration: latest.duration,
              language: latest.language,
              voice: latest.voiceId,
            });
            if (audio) {
              audio.src = `${latest.story.audioUrl}?lang=${latest.language}&voice=${latest.voiceId}`;
              audio.currentTime = latest.currentTime;
            }
          }
        })
        .catch((e) => console.error("Failed to load saved progress:", e));
    }
  }, [session, audio, currentEpisode]);

  if (!currentEpisode) return null;

  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || duration <= 0) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, clickX / width));
    seek(percentage * duration);
  };

  const skipForward = () => {
    seek(Math.min(duration, currentTime + 10));
  };

  const skipBackward = () => {
    seek(Math.max(0, currentTime - 10));
  };

  const toggleMute = () => {
    if (!audio) return;
    const nextMute = !muted;
    audio.muted = nextMute;
    setMuted(nextMute);
  };

  useEffect(() => {
    if (playerOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }
    return () => {
      if (playerOpen) unlockScroll();
    };
  }, [playerOpen]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audio) {
      audio.volume = val;
      audio.muted = val === 0;
      setMuted(val === 0);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentTitle =
    language === "hi" && currentEpisode.titleHi ? currentEpisode.titleHi : currentEpisode.title;
  const currentExcerpt =
    language === "hi" && currentEpisode.excerptHi
      ? currentEpisode.excerptHi
      : currentEpisode.excerpt;

  return (
    <>
      {/* ────────────────── MINI PLAYER (Floating Bottom Bar) ────────────────── */}
      {!playerOpen && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-5 left-4 right-4 md:left-auto md:right-8 md:w-[540px] z-[9999] bg-[#121215]/90 backdrop-blur-2xl border border-white/12 rounded-2xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-white select-none cursor-pointer group hover:border-gold/40 transition-all"
          onClick={() => setPlayerOpen(true)}
        >
          <div className="flex items-center gap-3">
            {/* Album Thumbnail with Pulsing Ring */}
            <div className="relative shrink-0">
              <img
                src={currentEpisode.imageUrl}
                alt={currentTitle || ""}
                className={`size-12 rounded-xl object-cover shadow-md ${isPlaying ? "animate-spin-slow" : ""}`}
                style={{ animationDuration: "12s" }}
              />
              {isPlaying && (
                <span className="absolute -top-1 -right-1 flex size-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-3 bg-gold"></span>
                </span>
              )}
            </div>

            {/* Episode Title & Metadata */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-sans font-bold text-white truncate group-hover:text-gold transition-colors">
                {currentTitle}
              </h4>
              <p className="text-[11px] font-sans text-white/50 truncate mt-0.5">
                {currentEpisode.authorName || "India Story Project"} • {formatTime(currentTime)} / {formatTime(duration || currentEpisode.duration)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={togglePlay}
                className="size-9 rounded-full bg-gradient-to-r from-gold to-saffron text-gold-foreground flex items-center justify-center hover:scale-105 transition-transform shadow-lg cursor-pointer"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="size-4 fill-current" />
                ) : (
                  <Play className="size-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  stopEpisode();
                }}
                className="size-9 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                title="Close Player"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Miniature Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-2xl overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold to-saffron transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </motion.div>
      )}

      {/* ────────────────── FULL NOW PLAYING OVERLAY PAGE ────────────────── */}
      <AnimatePresence>
        {playerOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100000] bg-[#0a0a0c] text-white overflow-y-auto flex flex-col select-none"
          >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(200,169,106,0.12),transparent_70%)] pointer-events-none" />

            {/* ── Top Header Bar ── */}
            <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/10 bg-black/40 backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setPlayerOpen(false)}
                className="flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-wider text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all cursor-pointer"
              >
                <ChevronDown className="size-4" />
                <span>Minimize Player</span>
              </button>

              <div className="flex items-center gap-2">
                <Radio className="size-4 text-gold animate-pulse" />
                <span className="text-xs font-sans font-bold uppercase tracking-[0.25em] text-gold">
                  Now Playing • Audio Story
                </span>
              </div>

              <button
                type="button"
                onClick={() => stopEpisode()}
                className="size-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close & Stop"
              >
                <X className="size-4" />
              </button>
            </header>

            {/* ── Main Content Grid ── */}
            <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 py-8 flex flex-col lg:flex-row items-center gap-10 justify-center">
              
              {/* Left Column: Rotating Vinyl / Glowing Album Art */}
              <div className="flex flex-col items-center gap-6 w-full max-w-sm">
                <div className="relative group size-64 sm:size-80">
                  {/* Outer Ambient Glow */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-gold/30 to-saffron/20 blur-2xl opacity-60 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Vinyl Disc / Cover Frame */}
                  <div className="relative size-full rounded-3xl border-2 border-white/15 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)] bg-black">
                    <img
                      src={currentEpisode.imageUrl}
                      alt={currentTitle || ""}
                      className={`size-full object-cover ${isPlaying ? "scale-105" : "scale-100"} transition-transform duration-700`}
                    />
                    
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                    {/* Playing Equalizer Overlay */}
                    {isPlaying && (
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-center gap-1.5 h-8">
                        {[40, 80, 60, 100, 75, 45, 90, 60, 85, 50].map((h, i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 bg-gold rounded-full"
                            animate={{ height: [`${h * 0.3}%`, `${h}%`, `${h * 0.4}%`] }}
                            transition={{
                              duration: 0.6 + (i % 3) * 0.2,
                              repeat: Infinity,
                              repeatType: "reverse",
                              ease: "easeInOut",
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Badge tags */}
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-[10px] font-sans font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="size-3" />
                    HD Audio Narration
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-[10px] font-sans font-bold uppercase tracking-wider">
                    {language === "hi" ? "हिन्दी संस्करण" : "English Story"}
                  </span>
                </div>
              </div>

              {/* Right Column: Information & Controls Panel */}
              <div className="flex-1 w-full max-w-xl space-y-6">
                {/* Title & Author */}
                <div className="space-y-2">
                  <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                    {currentTitle}
                  </h1>
                  <p className="text-sm font-sans text-gold/90 font-medium">
                    Narrated for {currentEpisode.authorName || "India Story Project"}
                  </p>
                  {currentExcerpt && (
                    <p className="text-xs sm:text-sm font-sans text-white/60 leading-relaxed line-clamp-3 pt-1">
                      {currentExcerpt}
                    </p>
                  )}
                </div>

                {/* Main Player Glassmorphism Card */}
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6 shadow-2xl">
                  
                  {/* Interactive Timeline Bar */}
                  <div className="space-y-2">
                    <div
                      ref={timelineRef}
                      onClick={handleTimelineClick}
                      className="relative h-2.5 w-full bg-white/10 rounded-full cursor-pointer overflow-hidden group"
                    >
                      <div
                        className="h-full bg-gradient-to-r from-gold via-saffron to-amber-400 rounded-full relative transition-all"
                        style={{ width: `${progressPercent}%` }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 size-3.5 bg-white rounded-full shadow-lg scale-0 group-hover:scale-100 transition-transform" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-white/50 font-medium">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration || currentEpisode.duration)}</span>
                    </div>
                  </div>

                  {/* Primary Playback Controls */}
                  <div className="flex items-center justify-center gap-6">
                    <button
                      type="button"
                      onClick={skipBackward}
                      className="size-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                      title="10 Seconds Back"
                    >
                      <RotateCcw className="size-4" />
                    </button>

                    {/* Big Play / Pause Button */}
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="size-16 rounded-full bg-gradient-to-r from-gold via-saffron to-amber-500 text-gold-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-[0_10px_30px_rgba(200,169,106,0.4)] cursor-pointer"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="size-7 fill-current" />
                      ) : (
                        <Play className="size-7 fill-current ml-1" />
                      )}
                    </button>

                    {/* Instant Stop Button */}
                    <button
                      type="button"
                      onClick={stopEpisode}
                      className="size-10 rounded-full bg-white/5 hover:bg-red-500/20 border border-white/10 text-white/80 hover:text-red-400 flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                      title="Stop Audio"
                    >
                      <Square className="size-4 fill-current" />
                    </button>

                    <button
                      type="button"
                      onClick={skipForward}
                      className="size-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
                      title="10 Seconds Forward"
                    >
                      <RotateCw className="size-4" />
                    </button>
                  </div>

                  {/* Settings Control Strip: Speed, Voice, Language & Volume */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                    
                    {/* Language Switcher */}
                    <div className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                      <span className="text-[11px] font-sans font-bold text-white/60 flex items-center gap-1.5">
                        <Languages className="size-3.5 text-gold" />
                        Language:
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setLanguage("en")}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-sans font-bold uppercase transition-all cursor-pointer ${
                            language === "en"
                              ? "bg-gold text-gold-foreground shadow"
                              : "text-white/60 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          EN
                        </button>
                        <button
                          type="button"
                          onClick={() => setLanguage("hi")}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-sans font-bold uppercase transition-all cursor-pointer ${
                            language === "hi"
                              ? "bg-gold text-gold-foreground shadow"
                              : "text-white/60 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          हिन्दी
                        </button>
                      </div>
                    </div>

                    {/* Voice Switcher */}
                    <div className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                      <span className="text-[11px] font-sans font-bold text-white/60 flex items-center gap-1.5">
                        <UserCheck className="size-3.5 text-gold" />
                        Voice:
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setVoice("female")}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-sans font-bold transition-all cursor-pointer ${
                            voice === "female"
                              ? "bg-gold text-gold-foreground shadow"
                              : "text-white/60 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          Female (Priya)
                        </button>
                        <button
                          type="button"
                          onClick={() => setVoice("male")}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-sans font-bold transition-all cursor-pointer ${
                            voice === "male"
                              ? "bg-gold text-gold-foreground shadow"
                              : "text-white/60 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          Male (Aarav)
                        </button>
                      </div>
                    </div>

                    {/* Playback Speed Selector */}
                    <div className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                      <span className="text-[11px] font-sans font-bold text-white/60 flex items-center gap-1.5">
                        <Gauge className="size-3.5 text-gold" />
                        Speed:
                      </span>
                      <div className="flex gap-1 overflow-x-auto">
                        {SPEED_OPTIONS.map((spd) => (
                          <button
                            key={spd}
                            type="button"
                            onClick={() => setSpeed(spd)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                              playbackSpeed === spd
                                ? "bg-gold text-gold-foreground font-bold"
                                : "text-white/50 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Volume Slider */}
                    <div className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-xl border border-white/5 gap-2">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="text-white/70 hover:text-white transition-colors cursor-pointer"
                        title={muted ? "Unmute" : "Mute"}
                      >
                        {muted || volume === 0 ? (
                          <VolumeX className="size-4 text-red-400" />
                        ) : (
                          <Volume2 className="size-4 text-gold" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={muted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-full accent-gold bg-white/20 h-1.5 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </main>

            {/* ── Bottom Section: Quick Episode Catalog Carousel ── */}
            <footer className="relative z-10 border-t border-white/10 bg-black/60 backdrop-blur-md py-6 px-6">
              <div className="max-w-6xl mx-auto space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-white/60 flex items-center gap-2">
                    <Music className="size-3.5 text-gold" />
                    More Podcast Episodes
                  </h3>
                  <span className="text-[10px] font-mono text-white/40">
                    {catalog.length} Available
                  </span>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
                  {catalog.map((ep) => {
                    const epTitle = language === "hi" && ep.titleHi ? ep.titleHi : ep.title;
                    const isSelected = currentEpisode.id === ep.id;
                    return (
                      <div
                        key={ep.id}
                        onClick={() => playEpisode(ep)}
                        className={`shrink-0 w-64 p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? "bg-gold/15 border-gold/40 text-gold"
                            : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                        }`}
                      >
                        <img
                          src={ep.imageUrl}
                          alt={epTitle}
                          className="size-12 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-sans font-bold truncate">{epTitle}</p>
                          <p className="text-[10px] font-sans text-white/50 truncate mt-0.5">
                            {ep.authorName || "India Story Project"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
