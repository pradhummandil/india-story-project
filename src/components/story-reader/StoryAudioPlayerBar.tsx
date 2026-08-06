import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Volume2, Music, Sparkles, Mic, FastForward, SlidersHorizontal, Maximize2 } from "lucide-react";
import { useAudioStore } from "@/lib/audio-store";
import type { Story } from "@/components/site/StoryCard";
import { useI18nStore } from "@/lib/i18n";

interface StoryAudioPlayerBarProps {
  story: Story;
}

export function StoryAudioPlayerBar({ story }: StoryAudioPlayerBarProps) {
  const lang = useI18nStore((s) => s.lang);
  const isHindi = lang === "hi";

  const { currentEpisode, isPlaying, togglePlay, playEpisode, playbackSpeed, setSpeed, voice, setVoice, currentTime, duration, seek, setPlayerOpen } = useAudioStore();
  const [ambientTrack, setAmbientTrack] = useState<string>("none");
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  const ambientTracks = [
    { id: "none", name: isHindi ? "संगीत बंद" : "Off" },
    { id: "sitar", name: isHindi ? "सितार संगीत" : "Sitar Melodies", url: "https://actions.google.com/sounds/v1/ambiences/outdoor_rain.ogg" },
    { id: "flute", name: isHindi ? "बांसुरी धुन" : "Bansuri Flute", url: "https://actions.google.com/sounds/v1/ambiences/forest_morning.ogg" },
    { id: "rain", name: isHindi ? "मानसून वर्षा" : "Monsoon Rain", url: "https://actions.google.com/sounds/v1/ambiences/outdoor_rain.ogg" },
    { id: "bells", name: isHindi ? "मंदिर घंटियां" : "Temple Bells", url: "https://actions.google.com/sounds/v1/ambiences/wind_chimes.ogg" },
  ];

  const isCurrentStory = currentEpisode?.id === story.id;

  const handleStartPlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCurrentStory) {
      togglePlay();
    } else {
      playEpisode({
        id: story.id,
        slug: story.slug,
        title: isHindi ? (story.titleHindi || story.title) : story.title,
        excerpt: isHindi ? (story.excerptHindi || story.excerpt) : story.excerpt,
        audioUrl: (story as any).audioUrl || "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-10781.mp3",
        duration: 300,
        authorName: story.authorName || "India Story Project",
        imageUrl: story.image,
      });
    }
  };

  const handleOpenFullPlayer = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isCurrentStory) {
      playEpisode({
        id: story.id,
        slug: story.slug,
        title: isHindi ? (story.titleHindi || story.title) : story.title,
        excerpt: isHindi ? (story.excerptHindi || story.excerpt) : story.excerpt,
        audioUrl: (story as any).audioUrl || "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=ambient-piano-10781.mp3",
        duration: 300,
        authorName: story.authorName || "India Story Project",
        imageUrl: story.image,
      });
    }
    setPlayerOpen(true);
  };

  useEffect(() => {
    if (ambientTrack !== "none") {
      const selected = ambientTracks.find((t) => t.id === ambientTrack);
      if (selected && selected.url) {
        if (!ambientAudioRef.current) {
          ambientAudioRef.current = new Audio();
          ambientAudioRef.current.loop = true;
          ambientAudioRef.current.volume = 0.25;
        }
        ambientAudioRef.current.src = selected.url;
        ambientAudioRef.current.play().catch(() => {});
      }
    } else {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
      }
    }
    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
      }
    };
  }, [ambientTrack, ambientTracks]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
      className="my-12 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#1A1816] via-[#261E1A] to-[#1A1816] border border-[#FAF7F2]/15 shadow-2xl backdrop-blur-xl relative overflow-hidden"
    >
      {/* Background ambient light */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        {/* Left Info & Inline Play Button */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleStartPlay}
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#D32F2F] to-[#EF4444] text-white flex items-center justify-center shadow-lg shadow-[#D32F2F]/40 hover:scale-105 active:scale-95 transition-all duration-300 flex-shrink-0 cursor-pointer"
            title={isCurrentStory && isPlaying ? "Pause Audio" : "Play Audio Inline"}
          >
            {isCurrentStory && isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-1" />
            )}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                {isHindi ? "ऑडियो कहानी प्रेषण" : "Audio Story Dispatch"}
              </span>
              {isCurrentStory && isPlaying && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-[#10B981] animate-pulse">
                  <Sparkles className="w-3 h-3" /> {isHindi ? "चल रहा है" : "Playing"}
                </span>
              )}
            </div>
            <h4 className="text-base md:text-lg font-serif font-bold text-white mt-1">
              {isHindi ? "वृत्तचित्र वाचन सुनें" : "Listen to Documentary Narration"}
            </h4>
            <p className="text-xs text-[#FAF7F2]/60">
              {isHindi ? "पेशेवर भारतीय आवाज और ध्वनि प्रभाव" : "Professional Indian Voice Synthesis & Soundscapes"}
            </p>
          </div>
        </div>

        {/* Audio Controls (Voice, Speed, Ambient Music, & Full Display Expand) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Full Screen Display Expand Button */}
          <button
            type="button"
            onClick={handleOpenFullPlayer}
            className="px-3.5 py-2 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#FDE68A] hover:bg-[#D4AF37]/30 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
            title={isHindi ? "पूर्ण स्क्रीन ऑडियो डिस्प्ले खोलें" : "Expand Full Audio Experience"}
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">{isHindi ? "पूर्ण डिस्प्ले" : "Full Display"}</span>
          </button>

          {/* Voice selector */}
          <div className="flex items-center gap-1 bg-[#282320] border border-[#FAF7F2]/10 rounded-xl p-1 text-xs">
            <Mic className="w-3.5 h-3.5 text-[#D4AF37] ml-2" />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setVoice("female");
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                voice === "female" ? "bg-[#D32F2F] text-white font-semibold" : "text-[#FAF7F2]/60"
              }`}
            >
              {isHindi ? "महिला" : "Female"}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setVoice("male");
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                voice === "male" ? "bg-[#D32F2F] text-white font-semibold" : "text-[#FAF7F2]/60"
              }`}
            >
              {isHindi ? "पुरुष" : "Male"}
            </button>
          </div>

          {/* Speed selector */}
          <div className="flex items-center gap-1 bg-[#282320] border border-[#FAF7F2]/10 rounded-xl p-1 text-xs">
            <FastForward className="w-3.5 h-3.5 text-[#D4AF37] ml-2" />
            {[1, 1.25, 1.5, 2].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSpeed(spd);
                }}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  playbackSpeed === spd ? "bg-[#D4AF37] text-black font-bold" : "text-[#FAF7F2]/60"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Ambient Music selector */}
          <div className="flex items-center gap-1 bg-[#282320] border border-[#FAF7F2]/10 rounded-xl p-1 text-xs">
            <Music className="w-3.5 h-3.5 text-[#D4AF37] ml-2" />
            <select
              value={ambientTrack}
              onChange={(e) => setAmbientTrack(e.target.value)}
              className="bg-transparent text-white text-xs outline-none cursor-pointer pr-2"
            >
              {ambientTracks.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#1A1816] text-white">
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Progress Bar & Waveform representation */}
      {isCurrentStory && (
        <div className="mt-6 pt-4 border-t border-[#FAF7F2]/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#FAF7F2]/60 font-mono">
            <span>{formatTime(currentTime)}</span>
            <div
              className="flex-1 mx-4 relative h-2 bg-[#282320] rounded-full overflow-hidden cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newPercent = clickX / rect.width;
                seek(newPercent * (duration || 300));
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-[#D32F2F] to-[#D4AF37] rounded-full transition-all duration-150"
                style={{ width: `${((currentTime / (duration || 300)) * 100).toFixed(1)}%` }}
              />
            </div>
            <span>{formatTime(duration || 300)}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
