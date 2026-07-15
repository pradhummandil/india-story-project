import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitCommit,
  Dna,
  Calendar,
  Heart,
  Activity,
  MapPin,
  ArrowLeft,
  Users,
  Sparkles,
  Award,
  Globe,
  Briefcase,
  Play,
  FileText,
  Headphones,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { useStoriesData } from "@/lib/stories-data";
import { useI18nStore, translateStory } from "@/lib/i18n";
import { useAudioStore } from "@/lib/audio-store";
import { deriveDNA } from "@/lib/story-dna";
import { getStoryInteractiveData, type ConnectedEntity } from "@/lib/interactive-metadata";
import { SiteLayout } from "@/components/site/Layout";

export const Route = createFileRoute("/stories/$slug/interactive")({
  component: StoryInteractiveConsole,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Interactive Profile Not Found</h1>
        <p className="text-muted-foreground mb-8">The story you're looking for doesn't exist.</p>
        <Link to="/explore" className="text-[#C8A96A] hover:text-white transition-colors">
          Back to Explore
        </Link>
      </div>
    </div>
  ),
});

function StoryInteractiveConsole() {
  const { slug } = Route.useParams();
  const { stories: dbStories } = useStoriesData();
  const lang = useI18nStore((s) => s.lang);

  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeNode, setActiveNode] = useState<ConnectedEntity | null>(null);
  const [activeTab, setActiveTab] = useState<"graph" | "charts" | "timeline">("graph");

  useEffect(() => {
    // Find story in database or fallback
    const findStory = () => {
      fetch(`/api/stories/${slug}`)
        .then((r) => {
          if (!r.ok) throw new Error("Story not found");
          return r.json();
        })
        .then((data) => {
          setStory(translateStory(data, lang));
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    setLoading(true);
    setError(null);
    findStory();
  }, [slug, lang]);

  const dna = useMemo(() => {
    if (!story) return null;
    return deriveDNA(story);
  }, [story]);

  const interactive = useMemo(() => {
    if (!story) return null;
    return getStoryInteractiveData(story);
  }, [story]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <div className="text-xs uppercase tracking-widest text-[#C8A96A] animate-pulse">
          Loading DNA Engine…
        </div>
      </div>
    );
  }

  if (error || !story || !dna || !interactive) {
    throw notFound();
  }

  // Pre-select the first node as active
  const initialNode = interactive.entities[0];

  const handleListen = () => {
    const episode = {
      id: story.id || story.slug,
      slug: story.slug,
      title: story.title,
      titleHi: story.titleHi,
      excerpt: story.excerpt,
      excerptHi: story.excerptHi,
      audioUrl: `/api/stories/${story.slug}/audio`,
      duration: (parseInt(story.readTime || "5") || 5) * 60,
      authorName: story.authorName || "India Story Project",
      imageUrl: story.image || "/logo.png",
    };
    useAudioStore.getState().playEpisode(episode, lang);
    useAudioStore.getState().setPlayerOpen(true);
  };

  // Node position coordinates for Knowledge Graph
  const graphNodes = interactive.entities.map((node, i) => {
    const angle = (i / interactive.entities.length) * Math.PI * 2;
    const radius = 120; // Radius from center
    return {
      ...node,
      cx: 180 + Math.cos(angle) * radius,
      cy: 180 + Math.sin(angle) * radius,
    };
  });

  return (
    <SiteLayout>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0a0a0a",
          color: "white",
          padding: "40px 24px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Back Navigation Header */}
          <div style={{ marginBottom: "24px" }}>
            <Link
              to="/stories/$slug"
              params={{ slug: story.slug }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "#a0a0a0",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#C8A96A")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#a0a0a0")}
            >
              <ArrowLeft size={16} />
              Back to Story Reader
            </Link>
          </div>

          {/* Profile Overview */}
          <div
            style={{
              marginBottom: "40px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              paddingBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "20px",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#C8A96A",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Interactive Knowledge Console
                </span>
                <h1
                  style={{
                    fontSize: "36px",
                    fontWeight: 700,
                    fontFamily: "serif",
                    margin: 0,
                    lineHeight: "1.2",
                  }}
                >
                  {story.title}
                </h1>
                <p
                  style={{
                    color: "#a0a0a0",
                    fontSize: "14px",
                    marginTop: "8px",
                    maxWidth: "680px",
                  }}
                >
                  {interactive.summary}
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleListen}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)")
                  }
                >
                  <Headphones size={16} />
                  Listen Audio
                </button>

                <Link
                  to="/stories/$slug"
                  params={{ slug: story.slug }}
                  style={{
                    backgroundColor: "#C8A96A",
                    color: "black",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FileText size={16} />
                  Read Story Text
                </Link>
              </div>
            </div>
          </div>

          {/* Grid Layout (Left: Story DNA Helix | Right: Interactive Dashboard Panels) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "window.innerWidth > 900 ? '360px 1fr' : '1fr'",
              gap: "32px",
            }}
            className="grid lg:grid-cols-[360px_1fr]"
          >
            {/* ────────────────── LEFT COLUMN: STORY DNA HELIX ────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div
                style={{
                  backgroundColor: "#141414",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "20px",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#C8A96A",
                    marginBottom: "16px",
                  }}
                >
                  <Dna size={18} />
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                    }}
                  >
                    Story DNA Profile
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {/* Theme */}
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(200, 169, 106, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Sparkles size={16} color="#C8A96A" />
                    </div>
                    <div>
                      <span
                        style={{
                          display: "block",
                          fontSize: "10px",
                          color: "#808080",
                          textTransform: "uppercase",
                        }}
                      >
                        Theme
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: 600 }}>{dna.theme}</span>
                    </div>
                  </div>

                  {/* Impact Type */}
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(200, 169, 106, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Award size={16} color="#C8A96A" />
                    </div>
                    <div>
                      <span
                        style={{
                          display: "block",
                          fontSize: "10px",
                          color: "#808080",
                          textTransform: "uppercase",
                        }}
                      >
                        Impact Area
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: 600 }}>{dna.impactType}</span>
                    </div>
                  </div>

                  {/* Beneficiary */}
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(200, 169, 106, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Users size={16} color="#C8A96A" />
                    </div>
                    <div>
                      <span
                        style={{
                          display: "block",
                          fontSize: "10px",
                          color: "#808080",
                          textTransform: "uppercase",
                        }}
                      >
                        Beneficiary
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: 600 }}>{dna.beneficiary}</span>
                    </div>
                  </div>

                  {/* Emotion */}
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(200, 169, 106, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Heart size={16} color="#C8A96A" />
                    </div>
                    <div>
                      <span
                        style={{
                          display: "block",
                          fontSize: "10px",
                          color: "#808080",
                          textTransform: "uppercase",
                        }}
                      >
                        Primary Tone
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: 600 }}>{dna.emotion}</span>
                    </div>
                  </div>
                </div>

                {/* SDG Mappings */}
                <div
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    marginTop: "20px",
                    paddingTop: "16px",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: "10px",
                      color: "#808080",
                      textTransform: "uppercase",
                      marginBottom: "10px",
                    }}
                  >
                    UN SDG Alignment
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {dna.sdgs.map((sdg) => (
                      <div
                        key={sdg.id}
                        style={{
                          fontSize: "12px",
                          padding: "6px 12px",
                          backgroundColor: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.05)",
                          borderRadius: "6px",
                          color: "#d0d0d0",
                        }}
                      >
                        Goal {sdg.id}: {sdg.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ────────────────── RIGHT COLUMN: DASHBOARD CONSOLE ────────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Tabs Navigation */}
              <div
                style={{
                  display: "flex",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  gap: "24px",
                }}
              >
                <button
                  onClick={() => setActiveTab("graph")}
                  style={{
                    paddingBottom: "12px",
                    fontSize: "14px",
                    fontWeight: 600,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: activeTab === "graph" ? "#C8A96A" : "#a0a0a0",
                    borderBottom:
                      activeTab === "graph" ? "2px solid #C8A96A" : "2px solid transparent",
                  }}
                >
                  Relationship Graph
                </button>
                <button
                  onClick={() => setActiveTab("charts")}
                  style={{
                    paddingBottom: "12px",
                    fontSize: "14px",
                    fontWeight: 600,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: activeTab === "charts" ? "#C8A96A" : "#a0a0a0",
                    borderBottom:
                      activeTab === "charts" ? "2px solid #C8A96A" : "2px solid transparent",
                  }}
                >
                  Emotion & Impact Trends
                </button>
                <button
                  onClick={() => setActiveTab("timeline")}
                  style={{
                    paddingBottom: "12px",
                    fontSize: "14px",
                    fontWeight: 600,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: activeTab === "timeline" ? "#C8A96A" : "#a0a0a0",
                    borderBottom:
                      activeTab === "timeline" ? "2px solid #C8A96A" : "2px solid transparent",
                  }}
                >
                  Historical Milestones
                </button>
              </div>

              {/* Tab Contents */}
              <div style={{ flex: 1 }}>
                {/* 1. RELATIONSHIP GRAPH TAB */}
                {activeTab === "graph" && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "window.innerWidth > 900 ? '1fr 300px' : '1fr'",
                      gap: "24px",
                    }}
                    className="grid lg:grid-cols-[1fr_300px]"
                  >
                    {/* SVG Graph Canvas */}
                    <div
                      style={{
                        backgroundColor: "#141414",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "20px",
                        height: "400px",
                        position: "relative",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg width="360" height="360" style={{ position: "absolute", zIndex: 1 }}>
                        {/* Connecting lines from center to outer nodes */}
                        {graphNodes.map((node) => (
                          <line
                            key={node.id}
                            x1="180"
                            y1="180"
                            x2={node.cx}
                            y2={node.cy}
                            stroke="rgba(200, 169, 106, 0.25)"
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                          />
                        ))}

                        {/* Central Node representing the story */}
                        <circle
                          cx="180"
                          cy="180"
                          r="30"
                          fill="#000"
                          stroke="#C8A96A"
                          strokeWidth="2.5"
                          style={{ filter: "drop-shadow(0 0 10px rgba(200, 169, 106, 0.4))" }}
                        />
                        <text
                          x="180"
                          y="184"
                          textAnchor="middle"
                          fill="#C8A96A"
                          fontSize="9"
                          fontWeight="bold"
                        >
                          STORY
                        </text>

                        {/* Outer entity nodes */}
                        {graphNodes.map((node) => {
                          const isSelected =
                            activeNode?.id === node.id ||
                            (!activeNode && node.id === initialNode.id);
                          return (
                            <g
                              key={node.id}
                              style={{ cursor: "pointer" }}
                              onClick={() => setActiveNode(node)}
                            >
                              <circle
                                cx={node.cx}
                                cy={node.cy}
                                r="20"
                                fill={isSelected ? "#C8A96A" : "#141414"}
                                stroke={isSelected ? "#fff" : "rgba(255,255,255,0.15)"}
                                strokeWidth="2"
                              />
                              {/* Short Node Icon tag */}
                              <text
                                x={node.cx}
                                y={node.cy + 4}
                                textAnchor="middle"
                                fill={isSelected ? "black" : "#C8A96A"}
                                fontSize="8"
                                fontWeight="bold"
                              >
                                {node.type.substring(0, 3).toUpperCase()}
                              </text>
                            </g>
                          );
                        })}
                      </svg>

                      <div
                        style={{
                          position: "absolute",
                          bottom: "16px",
                          left: "16px",
                          fontSize: "11px",
                          color: "#606060",
                        }}
                      >
                        Click nodes to view connections
                      </div>
                    </div>

                    {/* Active Node Detail Card */}
                    <div
                      style={{
                        backgroundColor: "#141414",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "20px",
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      {(() => {
                        const node = activeNode || initialNode;
                        return (
                          <>
                            <div>
                              <span
                                style={{
                                  fontSize: "9px",
                                  padding: "3px 8px",
                                  backgroundColor: "rgba(200, 169, 106, 0.1)",
                                  color: "#C8A96A",
                                  borderRadius: "4px",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                }}
                              >
                                {node.type}
                              </span>
                              <h3
                                style={{
                                  fontSize: "18px",
                                  fontWeight: 700,
                                  marginTop: "12px",
                                  marginBottom: "8px",
                                  fontFamily: "serif",
                                }}
                              >
                                {node.name}
                              </h3>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#C8A96A",
                                  marginBottom: "12px",
                                  fontWeight: 500,
                                }}
                              >
                                Connection: {node.connectionReason}
                              </div>
                              <p style={{ fontSize: "13px", color: "#a0a0a0", lineHeight: "1.5" }}>
                                {node.description}
                              </p>
                            </div>

                            {node.type === "story" && (
                              <Link
                                to="/stories/$slug"
                                params={{ slug: story.slug }} // simple mock loop
                                style={{
                                  marginTop: "20px",
                                  backgroundColor: "rgba(255,255,255,0.04)",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                  color: "white",
                                  padding: "8px 12px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  textDecoration: "none",
                                  textAlign: "center",
                                  display: "block",
                                }}
                              >
                                View Related Story
                              </Link>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* 2. CHARTS TAB: EMOTION & IMPACT TRENDS */}
                {activeTab === "charts" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    {/* Emotion Progression Chart */}
                    <div
                      style={{
                        backgroundColor: "#141414",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "20px",
                        padding: "24px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "#C8A96A",
                          marginBottom: "16px",
                        }}
                      >
                        Emotion Mapping Chart (Progression Flow)
                      </h3>
                      <div style={{ height: "240px", width: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={interactive.emotionData}>
                            <XAxis dataKey="segment" stroke="#606060" fontSize={11} />
                            <YAxis stroke="#606060" fontSize={11} />
                            <ChartTooltip
                              contentStyle={{
                                backgroundColor: "#141414",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                              }}
                              labelStyle={{ fontWeight: "bold" }}
                            />
                            <Area
                              type="monotone"
                              dataKey="Hope"
                              stroke="#C8A96A"
                              fill="rgba(200, 169, 106, 0.15)"
                              strokeWidth={2}
                            />
                            <Area
                              type="monotone"
                              dataKey="Resolve"
                              stroke="#e07a5f"
                              fill="rgba(224, 122, 95, 0.1)"
                              strokeWidth={1.5}
                            />
                            <Area
                              type="monotone"
                              dataKey="Empathy"
                              stroke="#81b29a"
                              fill="rgba(129, 178, 154, 0.1)"
                              strokeWidth={1.5}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Impact footprint target chart */}
                    <div
                      style={{
                        backgroundColor: "#141414",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "20px",
                        padding: "24px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "#C8A96A",
                          marginBottom: "16px",
                        }}
                      >
                        Measurable Impact Footprint (Footprint vs Target Goal)
                      </h3>
                      <div style={{ height: "200px", width: "100%" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={interactive.impactData}>
                            <XAxis dataKey="metric" stroke="#606060" fontSize={11} />
                            <YAxis stroke="#606060" fontSize={11} />
                            <ChartTooltip
                              contentStyle={{
                                backgroundColor: "#141414",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "8px",
                              }}
                            />
                            <Bar dataKey="value" fill="#C8A96A" radius={[4, 4, 0, 0]}>
                              {interactive.impactData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    index === 1 ? "#81b29a" : index === 2 ? "#e07a5f" : "#C8A96A"
                                  }
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. HISTORICAL MILESTONES TIMELINE */}
                {activeTab === "timeline" && (
                  <div
                    style={{
                      backgroundColor: "#141414",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "20px",
                      padding: "28px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "24px",
                    }}
                  >
                    <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#C8A96A", margin: 0 }}>
                      Milestones & Event History Timeline
                    </h3>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        position: "relative",
                        paddingLeft: "20px",
                        borderLeft: "2px dashed rgba(200, 169, 106, 0.2)",
                      }}
                    >
                      {interactive.timeline.map((event, index) => (
                        <div key={index} style={{ position: "relative" }}>
                          {/* Left bullet tag */}
                          <div
                            style={{
                              position: "absolute",
                              left: "-27px",
                              top: "4px",
                              width: "12px",
                              height: "12px",
                              backgroundColor: "#C8A96A",
                              border: "2px solid #141414",
                              borderRadius: "50%",
                            }}
                          />

                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 700,
                              color: "#C8A96A",
                              display: "inline-block",
                              marginRight: "10px",
                            }}
                          >
                            {event.year}
                          </div>
                          <div
                            style={{ fontSize: "14px", fontWeight: 600, display: "inline-block" }}
                          >
                            {event.title}
                          </div>
                          <p
                            style={{
                              margin: "4px 0 0 0",
                              fontSize: "13px",
                              color: "#a0a0a0",
                              lineHeight: "1.4",
                            }}
                          >
                            {event.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
