import React, { useEffect, useState, useRef } from "react";
import { useAudioStore, type Episode } from "@/lib/audio-store";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  Download,
  X,
  Languages,
  UserCheck,
  Gauge,
  Rss,
  Radio,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

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
    togglePlay,
    seek,
    setSpeed,
    setVoice,
    setLanguage,
    setPlayerOpen,
  } = useAudioStore();

  const { session } = useAuthStore();
  const [muted, setMuted] = useState(false);
  const [catalog, setCatalog] = useState<Episode[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

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

  // Sync continue listening state on mount if user is logged in
  useEffect(() => {
    if (session?.access_token && !currentEpisode) {
      // Fetch user's latest uncompleted progress
      fetch("/api/audio-progress", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.items && data.items.length > 0) {
            const latest = data.items[0];
            // Load but don't autoplay immediately
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
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || duration <= 0) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    seek(percentage * duration);
  };

  const skipForward = () => {
    seek(Math.min(duration, currentTime + 15));
  };

  const skipBackward = () => {
    seek(Math.max(0, currentTime - 15));
  };

  const toggleMute = () => {
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
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
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            left: "20px",
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "rgba(20, 20, 20, 0.85)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            padding: "12px 16px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            color: "white",
            cursor: "pointer",
          }}
          onClick={() => setPlayerOpen(true)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
            <img
              src={currentEpisode.imageUrl}
              alt={currentTitle || ""}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {currentTitle}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#a0a0a0",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {currentEpisode.authorName} • {formatTime(currentTime)} /{" "}
                {formatTime(duration || currentEpisode.duration)}
              </div>
            </div>
          </div>

          <div
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={togglePlay}
              style={{
                background: "#C8A96A",
                color: "black",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "transform 0.1s ease",
              }}
            >
              {isPlaying ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" style={{ marginLeft: "2px" }} />
              )}
            </button>
            <button
              onClick={() => useAudioStore.setState({ currentEpisode: null })}
              style={{
                background: "transparent",
                color: "#a0a0a0",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Miniature progress bar */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "3px",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderBottomLeftRadius: "16px",
              borderBottomRightRadius: "16px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPercent}%`,
                backgroundColor: "#C8A96A",
              }}
            />
          </div>
        </div>
      )}

      {/* ────────────────── FULL PLAYER SCREEN OVERLAY ────────────────── */}
      {playerOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#0a0a0a",
            backgroundImage: `radial-gradient(circle at top, rgba(200, 169, 106, 0.08) 0%, rgba(0,0,0,0) 70%)`,
            zIndex: 100000,
            color: "white",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <button
              onClick={() => setPlayerOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#a0a0a0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
              }}
            >
              <ChevronDown size={20} />
              Minimize Player
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#C8A96A",
              }}
            >
              <Radio size={16} className="animate-pulse" />
              NOW PLAYING
            </div>
            <button
              onClick={() => useAudioStore.setState({ currentEpisode: null, playerOpen: false })}
              style={{
                background: "transparent",
                border: "none",
                color: "#a0a0a0",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Main Layout Grid */}
          <div
            style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "window.innerWidth > 900 ? '1fr 1fr' : '1fr'",
              maxWidth: "1200px",
              margin: "0 auto",
              width: "100%",
              padding: "24px",
              gap: "40px",
              alignItems: "center",
            }}
            className="grid lg:grid-cols-2"
          >
            {/* Left Column: Cover & Details */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <img
                src={currentEpisode.imageUrl}
                alt={currentTitle || ""}
                style={{
                  width: "100%",
                  maxWidth: "320px",
                  aspectRatio: "1",
                  borderRadius: "24px",
                  objectFit: "cover",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  marginBottom: "28px",
                }}
              />
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: "8px",
                  lineHeight: "1.3",
                }}
              >
                {currentTitle}
              </h2>
              <div
                style={{
                  fontSize: "15px",
                  color: "#C8A96A",
                  marginBottom: "16px",
                  fontWeight: 500,
                }}
              >
                {currentEpisode.authorName}
              </div>
              <p
                style={{
                  fontSize: "14px",
                  color: "#a0a0a0",
                  maxWidth: "480px",
                  lineHeight: "1.5",
                  margin: "0 auto",
                }}
              >
                {currentExcerpt}
              </p>
            </div>

            {/* Right Column: Controls & Settings */}
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {/* Settings selectors (Voice, Lang, Speed) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "12px",
                  backgroundColor: "rgba(255,255,255,0.02)",
                  padding: "16px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {/* Language Select */}
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#a0a0a0",
                      marginBottom: "6px",
                      textTransform: "uppercase",
                    }}
                  >
                    Language
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: "4px" }}>
                    <button
                      onClick={() => setLanguage("en")}
                      style={{
                        padding: "4px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        background: language === "en" ? "#C8A96A" : "rgba(255,255,255,0.05)",
                        color: language === "en" ? "black" : "white",
                      }}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => setLanguage("hi")}
                      style={{
                        padding: "4px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        background: language === "hi" ? "#C8A96A" : "rgba(255,255,255,0.05)",
                        color: language === "hi" ? "black" : "white",
                      }}
                    >
                      हिं
                    </button>
                  </div>
                </div>

                {/* Voice Selector */}
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#a0a0a0",
                      marginBottom: "6px",
                      textTransform: "uppercase",
                    }}
                  >
                    Voice
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: "4px" }}>
                    <button
                      onClick={() => setVoice("female")}
                      style={{
                        padding: "4px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        background: voice === "female" ? "#C8A96A" : "rgba(255,255,255,0.05)",
                        color: voice === "female" ? "black" : "white",
                      }}
                    >
                      Female
                    </button>
                    <button
                      onClick={() => setVoice("male")}
                      style={{
                        padding: "4px 10px",
                        fontSize: "12px",
                        fontWeight: 600,
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        background: voice === "male" ? "#C8A96A" : "rgba(255,255,255,0.05)",
                        color: voice === "male" ? "black" : "white",
                      }}
                    >
                      Male
                    </button>
                  </div>
                </div>

                {/* Speed Select */}
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#a0a0a0",
                      marginBottom: "6px",
                      textTransform: "uppercase",
                    }}
                  >
                    Speed
                  </div>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "4px 8px",
                      fontSize: "12px",
                      cursor: "pointer",
                      width: "100%",
                      maxWidth: "70px",
                      margin: "0 auto",
                    }}
                  >
                    <option value="0.5">0.5x</option>
                    <option value="1.0">1.0x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2.0">2.0x</option>
                  </select>
                </div>
              </div>

              {/* Progress Slider */}
              <div>
                <div
                  ref={timelineRef}
                  onClick={handleTimelineClick}
                  style={{
                    height: "6px",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: "3px",
                    position: "relative",
                    cursor: "pointer",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${progressPercent}%`,
                      backgroundColor: "#C8A96A",
                      borderRadius: "3px",
                      position: "absolute",
                      left: 0,
                      top: 0,
                    }}
                  />
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      backgroundColor: "white",
                      border: "2px solid #C8A96A",
                      borderRadius: "50%",
                      position: "absolute",
                      left: `${progressPercent}%`,
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    color: "#a0a0a0",
                  }}
                >
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration || currentEpisode.duration)}</span>
                </div>
              </div>

              {/* Controls buttons row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "28px",
                }}
              >
                <button
                  onClick={skipBackward}
                  style={{
                    background: "transparent",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Rewind 15s"
                >
                  <RotateCcw size={24} />
                </button>

                <button
                  onClick={togglePlay}
                  style={{
                    background: "white",
                    color: "black",
                    border: "none",
                    borderRadius: "50%",
                    width: "64px",
                    height: "64px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 10px 25px rgba(255,255,255,0.1)",
                    transition: "transform 0.1s ease",
                  }}
                >
                  {isPlaying ? (
                    <Pause size={32} fill="black" />
                  ) : (
                    <Play size={32} fill="black" style={{ marginLeft: "4px" }} />
                  )}
                </button>

                <button
                  onClick={skipForward}
                  style={{
                    background: "transparent",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Forward 15s"
                >
                  <RotateCw size={24} />
                </button>
              </div>

              {/* Utility actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "20px",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  paddingTop: "20px",
                }}
              >
                <button
                  onClick={toggleMute}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#a0a0a0",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                  }}
                >
                  {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  {muted ? "Muted" : "Mute"}
                </button>

                <a
                  href={`/api/stories/${currentEpisode.slug}/audio?lang=${language}&voice=${voice}&download=true`}
                  download
                  style={{
                    color: "#a0a0a0",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                  }}
                >
                  <Download size={18} />
                  Download Audio
                </a>

                <a
                  href="/api/podcast/feed.xml"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: "#a0a0a0",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                  }}
                >
                  <Rss size={18} color="#C8A96A" />
                  Podcast Feed
                </a>
              </div>
            </div>
          </div>

          {/* Bottom section: Quick browse catalog */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.05)",
              padding: "24px",
              backgroundColor: "rgba(255,255,255,0.01)",
              flex: 1,
            }}
          >
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#C8A96A",
                  marginBottom: "16px",
                }}
              >
                Browse More Podcast Episodes
              </h3>

              {loadingCatalog ? (
                <div style={{ color: "#a0a0a0", fontSize: "14px" }}>Loading episodes...</div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {catalog
                    .filter((ep) => ep.id !== currentEpisode.id)
                    .map((ep) => {
                      const epTitle = language === "hi" && ep.titleHi ? ep.titleHi : ep.title;
                      return (
                        <div
                          key={ep.id}
                          onClick={() => playEpisode(ep, language)}
                          style={{
                            display: "flex",
                            gap: "12px",
                            padding: "10px",
                            backgroundColor: "rgba(255,255,255,0.03)",
                            borderRadius: "12px",
                            cursor: "pointer",
                            transition: "background-color 0.2s",
                            border: "1px solid rgba(255,255,255,0.04)",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)")
                          }
                        >
                          <img
                            src={ep.imageUrl}
                            alt={epTitle || ""}
                            style={{
                              width: "60px",
                              height: "60px",
                              borderRadius: "8px",
                              objectFit: "cover",
                            }}
                          />
                          <div
                            style={{
                              flex: 1,
                              minWidth: 0,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                            }}
                          >
                            <h4
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                margin: 0,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                lineHeight: "1.3",
                              }}
                            >
                              {epTitle}
                            </h4>
                            <span style={{ fontSize: "11px", color: "#a0a0a0", marginTop: "4px" }}>
                              {ep.authorName}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
