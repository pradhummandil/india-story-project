import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Cloud, Clouds, Sparkles, Float, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ArrowRight, MapPin, X, Sparkles as SparkleIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

import { stories } from "@/lib/stories-data";
import { storyCoords } from "@/lib/homepage-stories";

// ---------- Data ----------
interface HotspotNode {
  id: string;
  state: string;
  x: number; // SVG-ish 0..500
  y: number; // SVG-ish 0..600
  stories: number;
  hero: string;
  categories: string[];
  featuredTitle: string;
  preview: string;
  slug: string; // story slug for navigation
}

// Approximate India outline polygon — matches the same projected space as hotspots.
const OUTLINE: Array<[number, number]> = [
  [180, 60],
  [240, 55],
  [300, 75],
  [345, 105],
  [365, 140],
  [355, 175],
  [380, 188],
  [415, 215],
  [430, 250],
  [420, 295],
  [395, 325],
  [375, 345],
  [385, 385],
  [375, 430],
  [355, 470],
  [325, 505],
  [295, 535],
  [265, 555],
  [240, 555],
  [220, 535],
  [200, 505],
  [190, 470],
  [185, 430],
  [200, 400],
  [188, 365],
  [205, 330],
  [218, 295],
  [212, 260],
  [222, 225],
  [218, 190],
  [225, 155],
  [212, 125],
  [195, 95],
];

// Project SVG-ish coords to world XZ. North (smaller y) → smaller z (negative).
const SCALE = 14;
const worldFromMap = (x: number, y: number): [number, number] => [
  (x - 270) / SCALE,
  (y - 300) / SCALE,
];

// ---------- 3D pieces ----------

function IndiaLandmass({
  hovered,
  selected,
  activeIds,
  hasFilter,
}: {
  hovered: HotspotNode | null;
  selected: HotspotNode | null;
  activeIds: Set<string>;
  hasFilter: boolean;
}) {
  const { shape, edges } = useMemo(() => {
    const s = new THREE.Shape();
    OUTLINE.forEach(([mx, my], i) => {
      const [x, z] = worldFromMap(mx, my);
      if (i === 0) s.moveTo(x, -z);
      else s.lineTo(x, -z);
    });
    s.closePath();

    const geom = new THREE.ExtrudeGeometry(s, {
      depth: 1.1,
      bevelEnabled: true,
      bevelThickness: 0.35,
      bevelSize: 0.35,
      bevelSegments: 6,
      curveSegments: 24,
    });
    geom.computeVertexNormals();

    const edgeGeom = new THREE.EdgesGeometry(geom, 25);
    return { shape: geom, edges: edgeGeom };
  }, []);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh geometry={shape} castShadow receiveShadow>
        <meshStandardMaterial
          color={"#1a1410"}
          roughness={0.85}
          metalness={0.2}
          emissive={"#3b2a14"}
          emissiveIntensity={0.18}
        />
      </mesh>
      <lineSegments geometry={edges} position={[0, 0, 1.12]}>
        <lineBasicMaterial color={"#e8b261"} transparent opacity={0.8} />
      </lineSegments>
      {(hovered || selected || hasFilter || activeIds.size > 0) && null}
    </group>
  );
}

