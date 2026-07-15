import { create } from "zustand";

export type Episode = {
  id: string;
  slug: string;
  title: string;
  titleHi?: string | null;
  excerpt?: string | null;
  excerptHi?: string | null;
  audioUrl: string;
  duration: number;
  authorName: string;
  imageUrl: string;
};

export type AudioState = {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  voice: "male" | "female";
  language: "en" | "hi";
  playerOpen: boolean;
  queue: Episode[];
  audio: HTMLAudioElement | null;
  initialized: boolean;

  playEpisode: (episode: Episode, lang?: "en" | "hi", startFrom?: number) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setSpeed: (speed: number) => void;
  setVoice: (voice: "male" | "female") => void;
  setLanguage: (lang: "en" | "hi") => void;
  setPlayerOpen: (open: boolean) => void;
  addToQueue: (episode: Episode) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  updateProgress: () => void;
  init: () => void;
};

let globalAudio: HTMLAudioElement | null = null;
if (typeof window !== "undefined") {
  globalAudio = new Audio();
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentEpisode: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackSpeed: 1.0,
  voice: "female",
  language: "en",
  playerOpen: false,
  queue: [],
  audio: globalAudio,
  initialized: false,

  init: () => {
    const { initialized, audio } = get();
    if (initialized || !audio) return;

    audio.addEventListener("play", () => set({ isPlaying: true }));
    audio.addEventListener("pause", () => set({ isPlaying: false }));
    audio.addEventListener("timeupdate", () => {
      set({ currentTime: audio.currentTime });
      get().updateProgress();
    });
    audio.addEventListener("durationchange", () => {
      set({ duration: audio.duration || 0 });
    });
    audio.addEventListener("ended", () => {
      set({ isPlaying: false, currentTime: 0 });
      // Sync completion progress
      get().updateProgress();
    });

    set({ initialized: true });
  },

  playEpisode: (episode, lang, startFrom) => {
    const { audio, init } = get();
    init();

    if (!audio) return;

    const currentLang = lang || get().language;
    const finalAudioUrl = `${episode.audioUrl}?lang=${currentLang}&voice=${get().voice}`;

    set({
      currentEpisode: episode,
      language: currentLang,
      currentTime: startFrom || 0,
      isPlaying: true,
    });

    audio.src = finalAudioUrl;
    audio.playbackRate = get().playbackSpeed;
    audio.load();

    if (startFrom) {
      audio.currentTime = startFrom;
    }

    audio.play().catch((err) => {
      console.warn("Failed to trigger audio autoplay:", err);
      set({ isPlaying: false });
    });
  },

  togglePlay: () => {
    const { audio, isPlaying, currentEpisode } = get();
    if (!audio || !currentEpisode) return;

    if (isPlaying) {
      audio.pause();
      set({ isPlaying: false });
    } else {
      audio.play().catch((err) => {
        console.warn("Playback error:", err);
      });
      set({ isPlaying: true });
    }
  },

  seek: (time) => {
    const { audio } = get();
    if (!audio) return;
    audio.currentTime = time;
    set({ currentTime: time });
  },

  setSpeed: (speed) => {
    const { audio } = get();
    if (audio) {
      audio.playbackRate = speed;
    }
    set({ playbackSpeed: speed });
  },

  setVoice: (voice) => {
    set({ voice });
    const { currentEpisode, audio, currentTime, isPlaying } = get();
    // Reload audio with the new voice setting
    if (currentEpisode && audio) {
      const isCurrentlyPlaying = isPlaying;
      const finalAudioUrl = `${currentEpisode.audioUrl}?lang=${get().language}&voice=${voice}`;
      audio.src = finalAudioUrl;
      audio.load();
      audio.currentTime = currentTime;
      if (isCurrentlyPlaying) {
        audio.play().catch((err) => console.warn(err));
      }
    }
  },

  setLanguage: (lang) => {
    set({ language: lang });
    const { currentEpisode, audio, currentTime, isPlaying } = get();
    // Reload audio with the new language setting
    if (currentEpisode && audio) {
      const isCurrentlyPlaying = isPlaying;
      const finalAudioUrl = `${currentEpisode.audioUrl}?lang=${lang}&voice=${get().voice}`;
      audio.src = finalAudioUrl;
      audio.load();
      audio.currentTime = currentTime;
      if (isCurrentlyPlaying) {
        audio.play().catch((err) => console.warn(err));
      }
    }
  },

  setPlayerOpen: (open) => set({ playerOpen: open }),

  addToQueue: (episode) => set((state) => ({ queue: [...state.queue, episode] })),

  removeFromQueue: (id) => set((state) => ({ queue: state.queue.filter((e) => e.id !== id) })),

  clearQueue: () => set({ queue: [] }),

  updateProgress: () => {
    const { currentEpisode, currentTime, duration, language, voice } = get();
    if (!currentEpisode || duration <= 0) return;

    // Throttle progress updates to database (e.g. save on every 5 seconds)
    const lastSaved = (globalThis as any).lastAudioSaved || 0;
    const now = Date.now();

    // Also save if completed or starting
    const shouldSave =
      now - lastSaved > 5000 || currentTime === 0 || currentTime >= duration * 0.95;

    if (shouldSave) {
      (globalThis as any).lastAudioSaved = now;

      // Try reading access token from local auth session
      let token: string | null = null;
      try {
        const authDataStr = localStorage.getItem("sb-nhwbmcmzkiuudyikginc-auth-token");
        if (authDataStr) {
          const authData = JSON.parse(authDataStr);
          token = authData?.access_token;
        }
      } catch (e) {
        // Auth token lookup failed
      }

      if (token) {
        fetch("/api/audio-progress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            storyId: currentEpisode.id,
            currentTime,
            duration,
            language,
            voiceId: voice,
          }),
        }).catch((err) => console.error("Error syncing audio progress:", err));
      }
    }
  },
}));
