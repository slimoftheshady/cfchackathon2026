import { useState, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Screen = "map" | "region" | "camera" | "log" | "profile" | "resources";

interface Region {
  id: string;
  name: string;
  tagline: string;
  color: string;
  accent: string;
  speciesCount: number;
  sightings: number;
  flora: Species[];
  fauna: Species[];
}

interface Species {
  id: string;
  name: string;
  scientific: string;
  type: "flora" | "fauna";
  rarity: "common" | "uncommon" | "rare" | "endangered";
  points: number;
  description: string;
  imageId: string;
}

interface LogEntry {
  id: string;
  species: Species;
  region: Region;
  date: string;
  time: string;
  notes: string;
  confidence: number;
  points: number;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const REGIONS: Region[] = [
  {
    id: "kimberley",
    name: "Kimberley",
    tagline: "Ancient gorges & monsoon forests",
    color: "#8B4513",
    accent: "#D2691E",
    speciesCount: 247,
    sightings: 1842,
    flora: [
      { id: "b1", name: "Boab Tree", scientific: "Adansonia gregorii", type: "flora", rarity: "uncommon", points: 45, description: "The iconic bottle-shaped tree unique to the Kimberley. Can live for over 1,500 years and store water in its trunk.", imageId: "photo-1590674899484-d5640e854abe" },
      { id: "s1", name: "Sturt's Desert Rose", scientific: "Gossypium sturtianum", type: "flora", rarity: "common", points: 15, description: "A shrub with large purple flowers found across arid and semi-arid regions.", imageId: "photo-1470509037663-253d2d33ef4c" },
      { id: "k1", name: "Kimberley Baeckea", scientific: "Baeckea pachyphylla", type: "flora", rarity: "rare", points: 80, description: "A small shrub endemic to the Kimberley with delicate white flowers.", imageId: "photo-1504711434969-e33886168f5c" },
    ],
    fauna: [
      { id: "q1", name: "Freshwater Crocodile", scientific: "Crocodylus johnstoni", type: "fauna", rarity: "uncommon", points: 60, description: "Smaller than its saltwater cousin, this species inhabits freshwater rivers and pools of the Kimberley.", imageId: "photo-1516026672322-bc52d61a55d5" },
      { id: "q2", name: "Gouldian Finch", scientific: "Erythrura gouldiae", type: "fauna", rarity: "endangered", points: 120, description: "One of Australia's most brilliantly coloured birds, now critically endangered due to habitat loss.", imageId: "photo-1444464666168-49d633b86797" },
    ],
  },
  {
    id: "pilbara",
    name: "Pilbara",
    tagline: "Red earth & ancient spinifex plains",
    color: "#B5651D",
    accent: "#CD853F",
    speciesCount: 189,
    sightings: 1124,
    flora: [
      { id: "p1", name: "Pilbara Grevillea", scientific: "Grevillea parallela", type: "flora", rarity: "uncommon", points: 40, description: "A spreading shrub with white toothbrush flowers that attract honeyeaters.", imageId: "photo-1490750967868-88df5691cc5e" },
      { id: "p2", name: "Spinifex Grass", scientific: "Triodia pungens", type: "flora", rarity: "common", points: 10, description: "The iconic hard spinifex that dominates Australia's arid interior landscapes.", imageId: "photo-1501854140801-50d01698950b" },
    ],
    fauna: [
      { id: "p3", name: "Pilbara Olive Python", scientific: "Liasis olivaceus barroni", type: "fauna", rarity: "rare", points: 90, description: "Australia's second largest snake, found only in the Pilbara. A powerful constrictor.", imageId: "photo-1504606498831-1d4a5d2ef77b" },
    ],
  },
  {
    id: "southwest",
    name: "Southwest",
    tagline: "Global biodiversity hotspot",
    color: "#2D5016",
    accent: "#5a7a3a",
    speciesCount: 412,
    sightings: 3291,
    flora: [
      { id: "sw1", name: "Kangaroo Paw", scientific: "Anigozanthos manglesii", type: "flora", rarity: "common", points: 20, description: "WA's floral emblem. The unique paw-like flowers are covered in dense red and green hairs.", imageId: "photo-1490750967868-88df5691cc5e" },
      { id: "sw2", name: "Banksia", scientific: "Banksia menziesii", type: "flora", rarity: "common", points: 15, description: "Firewood banksia with large orange-red flower cones. Essential food for birds and mammals.", imageId: "photo-1583337130417-3346a1be7dee" },
      { id: "sw3", name: "Grass Tree", scientific: "Xanthorrhoea preissii", type: "flora", rarity: "uncommon", points: 35, description: "Ancient slow-growing plant that may live over 600 years. Fire-adapted and ecologically vital.", imageId: "photo-1566936737687-8f392a237b8b" },
      { id: "sw4", name: "Western Underground Orchid", scientific: "Rhizanthella gardneri", type: "flora", rarity: "endangered", points: 150, description: "One of the world's rarest plants — spends its entire life cycle underground, never seeing light.", imageId: "photo-1490750967868-88df5691cc5e" },
    ],
    fauna: [
      { id: "sw5", name: "Quokka", scientific: "Setonix brachyurus", type: "fauna", rarity: "uncommon", points: 50, description: "The world's happiest-looking marsupial, found mainly on Rottnest Island and coastal southwest.", imageId: "photo-1530106397714-51f2fadb4e21" },
      { id: "sw6", name: "Numbat", scientific: "Myrmecobius fasciatus", type: "fauna", rarity: "endangered", points: 130, description: "WA's faunal emblem. A striped marsupial that feeds exclusively on termites. Fewer than 1000 remain.", imageId: "photo-1509847863929-2a2940b16219" },
    ],
  },
  {
    id: "goldfields",
    name: "Goldfields-Esperance",
    tagline: "Salt lakes & ancient woodlands",
    color: "#8B7355",
    accent: "#C8860A",
    speciesCount: 203,
    sightings: 876,
    flora: [
      { id: "g1", name: "Salmon Gum", scientific: "Eucalyptus salmonophloia", type: "flora", rarity: "uncommon", points: 30, description: "Named for its beautiful salmon-pink smooth bark. Dominant tree of the goldfields woodlands.", imageId: "photo-1448375240586-882707db888b" },
      { id: "g2", name: "Desert Grevillea", scientific: "Grevillea eriostachya", type: "flora", rarity: "common", points: 15, description: "A striking shrub with bright yellow flower spikes that attract honeyeaters.", imageId: "photo-1504711434969-e33886168f5c" },
    ],
    fauna: [
      { id: "g3", name: "Malleefowl", scientific: "Leipoa ocellata", type: "fauna", rarity: "rare", points: 85, description: "A remarkable ground-dwelling bird that builds enormous mound nests to incubate its eggs.", imageId: "photo-1444464666168-49d633b86797" },
    ],
  },
  {
    id: "gascoyne",
    name: "Gascoyne",
    tagline: "Coral coast & river red gums",
    color: "#2F6B8A",
    accent: "#4A9BBF",
    speciesCount: 156,
    sightings: 734,
    flora: [
      { id: "ga1", name: "River Red Gum", scientific: "Eucalyptus camaldulensis", type: "flora", rarity: "common", points: 10, description: "Australia's most widespread eucalyptus, found along waterways providing critical habitat.", imageId: "photo-1448375240586-882707db888b" },
    ],
    fauna: [
      { id: "ga2", name: "Dugong", scientific: "Dugong dugon", type: "fauna", rarity: "rare", points: 100, description: "The ocean's gentle giant. Shark Bay holds one of the world's largest dugong populations.", imageId: "photo-1544551763-77ef2d0cfc6c" },
      { id: "ga3", name: "Loggerhead Sea Turtle", scientific: "Caretta caretta", type: "fauna", rarity: "endangered", points: 110, description: "Ancient mariners that nest on Shark Bay beaches. Can live for over 70 years.", imageId: "photo-1437622368342-7a3d73a34c8f" },
    ],
  },
  {
    id: "great-southern",
    name: "Great Southern",
    tagline: "Granite outcrops & coastal heathlands",
    color: "#4A6741",
    accent: "#7FAD6B",
    speciesCount: 318,
    sightings: 2104,
    flora: [
      { id: "gs1", name: "Walpole Witch", scientific: "Agrostocrinum scabrum", type: "flora", rarity: "rare", points: 70, description: "A delicate lily with blue star-shaped flowers found in the wet forests near Walpole.", imageId: "photo-1470509037663-253d2d33ef4c" },
      { id: "gs2", name: "Albany Pitcher Plant", scientific: "Cephalotus follicularis", type: "flora", rarity: "rare", points: 95, description: "WA's only native carnivorous plant — catches and digests insects in its tiny pitchers.", imageId: "photo-1504711434969-e33886168f5c" },
    ],
    fauna: [
      { id: "gs3", name: "Western Ringtail Possum", scientific: "Pseudocheirus occidentalis", type: "fauna", rarity: "endangered", points: 100, description: "A critically endangered marsupial that relies on peppermint trees for food and shelter.", imageId: "photo-1551028719-00167b16eac5" },
    ],
  },
];

const RESOURCES = [
  {
    id: "r1",
    title: "WA Biodiversity Strategy 2023–2028",
    org: "DBCA",
    type: "Policy",
    summary: "Western Australia's roadmap for protecting its unique biodiversity over the next five years, including priority actions for threatened species recovery.",
    url: "#",
    color: "#2D5016",
    icon: "📋",
  },
  {
    id: "r2",
    title: "Bush Forever Program",
    org: "City of Perth",
    type: "Program",
    summary: "Protecting over 51,000 hectares of native bushland in the Perth metropolitan region through a network of 287 sites.",
    url: "#",
    color: "#1e3a0f",
    icon: "🌿",
  },
  {
    id: "r3",
    title: "Threatened Species List WA",
    org: "DBCA",
    type: "Reference",
    summary: "The official register of Western Australia's threatened flora and fauna, updated annually with conservation status and recovery plans.",
    url: "#",
    color: "#6b4c2a",
    icon: "⚠️",
  },
  {
    id: "r4",
    title: "NatureMap",
    org: "DBCA",
    type: "Tool",
    summary: "Comprehensive mapping portal for Western Australian biodiversity records, combining over 7 million species occurrence records.",
    url: "#",
    color: "#2F6B8A",
    icon: "🗺",
  },
  {
    id: "r5",
    title: "Gondwana Link",
    org: "Gondwana Link Ltd",
    type: "Initiative",
    summary: "Reconnecting 1,000 km of fragmented bushland from the wet southwest to the arid Nullarbor — one of the world's great restoration projects.",
    url: "#",
    color: "#4A6741",
    icon: "🔗",
  },
  {
    id: "r6",
    title: "Shark Bay World Heritage Area",
    org: "UNESCO / Parks WA",
    type: "Heritage",
    summary: "Home to dugongs, sea turtles, stromatolites, and the world's largest seagrass bank. A living laboratory for evolution and ecology.",
    url: "#",
    color: "#2F6B8A",
    icon: "🌊",
  },
];

// ── WA Map SVG ─────────────────────────────────────────────────────────────────

const WA_REGIONS_SVG = [
  { id: "kimberley", name: "Kimberley", d: "M 80 30 L 220 30 L 230 80 L 200 110 L 150 120 L 90 100 Z", cx: 155, cy: 70 },
  { id: "pilbara", name: "Pilbara", d: "M 50 110 L 90 100 L 150 120 L 200 110 L 210 160 L 160 180 L 90 170 L 50 150 Z", cx: 130, cy: 140 },
  { id: "gascoyne", name: "Gascoyne", d: "M 30 170 L 50 150 L 90 170 L 160 180 L 165 230 L 120 250 L 60 240 L 25 210 Z", cx: 95, cy: 207 },
  { id: "goldfields", name: "Goldfields", d: "M 160 180 L 210 160 L 250 170 L 260 280 L 200 290 L 165 270 L 165 230 Z", cx: 213, cy: 230 },
  { id: "great-southern", name: "Gt. Southern", d: "M 120 250 L 165 270 L 200 290 L 190 320 L 140 330 L 100 310 L 95 280 Z", cx: 148, cy: 295 },
  { id: "southwest", name: "Southwest", d: "M 25 210 L 60 240 L 95 280 L 100 310 L 70 330 L 30 310 L 15 270 L 20 240 Z", cx: 57, cy: 275 },
];

// ── Utility ───────────────────────────────────────────────────────────────────

const rarityColor: Record<string, string> = {
  common: "#5a7a3a",
  uncommon: "#c8860a",
  rare: "#8B4513",
  endangered: "#c0392b",
};

const rarityLabel: Record<string, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  endangered: "Endangered",
};

const unsplash = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

// ── Mock data ─────────────────────────────────────────────────────────────────

const USER = {
  name: "Alex M.",
  points: 485,
  rank: 12,
  discoveries: 9,
  streak: 7,
  log: [
    { id: "l1", species: REGIONS[2].flora[0], region: REGIONS[2], date: "2026-09-03", time: "08:42", notes: "Found near the creek trail at Bold Park.", confidence: 97, points: 20 },
    { id: "l2", species: REGIONS[2].fauna[0], region: REGIONS[2], date: "2026-09-01", time: "17:15", notes: "Spotted near Rottnest Island ferry terminal.", confidence: 94, points: 50 },
    { id: "l3", species: REGIONS[2].flora[2], region: REGIONS[2], date: "2026-08-28", time: "09:10", notes: "Old grass tree at John Forrest NP. At least 200 years old.", confidence: 91, points: 35 },
  ] as LogEntry[],
};

// ── Components ────────────────────────────────────────────────────────────────

function BottomNav({ screen, setScreen }: { screen: Screen; setScreen: (s: Screen) => void }) {
  const tabs = [
    { id: "map" as Screen, icon: MapIcon, label: "Explore" },
    { id: "camera" as Screen, icon: CameraIcon, label: "Log" },
    { id: "profile" as Screen, icon: ProfileIcon, label: "Journal" },
    { id: "resources" as Screen, icon: LeafIcon, label: "Resources" },
  ];
  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-[#1e3a0f] border-t border-[#2d5016] flex items-center z-10">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setScreen(t.id)}
          className="flex-1 flex flex-col items-center gap-1 py-3 transition-opacity"
          style={{ opacity: screen === t.id ? 1 : 0.45 }}
        >
          <t.icon active={screen === t.id} />
          <span
            className="text-[10px] font-body tracking-wide"
            style={{ color: screen === t.id ? "#8ba86a" : "#5a7a3a" }}
          >
            {t.label}
          </span>
        </button>
      ))}
    </nav>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function MapIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#8ba86a" : "#5a7a3a"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}
function CameraIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#8ba86a" : "#5a7a3a"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#8ba86a" : "#5a7a3a"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <line x1="12" y1="6" x2="16" y2="6" />
      <line x1="12" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="16" y2="14" />
    </svg>
  );
}
function LeafIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#8ba86a" : "#5a7a3a"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8C8 10 5.9 16.17 3.82 19.34a1 1 0 0 0 1.35 1.39C7.27 19.54 13 17 17 8Z" />
      <path d="M17 8L12 21" />
    </svg>
  );
}

// ── Screen: Map ───────────────────────────────────────────────────────────────

function MapScreen({ onSelectRegion }: { onSelectRegion: (r: Region) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);

  const getRegion = (id: string) => REGIONS.find((r) => r.id === id);

  return (
    <div className="flex flex-col h-full bg-[#0e2408]">
      {/* Header */}
      <div className="px-5 pt-10 pb-4">
        <p className="font-mono text-[10px] text-[#5a7a3a] tracking-[0.2em] uppercase mb-1">Western Australia</p>
        <h1 className="font-display text-2xl font-semibold text-[#f5f0e4] leading-tight">
          Explore Regions
        </h1>
        <p className="font-body text-xs text-[#8ba86a] mt-1">Select a region to discover native species</p>
      </div>

      {/* Map */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-2 min-h-0">
        <div className="w-full max-w-[320px] relative">
          <svg viewBox="0 20 280 320" className="w-full drop-shadow-2xl">
            {/* Ocean backdrop */}
            <rect x="-10" y="10" width="310" height="340" rx="8" fill="#0a1f30" opacity="0.5" />
            {WA_REGIONS_SVG.map((region) => {
              const data = getRegion(region.id);
              const isHovered = hovered === region.id;
              return (
                <g key={region.id}>
                  <path
                    d={region.d}
                    fill={data?.color || "#2D5016"}
                    stroke="#0e2408"
                    strokeWidth="2"
                    opacity={isHovered ? 1 : 0.75}
                    style={{ cursor: "pointer", transition: "opacity 0.15s" }}
                    onMouseEnter={() => setHovered(region.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => data && onSelectRegion(data)}
                  />
                  {isHovered && (
                    <path
                      d={region.d}
                      fill="none"
                      stroke={data?.accent || "#C8860A"}
                      strokeWidth="2.5"
                      style={{ pointerEvents: "none" }}
                    />
                  )}
                  <text
                    x={region.cx}
                    y={region.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="8"
                    fontFamily="'Work Sans', sans-serif"
                    fontWeight="500"
                    fill="#f5f0e4"
                    opacity="0.9"
                    style={{ pointerEvents: "none" }}
                  >
                    {region.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Region cards strip */}
      <div className="px-4 pb-2">
        <p className="font-mono text-[9px] text-[#5a7a3a] tracking-widest uppercase mb-2">All Regions</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {REGIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelectRegion(r)}
              className="flex-shrink-0 rounded-lg px-3 py-2 text-left"
              style={{ background: r.color + "33", border: `1px solid ${r.color}55` }}
            >
              <p className="font-body text-xs font-medium text-[#f5f0e4] whitespace-nowrap">{r.name}</p>
              <p className="font-mono text-[9px] text-[#8ba86a]">{r.speciesCount} spp.</p>
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="mx-4 mb-4 mt-1 rounded-xl p-3 flex gap-4 bg-[#1e3a0f] border border-[#2d5016]">
        <div className="flex-1 text-center">
          <p className="font-display text-lg font-semibold text-[#8ba86a]">1,525</p>
          <p className="font-mono text-[9px] text-[#5a7a3a] uppercase tracking-wide">Native Flora</p>
        </div>
        <div className="w-px bg-[#2d5016]" />
        <div className="flex-1 text-center">
          <p className="font-display text-lg font-semibold text-[#8ba86a]">809</p>
          <p className="font-mono text-[9px] text-[#5a7a3a] uppercase tracking-wide">Native Fauna</p>
        </div>
        <div className="w-px bg-[#2d5016]" />
        <div className="flex-1 text-center">
          <p className="font-display text-lg font-semibold text-[#c8860a]">228</p>
          <p className="font-mono text-[9px] text-[#5a7a3a] uppercase tracking-wide">Threatened</p>
        </div>
      </div>
    </div>
  );
}

// ── Screen: Region Detail ─────────────────────────────────────────────────────

function RegionScreen({
  region,
  onBack,
  onLogSpecies,
}: {
  region: Region;
  onBack: () => void;
  onLogSpecies: (s: Species) => void;
}) {
  const [tab, setTab] = useState<"flora" | "fauna">("flora");
  const species = tab === "flora" ? region.flora : region.fauna;

  return (
    <div className="flex flex-col h-full bg-[#0e2408]">
      {/* Hero */}
      <div className="relative h-44 flex-shrink-0">
        <img
          src={`https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=300&fit=crop&auto=format`}
          alt={region.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(14,36,8,0.4) 0%, rgba(14,36,8,0.95) 100%)" }} />
        <button
          onClick={onBack}
          className="absolute top-10 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5f0e4" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="absolute bottom-4 left-5 right-5">
          <p className="font-mono text-[9px] text-[#8ba86a] tracking-[0.2em] uppercase mb-1">{region.tagline}</p>
          <h2 className="font-display text-2xl font-semibold text-[#f5f0e4]">{region.name}</h2>
          <div className="flex gap-4 mt-2">
            <span className="font-mono text-[10px] text-[#8ba86a]">{region.speciesCount} species</span>
            <span className="font-mono text-[10px] text-[#5a7a3a]">·</span>
            <span className="font-mono text-[10px] text-[#8ba86a]">{region.sightings.toLocaleString()} sightings</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 py-3 flex-shrink-0">
        {(["flora", "fauna"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-full text-xs font-body font-medium transition-all"
            style={
              tab === t
                ? { background: region.color, color: "#f5f0e4" }
                : { background: "#1e3a0f", color: "#5a7a3a", border: "1px solid #2d5016" }
            }
          >
            {t === "flora" ? "🌿 Flora" : "🦎 Fauna"}
          </button>
        ))}
      </div>

      {/* Species list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {species.length === 0 && (
          <p className="font-body text-sm text-[#5a7a3a] text-center mt-10">No {tab} records yet for this region.</p>
        )}
        {species.map((sp) => (
          <div
            key={sp.id}
            className="rounded-xl overflow-hidden"
            style={{ background: "#1a3010", border: "1px solid #2d5016" }}
          >
            <div className="flex gap-3 p-3">
              <img
                src={unsplash(sp.imageId, 120, 120)}
                alt={sp.name}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-sm font-semibold text-[#f5f0e4] leading-tight">{sp.name}</p>
                    <p className="font-body text-[10px] italic text-[#8ba86a] mt-0.5">{sp.scientific}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span
                      className="font-mono text-[9px] px-2 py-0.5 rounded-full"
                      style={{ background: rarityColor[sp.rarity] + "33", color: rarityColor[sp.rarity], border: `1px solid ${rarityColor[sp.rarity]}55` }}
                    >
                      {rarityLabel[sp.rarity]}
                    </span>
                    <span className="font-mono text-[10px] text-[#c8860a]">+{sp.points} pts</span>
                  </div>
                </div>
                <p className="font-body text-[11px] text-[#8ba86a] mt-1.5 leading-relaxed line-clamp-2">{sp.description}</p>
              </div>
            </div>
            <div className="px-3 pb-3">
              <button
                onClick={() => onLogSpecies(sp)}
                className="w-full py-2 rounded-lg font-body text-xs font-medium text-[#1e3a0f] transition-opacity hover:opacity-90"
                style={{ background: region.accent || "#8ba86a" }}
              >
                Log Sighting
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Screen: Camera / Log ──────────────────────────────────────────────────────

function CameraScreen({ preselected, region, onSave }: { preselected?: Species; region?: Region; onSave: (entry: LogEntry) => void }) {
  const [step, setStep] = useState<"scan" | "detecting" | "form">(preselected ? "form" : "scan");
  const [detected, setDetected] = useState<Species | null>(preselected || null);
  const [confidence, setConfidence] = useState(preselected ? 94 : 0);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const mockSpecies = REGIONS[2].flora[0];

  const handleCapture = () => {
    setStep("detecting");
    setTimeout(() => {
      const sp = preselected || mockSpecies;
      setDetected(sp);
      setConfidence(Math.floor(Math.random() * 10) + 88);
      setStep("form");
    }, 2200);
  };

  const handleSave = () => {
    if (!detected) return;
    const entry: LogEntry = {
      id: Date.now().toString(),
      species: detected,
      region: region || REGIONS[2],
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().slice(0, 5),
      notes,
      confidence,
      points: detected.points,
    };
    onSave(entry);
    setSaved(true);
  };

  if (saved && detected) {
    return (
      <div className="flex flex-col h-full bg-[#0e2408] items-center justify-center px-6">
        <div className="w-16 h-16 rounded-full bg-[#2d5016] flex items-center justify-center mb-5">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8ba86a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-semibold text-[#f5f0e4] text-center mb-2">Sighting Logged!</h2>
        <p className="font-body text-sm text-[#8ba86a] text-center mb-6">{detected.name} recorded in your field journal.</p>
        <div className="rounded-2xl bg-[#1e3a0f] border border-[#2d5016] p-5 w-full mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="font-mono text-xs text-[#5a7a3a] uppercase tracking-wide">Points Earned</span>
            <span className="font-display text-2xl font-semibold text-[#c8860a]">+{detected.points}</span>
          </div>
          <div className="h-px bg-[#2d5016] mb-3" />
          <div className="flex justify-between text-xs">
            <span className="font-body text-[#8ba86a]">Total Score</span>
            <span className="font-mono text-[#f5f0e4]">{USER.points + detected.points}</span>
          </div>
        </div>
        <button
          onClick={() => { setStep("scan"); setSaved(false); setDetected(null); setNotes(""); }}
          className="w-full py-3 rounded-xl font-body font-medium text-sm text-[#1e3a0f] bg-[#8ba86a]"
        >
          Log Another Sighting
        </button>
      </div>
    );
  }

  if (step === "scan") {
    return (
      <div className="flex flex-col h-full bg-[#0e2408]">
        <div className="px-5 pt-10 pb-4">
          <p className="font-mono text-[10px] text-[#5a7a3a] tracking-[0.2em] uppercase mb-1">Field Camera</p>
          <h2 className="font-display text-2xl font-semibold text-[#f5f0e4]">Log a Sighting</h2>
          <p className="font-body text-xs text-[#8ba86a] mt-1">Point camera at a plant or animal to identify it</p>
        </div>

        {/* Viewfinder mock */}
        <div className="flex-1 mx-4 mb-4 rounded-2xl overflow-hidden relative bg-black flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1490750967868-88df5691cc5e?w=400&h=500&fit=crop&auto=format"
            alt="Camera viewfinder"
            className="w-full h-full object-cover opacity-70"
          />
          {/* Corner brackets */}
          <div className="absolute inset-8 pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#8ba86a] rounded-tl-sm" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#8ba86a] rounded-tr-sm" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#8ba86a] rounded-bl-sm" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#8ba86a] rounded-br-sm" />
          </div>
          <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
              <p className="font-mono text-[10px] text-[#8ba86a]">AI DETECT · READY</p>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 flex gap-3">
          <button
            onClick={handleCapture}
            className="flex-1 py-4 rounded-2xl font-body font-semibold text-sm text-[#1e3a0f] bg-[#8ba86a] flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Capture & Identify
          </button>
        </div>
      </div>
    );
  }

  if (step === "detecting") {
    return (
      <div className="flex flex-col h-full bg-[#0e2408] items-center justify-center px-6">
        <div className="w-20 h-20 relative mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-[#2d5016] border-t-[#8ba86a] animate-spin" />
          <div className="absolute inset-3 rounded-full border border-[#2d5016] border-b-[#5a7a3a] animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.2s" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl">🌿</span>
          </div>
        </div>
        <h3 className="font-display text-xl font-semibold text-[#f5f0e4] mb-2">Identifying Species…</h3>
        <p className="font-body text-sm text-[#8ba86a] text-center">Analysing visual features against WA flora & fauna database</p>
        <div className="mt-6 flex gap-1">
          {["Leaf morphology", "Flower structure", "Bark texture"].map((label, i) => (
            <div
              key={label}
              className="font-mono text-[9px] px-2 py-1 rounded-full bg-[#1e3a0f] text-[#5a7a3a] animate-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Form
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
  const timeStr = today.toTimeString().slice(0, 5);

  return (
    <div className="flex flex-col h-full bg-[#0e2408]">
      <div className="px-5 pt-10 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-[#8ba86a] animate-pulse" />
          <p className="font-mono text-[10px] text-[#5a7a3a] tracking-[0.2em] uppercase">Species Identified</p>
        </div>
        <h2 className="font-display text-xl font-semibold text-[#f5f0e4]">Sighting Record</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {/* Detection result card */}
        {detected && (
          <div className="rounded-2xl overflow-hidden" style={{ background: "#1a3010", border: "1px solid #2d5016" }}>
            <div className="relative h-32">
              <img
                src={unsplash(detected.imageId, 400, 200)}
                alt={detected.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(26,48,16,1) 0%, transparent 60%)" }} />
              <div className="absolute top-2 right-2 bg-[#1e3a0f]/80 backdrop-blur-sm rounded-lg px-2 py-1">
                <p className="font-mono text-[9px] text-[#8ba86a]">AI Confidence</p>
                <p className="font-display text-lg font-semibold text-[#8ba86a]">{confidence}%</p>
              </div>
              <div className="absolute bottom-2 left-3">
                <p className="font-display text-base font-semibold text-[#f5f0e4]">{detected.name}</p>
                <p className="font-body text-[10px] italic text-[#8ba86a]">{detected.scientific}</p>
              </div>
            </div>
            <div className="p-3 flex gap-3">
              <div className="flex-1 rounded-lg bg-[#0e2408] p-2 text-center">
                <p className="font-mono text-[9px] text-[#5a7a3a] uppercase">Rarity</p>
                <p className="font-body text-xs font-medium mt-0.5" style={{ color: rarityColor[detected.rarity] }}>{rarityLabel[detected.rarity]}</p>
              </div>
              <div className="flex-1 rounded-lg bg-[#0e2408] p-2 text-center">
                <p className="font-mono text-[9px] text-[#5a7a3a] uppercase">Points</p>
                <p className="font-display text-base font-semibold text-[#c8860a]">+{detected.points}</p>
              </div>
              <div className="flex-1 rounded-lg bg-[#0e2408] p-2 text-center">
                <p className="font-mono text-[9px] text-[#5a7a3a] uppercase">Type</p>
                <p className="font-body text-xs font-medium text-[#f5f0e4] capitalize mt-0.5">{detected.type}</p>
              </div>
            </div>
          </div>
        )}

        {/* Auto-filled form */}
        <div className="rounded-2xl p-4 space-y-3" style={{ background: "#1a3010", border: "1px solid #2d5016" }}>
          <p className="font-mono text-[9px] text-[#5a7a3a] uppercase tracking-widest mb-1">Field Record Template</p>
          {[
            { label: "Species", value: detected?.name || "Unknown" },
            { label: "Scientific Name", value: detected?.scientific || "—", italic: true },
            { label: "Date", value: dateStr },
            { label: "Time", value: timeStr },
            { label: "Region", value: region?.name || "Southwest WA" },
            { label: "Recorder", value: USER.name },
          ].map(({ label, value, italic }) => (
            <div key={label} className="flex justify-between items-start gap-2 border-b border-[#2d5016] pb-2 last:border-0 last:pb-0">
              <span className="font-mono text-[10px] text-[#5a7a3a] uppercase tracking-wide flex-shrink-0">{label}</span>
              <span className={`font-body text-xs text-[#f5f0e4] text-right ${italic ? "italic" : ""}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="rounded-2xl p-4" style={{ background: "#1a3010", border: "1px solid #2d5016" }}>
          <label className="font-mono text-[9px] text-[#5a7a3a] uppercase tracking-widest block mb-2">Field Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Habitat, behaviour, notable features…"
            className="w-full bg-transparent font-body text-xs text-[#f5f0e4] placeholder-[#3d5a2a] resize-none outline-none leading-relaxed"
            rows={3}
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-xl font-body font-semibold text-sm text-[#1e3a0f] bg-[#8ba86a]"
        >
          Save Sighting · +{detected?.points || 0} pts
        </button>

        <button
          onClick={() => { setStep("scan"); setDetected(null); }}
          className="w-full py-2 rounded-xl font-body text-xs text-[#5a7a3a] bg-[#1e3a0f] border border-[#2d5016]"
        >
          Retake Photo
        </button>
      </div>
    </div>
  );
}

// ── Screen: Profile / Journal ─────────────────────────────────────────────────

function ProfileScreen({ log }: { log: LogEntry[] }) {
  const allLog = [...USER.log, ...log].sort((a, b) => b.date.localeCompare(a.date));
  const totalPoints = USER.points + log.reduce((s, e) => s + e.points, 0);
  const totalDisc = USER.discoveries + log.length;

  return (
    <div className="flex flex-col h-full bg-[#0e2408]">
      <div className="px-5 pt-10 pb-4 flex-shrink-0">
        <p className="font-mono text-[10px] text-[#5a7a3a] tracking-[0.2em] uppercase mb-1">Naturalist Journal</p>
        <h2 className="font-display text-2xl font-semibold text-[#f5f0e4]">{USER.name}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Total Points", value: totalPoints.toLocaleString(), color: "#c8860a" },
            { label: "Discoveries", value: totalDisc, color: "#8ba86a" },
            { label: "Day Streak", value: `${USER.streak}🔥`, color: "#f5f0e4" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl p-3 text-center bg-[#1e3a0f] border border-[#2d5016]">
              <p className="font-display text-xl font-semibold" style={{ color }}>{value}</p>
              <p className="font-mono text-[9px] text-[#5a7a3a] uppercase tracking-wide mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Rank */}
        <div className="rounded-xl p-3 bg-[#1e3a0f] border border-[#2d5016] flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#c8860a]/20 border border-[#c8860a]/40 flex items-center justify-center">
            <span className="font-display text-base font-semibold text-[#c8860a]">#{USER.rank}</span>
          </div>
          <div>
            <p className="font-body text-sm font-medium text-[#f5f0e4]">WA Leaderboard Rank</p>
            <p className="font-mono text-[10px] text-[#5a7a3a]">Top 5% of naturalists this month</p>
          </div>
        </div>

        {/* Sightings log */}
        <div>
          <p className="font-mono text-[9px] text-[#5a7a3a] uppercase tracking-widest mb-2">Field Log</p>
          <div className="space-y-2">
            {allLog.map((entry) => (
              <div key={entry.id} className="rounded-xl overflow-hidden bg-[#1a3010] border border-[#2d5016]">
                <div className="flex gap-3 p-3">
                  <img
                    src={unsplash(entry.species.imageId, 80, 80)}
                    alt={entry.species.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-display text-sm font-semibold text-[#f5f0e4] leading-tight">{entry.species.name}</p>
                      <span className="font-mono text-[10px] text-[#c8860a] flex-shrink-0 ml-2">+{entry.points}</span>
                    </div>
                    <p className="font-body text-[10px] italic text-[#8ba86a]">{entry.species.scientific}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="font-mono text-[9px] text-[#5a7a3a]">{entry.region.name}</span>
                      <span className="font-mono text-[9px] text-[#3d5a2a]">·</span>
                      <span className="font-mono text-[9px] text-[#5a7a3a]">{entry.date}</span>
                    </div>
                    {entry.notes && (
                      <p className="font-body text-[10px] text-[#6a8a50] mt-1 italic line-clamp-1">"{entry.notes}"</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div>
          <p className="font-mono text-[9px] text-[#5a7a3a] uppercase tracking-widest mb-2">Achievements</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: "🌿", label: "First Flora", unlocked: true },
              { icon: "🦎", label: "First Fauna", unlocked: true },
              { icon: "⭐", label: "Rare Find", unlocked: true },
              { icon: "🗺", label: "Explorer", unlocked: true },
              { icon: "🔥", label: "Week Streak", unlocked: true },
              { icon: "🏆", label: "Top Ranger", unlocked: false },
            ].map((b) => (
              <div
                key={b.label}
                className="rounded-xl p-3 text-center"
                style={{
                  background: b.unlocked ? "#1e3a0f" : "#111d0a",
                  border: `1px solid ${b.unlocked ? "#2d5016" : "#1a2a10"}`,
                  opacity: b.unlocked ? 1 : 0.4,
                }}
              >
                <div className="text-2xl mb-1">{b.icon}</div>
                <p className="font-mono text-[9px] text-[#8ba86a] leading-tight">{b.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Screen: Resources ─────────────────────────────────────────────────────────

function ResourcesScreen() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full bg-[#0e2408]">
      <div className="px-5 pt-10 pb-4 flex-shrink-0">
        <p className="font-mono text-[10px] text-[#5a7a3a] tracking-[0.2em] uppercase mb-1">Conservation</p>
        <h2 className="font-display text-2xl font-semibold text-[#f5f0e4]">WA Biodiversity</h2>
        <p className="font-body text-xs text-[#8ba86a] mt-1">Programs, research & policies protecting our native species</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {/* Hero stat */}
        <div className="rounded-2xl p-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1e3a0f 0%, #0e2408 100%)", border: "1px solid #2d5016" }}>
          <div className="absolute right-4 top-4 text-5xl opacity-10">🌏</div>
          <p className="font-mono text-[9px] text-[#5a7a3a] uppercase tracking-widest mb-2">Did you know?</p>
          <p className="font-display text-base font-semibold text-[#f5f0e4] leading-snug">WA is home to <span className="text-[#c8860a]">over 13,000</span> native plant species — more than all of Europe combined.</p>
          <p className="font-body text-xs text-[#8ba86a] mt-2">The Southwest Botanical Province is one of only 36 recognised biodiversity hotspots on Earth.</p>
        </div>

        {/* Resource cards */}
        {RESOURCES.map((r) => {
          const isOpen = expanded === r.id;
          return (
            <div
              key={r.id}
              className="rounded-2xl overflow-hidden"
              style={{ background: "#1a3010", border: "1px solid #2d5016" }}
            >
              <button
                className="w-full p-4 text-left flex items-start gap-3"
                onClick={() => setExpanded(isOpen ? null : r.id)}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: r.color + "40" }}
                >
                  {r.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-display text-sm font-semibold text-[#f5f0e4] leading-tight">{r.title}</p>
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="#5a7a3a" strokeWidth="2" strokeLinecap="round"
                      className={`flex-shrink-0 mt-0.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span
                      className="font-mono text-[9px] px-2 py-0.5 rounded-full"
                      style={{ background: r.color + "30", color: r.color === "#2F6B8A" ? "#4A9BBF" : "#8ba86a" }}
                    >
                      {r.type}
                    </span>
                    <span className="font-mono text-[9px] text-[#5a7a3a]">{r.org}</span>
                  </div>
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-4">
                  <div className="h-px bg-[#2d5016] mb-3" />
                  <p className="font-body text-xs text-[#8ba86a] leading-relaxed">{r.summary}</p>
                  <button className="mt-3 font-mono text-[10px] text-[#8ba86a] underline underline-offset-2">
                    Learn more →
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Call to action */}
        <div className="rounded-2xl p-4 text-center" style={{ background: "#1e3a0f", border: "1px solid #2d5016" }}>
          <p className="font-display text-base font-semibold text-[#f5f0e4] mb-1">Your sightings matter</p>
          <p className="font-body text-xs text-[#8ba86a]">Every logged observation is contributed to WA's biodiversity database, helping researchers track species distribution and health over time.</p>
        </div>
      </div>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("map");
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [cameraSpecies, setCameraSpecies] = useState<Species | undefined>(undefined);
  const [cameraRegion, setCameraRegion] = useState<Region | undefined>(undefined);
  const [userLog, setUserLog] = useState<LogEntry[]>([]);

  const handleSelectRegion = (r: Region) => {
    setSelectedRegion(r);
    setScreen("region");
  };

  const handleLogSpecies = (sp: Species) => {
    setCameraSpecies(sp);
    setCameraRegion(selectedRegion || undefined);
    setScreen("camera");
  };

  const handleSaveEntry = (entry: LogEntry) => {
    setUserLog((prev) => [entry, ...prev]);
  };

  const handleNav = (s: Screen) => {
    if (s !== "camera") {
      setCameraSpecies(undefined);
      setCameraRegion(undefined);
    }
    if (s === "map" && screen === "region") {
      setSelectedRegion(null);
    }
    setScreen(s);
  };

  const showBack = screen === "region";

  return (
    <div className="flex items-center justify-center w-full h-full bg-[#0a0a0a]">
      {/* Phone shell */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: "min(390px, 100vw)",
          height: "min(844px, 100vh)",
          background: "#0e2408",
          borderRadius: "min(44px, 0px)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.8)",
        }}
      >
        {/* Status bar */}
        <div className="absolute top-0 left-0 right-0 h-9 flex items-center justify-between px-6 z-20">
          <span className="font-mono text-[11px] text-[#f5f0e4] font-medium">9:41</span>
          <div className="flex items-center gap-1.5">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="#f5f0e4"><rect x="0" y="4" width="3" height="8" rx="0.5" /><rect x="4.5" y="2.5" width="3" height="9.5" rx="0.5" /><rect x="9" y="0.5" width="3" height="11.5" rx="0.5" /><rect x="13.5" y="0" width="2.5" height="12" rx="0.5" opacity="0.3" /></svg>
            <svg width="16" height="12" viewBox="0 0 24 12" fill="none" stroke="#f5f0e4" strokeWidth="1.5"><rect x="0.75" y="0.75" width="19.5" height="10.5" rx="2" /><path d="M21.75 4v4a2 2 0 0 0 0-4z" fill="#f5f0e4" strokeWidth="0" /><rect x="2" y="2" width="14" height="8" rx="1" fill="#f5f0e4" /></svg>
          </div>
        </div>

        {/* Main content */}
        <div className="absolute inset-0 top-0 bottom-[68px]">
          {screen === "map" && <MapScreen onSelectRegion={handleSelectRegion} />}
          {screen === "region" && selectedRegion && (
            <RegionScreen
              region={selectedRegion}
              onBack={() => setScreen("map")}
              onLogSpecies={handleLogSpecies}
            />
          )}
          {screen === "camera" && (
            <CameraScreen
              preselected={cameraSpecies}
              region={cameraRegion}
              onSave={handleSaveEntry}
            />
          )}
          {screen === "profile" && <ProfileScreen log={userLog} />}
          {screen === "resources" && <ResourcesScreen />}
        </div>

        {/* Bottom nav */}
        <div className="absolute bottom-0 left-0 right-0">
          <BottomNav
            screen={["map", "region"].includes(screen) ? "map" : screen as Screen}
            setScreen={handleNav}
          />
        </div>
      </div>
    </div>
  );
}
