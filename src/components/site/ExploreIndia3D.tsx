import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Cloud, Clouds, Sparkles, Float, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ArrowRight, MapPin, X, Sparkles as SparkleIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

// ---------- Data ----------
interface StateNode {
  id: string;
  state: string;
  x: number; // SVG-ish 0..500
  y: number; // SVG-ish 0..600
  stories: number;
  hero: string;
  categories: string[];
  featuredTitle: string;
  preview: string;
}

const NODES: StateNode[] = [
  { id: "jk", state: "Jammu & Kashmir", x: 200, y: 80,  stories: 12, hero: "Mehbooba Ali",  categories: ["Culture", "Humanity"],            featuredTitle: "Saffron Fields of Pampore",            preview: "Generations of saffron farmers reclaiming a Himalayan tradition." },
  { id: "pb", state: "Punjab",          x: 220, y: 140, stories: 13, hero: "Harpreet Kaur", categories: ["Rural Development", "Women Empowerment"], featuredTitle: "She Drives the Tractor",        preview: "Women farmers rewriting Punjab's agricultural story." },
  { id: "ut", state: "Uttarakhand",     x: 275, y: 155, stories: 18, hero: "Vikram Singh",  categories: ["Innovation", "Education"],        featuredTitle: "Coding Schools in the Himalayas",      preview: "Training tribal youth to build software from a remote mountain village." },
  { id: "rj", state: "Rajasthan",       x: 195, y: 230, stories: 24, hero: "Bhanwar Lal",   categories: ["Culture", "Rural Development"],   featuredTitle: "Guardians of the Thar",                preview: "Desert artisans preserving block-print traditions across generations." },
  { id: "up", state: "Uttar Pradesh",   x: 290, y: 215, stories: 31, hero: "Aarav Khanna",  categories: ["Culture", "Humanity"],            featuredTitle: "Reimagining Royal Awadhi Cuisine",     preview: "A young chef blending Nawabi recipes with modern fine dining." },
  { id: "as", state: "Assam",           x: 395, y: 215, stories: 22, hero: "Ratna Devi",    categories: ["Women Empowerment", "Culture"],   featuredTitle: "The Weaver Who Revived a Forgotten Loom", preview: "Bringing back a 400-year-old weaving tradition — one thread at a time." },
  { id: "wb", state: "West Bengal",     x: 365, y: 260, stories: 19, hero: "Suman Bose",    categories: ["Culture", "Education"],           featuredTitle: "Kolkata's Last Letter Painters",       preview: "Street typographers keeping a vanishing craft alive on tram walls." },
  { id: "gj", state: "Gujarat",         x: 155, y: 285, stories: 16, hero: "Rohan Patel",   categories: ["Environment", "Rural Development"], featuredTitle: "Salt of the Rann",                   preview: "Salt farmers turning desert flats into solar-powered livelihoods." },
  { id: "mh", state: "Maharashtra",     x: 210, y: 335, stories: 27, hero: "Priya Naik",    categories: ["Innovation", "Environment"],      featuredTitle: "Mumbai's Vertical Forests",            preview: "Architects turning concrete jungles into living green corridors." },
  { id: "od", state: "Odisha",          x: 335, y: 320, stories: 14, hero: "Sanyukta Das",  categories: ["Culture", "Humanity"],            featuredTitle: "The Loom That Speaks",                 preview: "Tribal weavers narrating folklore through ikat patterns." },
  { id: "tg", state: "Telangana",       x: 275, y: 380, stories: 21, hero: "Lakshmi Reddy", categories: ["Environment", "Rural Development"], featuredTitle: "The Silent Revolution of Millet Farmers", preview: "Smallholder farmers reshaping India's food future." },
  { id: "ka", state: "Karnataka",       x: 245, y: 440, stories: 29, hero: "Arjun Rao",     categories: ["Innovation", "Education"],        featuredTitle: "Designing a Made-in-India Spacecraft", preview: "Engineers behind India's most ambitious private space mission." },
  { id: "tn", state: "Tamil Nadu",      x: 285, y: 500, stories: 25, hero: "Meera Iyer",    categories: ["Culture", "Education"],           featuredTitle: "Bharatanatyam in the Digital Age",     preview: "A young dancer reinterpreting an ancient art for global stages." },
  { id: "kl", state: "Kerala",          x: 240, y: 520, stories: 20, hero: "Thomas Joseph", categories: ["Environment", "Humanity"],        featuredTitle: "The Backwater Restorers",              preview: "Fisher communities reviving Kerala's lifeline waterways." },
];

const FILTERS = [
  "Environment",
  "Women Empowerment",
  "Innovation",
  "Education",
  "Humanity",
  "Culture",
  "Rural Development",
] as const;