function Hotspot({
  node,
  active,
  dim,
  onHover,
  onClick,
}: {
  node: HotspotNode;
  active: boolean;
  dim: boolean;
  onHover: (n: HotspotNode | null) => void;
  onClick: (n: HotspotNode) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const [px, pz] = worldFromMap(node.x, node.y);

  const richness = Math.min(1.6, 0.55 + node.stories / 35);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.y = 1.6 + Math.sin(t * 1.4 + node.x) * 0.08;
    }
    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (active ? 0.55 : 0.28) + Math.sin(t * 2 + node.y) * 0.08;
    }
  });

  const intensity = active ? 1 : dim ? 0.25 : 0.75;
  const color = active ? "#ffd07a" : "#e8b261";

  return (
    <group ref={ref} position={[px, 1.6, pz]}>
      <mesh ref={beamRef} position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.04 * richness, 0.18 * richness, 2.4, 16, 1, true]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <Float speed={2} floatIntensity={0.4} rotationIntensity={0}>
        <mesh
          scale={richness}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
            onHover(node);
          }}
          onPointerOut={() => {
            document.body.style.cursor = "";
            onHover(null);
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick(node);
          }}
        >
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={intensity * 2.2}
            roughness={0.3}
          />
        </mesh>
      </Float>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.55, 0]}>
        <ringGeometry args={[0.35 * richness, 0.55 * richness, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={active ? 0.55 : 0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      <pointLight color={color} intensity={active ? 1.6 : 0.6} distance={4} decay={2} />
    </group>
  );
}

function CameraRig({ target }: { target: HotspotNode | null }) {
  const { camera } = useThree();
  useEffect(() => {
    if (target) {
      const [px, pz] = worldFromMap(target.x, target.y);
      gsap.to(camera.position, {
        x: px + 2.5,
        y: 6,
        z: pz + 5,
        duration: 1.4,
        ease: "power3.inOut",
        onUpdate: () => camera.lookAt(px, 1.2, pz),
      });
    } else {
      gsap.to(camera.position, {
        x: 0,
        y: 18,
        z: 16,
        duration: 1.4,
        ease: "power3.inOut",
        onUpdate: () => camera.lookAt(0, 0, 0),
      });
    }
  }, [target, camera]);
  return null;
}

function Scene({
  hotspots,
  hovered,
  selected,
  setHovered,
  setSelected,
  activeFilter,
}: {
  hotspots: HotspotNode[];
  hovered: HotspotNode | null;
  selected: HotspotNode | null;
  setHovered: (n: HotspotNode | null) => void;
  setSelected: (n: HotspotNode | null) => void;
  activeFilter: string | null;
}) {
  const activeIds = useMemo(() => {
    if (!activeFilter) return new Set<string>();
    return new Set(hotspots.filter((n) => n.categories.includes(activeFilter)).map((n) => n.id));
  }, [activeFilter, hotspots]);

  return (
    <>
      <color attach="background" args={["#0a0806"]} />
      <fog attach="fog" args={["#0a0806", 25, 55]} />

      <ambientLight intensity={0.35} color={"#3b2a18"} />
      <directionalLight
        position={[8, 18, 10]}
        intensity={1.4}
        color={"#ffd9a3"}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-10, 8, -6]} intensity={0.4} color={"#7aa0ff"} />
      <pointLight position={[0, 6, 0]} intensity={0.6} color={"#e8b261"} />

      <CameraRig target={selected} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]} receiveShadow>
        <circleGeometry args={[40, 64]} />
        <meshStandardMaterial color={"#06090d"} roughness={1} metalness={0.4} />
      </mesh>

      {[10, 18, 28].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.29, 0]}>
          <ringGeometry args={[r, r + 0.04, 96]} />
          <meshBasicMaterial color={"#e8b261"} transparent opacity={0.06} />
        </mesh>
      ))}

      <IndiaLandmass
        hovered={hovered}
        selected={selected}
        activeIds={activeIds}
        hasFilter={!!activeFilter}
      />

      {hotspots.map((n) => {
        const isActive = activeFilter ? activeIds.has(n.id) : true;
        const isFocus = selected?.id === n.id || hovered?.id === n.id;
        return (
          <Hotspot
            key={n.id}
            node={n}
            active={isFocus || (!!activeFilter && isActive)}
            dim={!!activeFilter && !isActive}
            onHover={setHovered}
            onClick={(node) => setSelected(node)}
          />
        );
      })}

      <Clouds material={THREE.MeshBasicMaterial} limit={40}>
        <Cloud
          segments={28}
          bounds={[14, 1.5, 14]}
          volume={6}
          color="#1a1410"
          position={[2, 7, -2]}
          opacity={0.35}
        />
        <Cloud
          segments={20}
          bounds={[10, 1, 10]}
          volume={4}
          color="#2a1f15"
          position={[-4, 8, 3]}
          opacity={0.3}
        />
        <Cloud
          segments={16}
          bounds={[8, 1, 8]}
          volume={3}
          color="#241a10"
          position={[6, 9, 5]}
          opacity={0.25}
        />
      </Clouds>

      <Sparkles
        count={120}
        size={2}
        scale={[35, 12, 35]}
        speed={0.3}
        color={"#e8b261"}
        opacity={0.6}
      />
      <Sparkles
        count={60}
        size={1.2}
        scale={[25, 6, 25]}
        speed={0.5}
        color={"#ffd07a"}
        opacity={0.5}
      />

      {hovered &&
        !selected &&
        (() => {
          const [px, pz] = worldFromMap(hovered.x, hovered.y);
          return (
            <Html position={[px, 3.3, pz]} center distanceFactor={10} zIndexRange={[10, 0]}>
              <div className="pointer-events-none whitespace-nowrap rounded-full bg-background/80 backdrop-blur border border-gold/30 px-3 py-1.5 text-xs">
                <span className="text-gold uppercase tracking-widest mr-2">{hovered.state}</span>
                <span className="text-muted-foreground">{hovered.stories} stories</span>
              </div>
            </Html>
          );
        })()}

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={10}
        maxDistance={30}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.4}
        autoRotate={!selected && !hovered}
        autoRotateSpeed={0.35}
        target={[0, 0, 0]}
      />
    </>
  );
}