// Approximate India outline polygon — matches the same projected space as NODES.
const OUTLINE: Array<[number, number]> = [
  [180, 60],  [240, 55],  [300, 75],  [345, 105], [365, 140],
  [355, 175], [380, 188], [415, 215], [430, 250], [420, 295],
  [395, 325], [375, 345], [385, 385], [375, 430], [355, 470],
  [325, 505], [295, 535], [265, 555], [240, 555], [220, 535],
  [200, 505], [190, 470], [185, 430], [200, 400], [188, 365],
  [205, 330], [218, 295], [212, 260], [222, 225], [218, 190],
  [225, 155], [212, 125], [195, 95],
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
  hovered: StateNode | null;
  selected: StateNode | null;
  activeIds: Set<string>;
  hasFilter: boolean;
}) {
  const { shape, edges } = useMemo(() => {
    const s = new THREE.Shape();
    OUTLINE.forEach(([mx, my], i) => {
      const [x, z] = worldFromMap(mx, my);
      // Shape lives in XY; we'll rotate the mesh later so Y maps to Z.
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
      {/* Base landmass */}
      <mesh geometry={shape} castShadow receiveShadow>
        <meshStandardMaterial
          color={"#1a1410"}
          roughness={0.85}
          metalness={0.2}
          emissive={"#3b2a14"}
          emissiveIntensity={0.18}
        />
      </mesh>
      {/* Gold edge accent */}
      <lineSegments geometry={edges} position={[0, 0, 1.12]}>
        <lineBasicMaterial color={"#e8b261"} transparent opacity={0.8} />
      </lineSegments>
      {/* Subtle highlight when hovered/selected lives on hotspot, not landmass */}
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
  node: StateNode;
  active: boolean;
  dim: boolean;
  onHover: (n: StateNode | null) => void;
  onClick: (n: StateNode) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const [px, pz] = worldFromMap(node.x, node.y);
  // Story richness — visual scale.
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
      {/* Vertical light beam */}
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

      {/* Glow sphere */}
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

      {/* Outer halo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.55, 0]}>
        <ringGeometry args={[0.35 * richness, 0.55 * richness, 32]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.55 : 0.25} side={THREE.DoubleSide} />
      </mesh>

      <pointLight color={color} intensity={active ? 1.6 : 0.6} distance={4} decay={2} />
    </group>
  );
}

function CameraRig({ target }: { target: StateNode | null }) {
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
  hovered,
  selected,
  setHovered,
  setSelected,
  activeFilter,
}: {
  hovered: StateNode | null;
  selected: StateNode | null;
  setHovered: (n: StateNode | null) => void;
  setSelected: (n: StateNode | null) => void;
  activeFilter: string | null;
}) {
  const activeIds = useMemo(() => {
    if (!activeFilter) return new Set<string>();
    return new Set(NODES.filter((n) => n.categories.includes(activeFilter)).map((n) => n.id));
  }, [activeFilter]);

  return (
    <>
      <color attach="background" args={["#0a0806"]} />
      <fog attach="fog" args={["#0a0806", 25, 55]} />

      {/* Lights */}
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

      {/* Ground (water) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]} receiveShadow>
        <circleGeometry args={[40, 64]} />
        <meshStandardMaterial color={"#06090d"} roughness={1} metalness={0.4} />
      </mesh>

      {/* Subtle grid rings */}
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

      {/* Hotspots */}
      {NODES.map((n) => {
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

      {/* Clouds */}
      <Clouds material={THREE.MeshBasicMaterial} limit={40}>
        <Cloud segments={28} bounds={[14, 1.5, 14]} volume={6} color="#1a1410" position={[2, 7, -2]} opacity={0.35} />
        <Cloud segments={20} bounds={[10, 1, 10]} volume={4} color="#2a1f15" position={[-4, 8, 3]} opacity={0.3} />
        <Cloud segments={16} bounds={[8, 1, 8]} volume={3} color="#241a10" position={[6, 9, 5]} opacity={0.25} />
      </Clouds>

      {/* Ambient sparkles */}
      <Sparkles count={120} size={2} scale={[35, 12, 35]} speed={0.3} color={"#e8b261"} opacity={0.6} />
      <Sparkles count={60} size={1.2} scale={[25, 6, 25]} speed={0.5} color={"#ffd07a"} opacity={0.5} />

      {/* Hover label in 3D */}
      {hovered && !selected && (
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
        })()
      )}

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
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState<StateNode | null>(null);
  const [selected, setSelected] = useState<StateNode | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  return (
    <section className="relative w-full overflow-hidden py-24 md:py-32">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-hero opacity-50 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 size-[480px] rounded-full bg-gold/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 size-[420px] rounded-full bg-saffron/10 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 relative">
        {/* Heading */}
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
            Travel the country, <span className="text-gradient-gold italic">one story at a time</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-6 text-lg text-muted-foreground leading-relaxed"
          >
            Drag to orbit. Hover a beacon to glimpse a state's story collection.
            Click to fly in and meet the heroes shaping India today.
          </motion.p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <span className="text-xs uppercase tracking-widest text-muted-foreground mr-2 inline-flex items-center gap-2">
            <Filter className="size-3.5" /> Filter by theme
          </span>
          {FILTERS.map((f) => {
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

        {/* Canvas */}
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

            {/* Floating preview card (DOM overlay) */}
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
                    >
                      Read story
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Legend */}
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