// ---------- Outer component ----------
export function ExploreIndia3D() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState<HotspotNode | null>(null);
  const [selected, setSelected] = useState<HotspotNode | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of stories) {
      if (s.category) set.add(s.category);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  const hotspots = useMemo<HotspotNode[]>(() => {
    // Region-level hotspots (matches original “state beacons” UX).
    const byRegion = new Map<string, typeof stories>();
    for (const s of stories) {
      const key = s.region || "India";
      const arr = byRegion.get(key) ?? [];
      arr.push(s);
      byRegion.set(key, arr);
    }

    // Deterministic but stable ordering.
    const regions = Array.from(byRegion.keys()).sort((a, b) => a.localeCompare(b));

    return regions.map((region, idx) => {
      const list = byRegion.get(region)!;
      const categories = Array.from(new Set(list.map((s) => s.category).filter(Boolean)));
      const featured = list[0];

      // Deterministic coords per region + index.
      const coords = storyCoords(region, `${region}|${idx}`);

      // Derive a non-placeholder “hero” label from real story fields.
      // UI stays identical; the value is no longer the synthetic string "Featured".
      const heroLabel = featured.category || featured.region || region;

      return {
        id: region,
        state: region,
        x: coords.x,
        y: coords.y,
        stories: list.length,
        hero: heroLabel,
        categories: categories.slice(0, 3),
        featuredTitle: featured.title,
        preview: featured.excerpt,
        slug: featured.slug,
      };
    });
  }, []);

  return (
    <section className="relative w-full overflow-hidden py-24 md:py-32">
      <div className="absolute inset-0 bg-hero opacity-50 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 size-[480px] rounded-full bg-gold/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 size-[420px] rounded-full bg-saffron/10 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 relative">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-xs uppercase tracking-widest text-gold mb-4 inline-flex items-center gap-2"
          >
            <SparkleIcon className="size-3.5" /> Explore India in 3D
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display text-4xl md:text-6xl leading-[1.05]"
          >
            Travel the country,{" "}
            <span className="text-gradient-gold italic">one story at a time</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 text-lg text-muted-foreground leading-relaxed"
          >
            Drag to orbit. Hover a beacon to glimpse a state's story collection. Click to fly in and
            meet the heroes shaping India today.
          </motion.p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <span className="text-xs uppercase tracking-widest text-muted-foreground mr-2 inline-flex items-center gap-2">
            <Filter className="size-3.5" /> Filter by theme
          </span>
          {categories.slice(0, 7).map((f) => {
            const active = filter === f;
            return (
              <motion.button
                key={f}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setFilter(active ? null : f)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? "bg-gradient-to-r from-gold to-saffron text-gold-foreground border-transparent shadow-glow"
                    : "border-gold/20 text-muted-foreground hover:text-foreground hover:border-gold/40"
                }`}
              >
                {f}
              </motion.button>
            );
          })}
          {filter && (
            <button
              onClick={() => setFilter(null)}
              className="text-xs text-muted-foreground underline-offset-4 hover:underline ml-1"
            >
              Clear
            </button>
          )}
        </div>

        <div className="relative glass rounded-3xl overflow-hidden border border-gold/15">
          <div className="aspect-[16/10] md:aspect-[16/9] w-full relative">
            {mounted ? (
              <Canvas
                shadows
                dpr={[1, 1.6]}
                camera={{ position: [0, 18, 16], fov: 45 }}
                gl={{ antialias: true, powerPreference: "high-performance" }}
              >
                <Suspense fallback={null}>
                  <Scene
                    hotspots={hotspots}
                    hovered={hovered}
                    selected={selected}
                    setHovered={setHovered}
                    setSelected={setSelected}
                    activeFilter={filter}
                  />
                </Suspense>
              </Canvas>
            ) : (
              <div className="absolute inset-0 grid place-items-center text-muted-foreground text-sm">
                Loading immersive map…
              </div>
            )}

            <AnimatePresence>
              {selected && (
                <motion.aside
                  key={selected.id}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-4 right-4 md:top-6 md:right-6 w-[min(360px,calc(100%-2rem))] glass rounded-2xl p-6 border border-gold/30 shadow-elegant"
                >
                  <button
                    onClick={() => setSelected(null)}
                    className="absolute top-3 right-3 size-7 grid place-items-center rounded-full hover:bg-gold/10 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close"
                  >
                    <X className="size-4" />
                  </button>

                  <div className="flex items-center gap-2 text-xs text-gold mb-3">
                    <MapPin className="size-3.5" />
                    <span className="uppercase tracking-widest">{selected.state}</span>
                  </div>

                  <div
                    className="h-32 rounded-xl mb-4 relative overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.55 0.2 50), oklch(0.35 0.15 30))",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                    <div className="absolute bottom-2 left-3 text-xs text-gold/90 uppercase tracking-widest">
                      {selected.hero}
                    </div>
                  </div>

                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    {selected.categories.join(" · ")}
                  </p>
                  <h3 className="font-display text-xl leading-tight mb-2">
                    {selected.featuredTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {selected.preview}
                  </p>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                      <span className="text-gold font-medium">{selected.stories}</span> stories
                    </span>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-gold to-saffron text-gold-foreground border-0 shadow-glow"
                      onClick={() => navigate({ to: `/stories/${selected.slug}` })}
                    >
                      Read story
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 glass rounded-full px-4 py-2 text-[11px] uppercase tracking-widest text-muted-foreground flex items-center gap-3 border border-gold/15">
              <span className="size-1.5 rounded-full bg-gold shadow-[0_0_8px_var(--gold)]" />
              brighter beacons = richer story collections
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ExploreIndia3D;
