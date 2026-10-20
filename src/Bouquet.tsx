import React from "react";
import { AbsoluteFill, Composition, useCurrentFrame, interpolate, Easing } from "remotion";

const W = 1080;
const H = 1080;
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// Refined botanical color palettes
const PALETTES = {
  rosePeony: {
    dark: "#8C1B35",
    base: "#C92C4E",
    mid: "#E84E72",
    light: "#F784A2",
    pale: "#FCD5DF",
    highlight: "#FFF0F4",
    stamen: "#D97706",
    pollen: "#FEF08A",
    calyxBase: "#2C4A27",
    calyxMid: "#48733E",
    calyxLight: "#6BA05E",
  },
  peachRanunc: {
    dark: "#A63517",
    base: "#D84A25",
    mid: "#F16D47",
    light: "#FFA085",
    pale: "#FED6C7",
    highlight: "#FFF4EF",
    stamen: "#D97706",
    pollen: "#FEF9C3",
    calyxBase: "#2C4A27",
    calyxMid: "#48733E",
    calyxLight: "#6BA05E",
  },
  goldenButtercup: {
    dark: "#8F5104",
    base: "#D97706",
    mid: "#F59E0B",
    light: "#FBBF24",
    pale: "#FDE68A",
    highlight: "#FEF9C3",
    stamen: "#78350F",
    pollen: "#FEF9C3",
    calyxBase: "#2C4A27",
    calyxMid: "#48733E",
    calyxLight: "#6BA05E",
  },
  whiteGardenia: {
    dark: "#4E6655",
    base: "#75937E",
    mid: "#B0C4B4",
    light: "#E4EDE6",
    pale: "#F3F8F4",
    highlight: "#FFFFFF",
    stamen: "#B88A1F",
    pollen: "#FFF3B8",
    calyxBase: "#2C4A27",
    calyxMid: "#48733E",
    calyxLight: "#6BA05E",
  },
  coralBlush: {
    dark: "#992548",
    base: "#CE3B64",
    mid: "#EC5C85",
    light: "#F894AF",
    pale: "#FCD7E2",
    highlight: "#FFF2F6",
    stamen: "#CA8A04",
    pollen: "#FEF9C3",
    calyxBase: "#2C4A27",
    calyxMid: "#48733E",
    calyxLight: "#6BA05E",
  },
};

// =========================================================================
// BUD STEMS: every stem runs down into the wrapper's top opening.
// rimY traces the front rim of the kraft wrap (left corner 265,410 ->
// fold 472,432 -> right corner 775,385); stems end just below it so
// they enter the wrap from above and never stop short or pass outside it.
// =========================================================================
const rimY = (x: number) => (x < 472 ? 410 + ((x - 265) * 22) / 207 : 432 - ((x - 472) * 47) / 303);

const stemTarget = (bx: number, by: number) => {
  const tx = 520 + (bx - 520) * 0.3;
  return { tx, ty: Math.max(rimY(tx) + 30, by + 20) };
};

// Curved stem from a bud base, leaving along the bud's axis, ending inside the wrap
const stemPath = (bx: number, by: number, angleDeg: number) => {
  const { tx, ty } = stemTarget(bx, by);
  const a = (angleDeg * Math.PI) / 180;
  const d = Math.hypot(tx - bx, ty - by);
  const cx = bx - Math.sin(a) * d * 0.4;
  const cy = by + Math.cos(a) * d * 0.4;
  return `M ${bx},${by} Q ${cx},${cy} ${tx},${ty}`;
};

// =========================================================================
// BUD SHAPE: upright closed bud drawn with its base at the origin.
// Petal tips face up, dark green sepals cup the base.
// =========================================================================
const BudShape: React.FC<{
  h: number;
  w: number;
  palette: typeof PALETTES.rosePeony;
}> = ({ h, w, palette }) => (
  <g>
    {/* Rounded bud body */}
    <path
      d={`M 0,-${h} C ${w * 0.55},-${h} ${w * 0.6},-${h * 0.25} ${w * 0.18},-${h * 0.06} Q 0,0 -${w * 0.18},-${h * 0.06} C -${w * 0.6},-${h * 0.25} -${w * 0.55},-${h} 0,-${h} Z`}
      fill={palette.mid}
      stroke={palette.dark}
      strokeWidth="1.2"
    />
    {/* Back petal (shaded left side) */}
    <path
      d={`M 0,-${h} C -${w * 0.5},-${h} -${w * 0.56},-${h * 0.3} -${w * 0.14},-${h * 0.08} C -${w * 0.05},-${h * 0.45} -${w * 0.02},-${h * 0.8} 0,-${h} Z`}
      fill={palette.base}
    />
    {/* Front wrapping petal */}
    <path
      d={`M ${w * 0.12},-${h * 0.98} C ${w * 0.5},-${h * 0.9} ${w * 0.55},-${h * 0.3} ${w * 0.15},-${h * 0.07} C -${w * 0.1},-${h * 0.3} -${w * 0.05},-${h * 0.75} ${w * 0.12},-${h * 0.98} Z`}
      fill={palette.light}
      stroke={palette.base}
      strokeWidth="0.8"
    />
    {/* Petal-tip seam at the top */}
    <path
      d={`M -${w * 0.22},-${h * 0.86} Q 0,-${h * 0.78} ${w * 0.12},-${h * 0.98}`}
      stroke={palette.dark}
      strokeWidth="1"
      fill="none"
      opacity={0.6}
    />
    {/* Highlight */}
    <path
      d={`M ${w * 0.22},-${h * 0.85} Q ${w * 0.38},-${h * 0.6} ${w * 0.26},-${h * 0.35}`}
      stroke={palette.highlight}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
      opacity={0.8}
    />

    {/* Sepals cupping the base, pointing up */}
    <path
      d={`M 0,0 C -${w * 0.25},-${h * 0.04} -${w * 0.42},-${h * 0.16} -${w * 0.42},-${h * 0.34} C -${w * 0.25},-${h * 0.22} -${w * 0.1},-${h * 0.1} 0,0 Z`}
      fill={palette.calyxMid}
      stroke="#263E20"
      strokeWidth="1"
    />
    <path
      d={`M 0,0 C ${w * 0.25},-${h * 0.04} ${w * 0.42},-${h * 0.16} ${w * 0.42},-${h * 0.34} C ${w * 0.25},-${h * 0.22} ${w * 0.1},-${h * 0.1} 0,0 Z`}
      fill={palette.calyxMid}
      stroke="#263E20"
      strokeWidth="1"
    />
    <path
      d={`M 0,0 C -${w * 0.14},-${h * 0.12} -${w * 0.1},-${h * 0.3} 0,-${h * 0.4} C ${w * 0.1},-${h * 0.3} ${w * 0.14},-${h * 0.12} 0,0 Z`}
      fill={palette.calyxBase}
      stroke="#263E20"
      strokeWidth="1"
    />
    <ellipse cx={0} cy={h * 0.02} rx={w * 0.13} ry={h * 0.05} fill={palette.calyxBase} />
  </g>
);

// =========================================================================
// BOTANICAL FLOWER COMPONENT:
// Luscious, velvety round rose/peony bud -> fully blooming flower
// Smooth rounded calyx cup (no ribs or claws!)
// =========================================================================
const BotanicalFlower: React.FC<{
  x: number;
  y: number;
  r: number;
  type: "peony" | "ranunc" | "buttercup" | "gardenia" | "coral";
  palette: typeof PALETTES.rosePeony;
  bloomProgress: number;
  rotation: number;
  frame: number;
  // "stem" draws the bud stage and its stem (behind the wrap); "bloom" draws the opening flower (in front)
  layer: "stem" | "bloom";
}> = ({ x, y, r, type, palette, bloomProgress, rotation, frame, layer }) => {
  // Swell phase before opening
  const budSwell = interpolate(bloomProgress, [0, 0.35], [1, 1.25], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });

  // Sepal opening / curling back
  const sepalPeel = interpolate(bloomProgress, [0.12, 0.55], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

  // Petal expansion stages
  const outerTier = interpolate(bloomProgress, [0.18, 0.72], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const midTier = interpolate(bloomProgress, [0.32, 0.86], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const innerTier = interpolate(bloomProgress, [0.46, 0.96], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const centerStamen = interpolate(bloomProgress, [0.65, 1.0], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.back(1.4)),
  });

  // Bud fade-out as bloom expands
  const budOpacity = interpolate(bloomProgress, [0.22, 0.52], [1, 0], clamp);

  // Gentle natural breathing
  const breathe = Math.sin(frame * 0.05 + rotation) * 0.02 * bloomProgress;
  const sway = Math.cos(frame * 0.04 + rotation) * 1.5;

  const bh = r * 0.72 * budSwell;
  const budH = bh * 1.55;
  const theta = ((rotation + sway) * Math.PI) / 180;
  const budBaseX = x - Math.sin(theta) * budH * 0.5;
  const budBaseY = y + Math.cos(theta) * budH * 0.5;

  const flowerTransform = `translate(${x} ${y}) rotate(${rotation + sway}) scale(${1 + breathe})`;

  if (layer === "stem") {
    if (bloomProgress >= 0.65) return null;
    return (
      <g opacity={budOpacity}>
        <path d={stemPath(budBaseX, budBaseY, rotation + sway)} stroke={palette.calyxMid} strokeWidth="4" fill="none" />
        {/* CLOSED BUD (INITIAL STATE) - same upright bud as ClosedBud, tucked inside the wrap */}
        <g transform={flowerTransform}>
          <g transform={`translate(0 ${budH * 0.5})`}>
            <BudShape h={budH} w={budH * 0.66} palette={palette} />
          </g>
        </g>
      </g>
    );
  }

  return (
    <g transform={flowerTransform}>

      {/* ========================================================
          OPENING SEPALS (CURLING BACK AS PETALS UNFURL)
          ======================================================== */}
      {sepalPeel > 0.05 && (
        <g opacity={Math.min(1, sepalPeel * 2)}>
          {[-45, 0, 45].map((deg, i) => {
            const rot = deg * (1 + sepalPeel * 0.5);
            const drop = interpolate(sepalPeel, [0, 1], [bh * 0.3, r * 0.42]);
            const sScale = interpolate(sepalPeel, [0, 1], [0.75, 0.48]);
            return (
              <g key={`sep-${i}`} transform={`translate(0 ${drop}) rotate(${rot}) scale(${sScale})`}>
                <path
                  d="M 0,0 C -10,-12 -14,-32 0,-45 C 14,-32 10,-12 0,0 Z"
                  fill={palette.calyxBase}
                  stroke="#263E20"
                  strokeWidth="1.2"
                />
              </g>
            );
          })}
        </g>
      )}

      {/* ========================================================
          BLOOMING STAGE: MULTI-TIER PETAL ARRANGEMENT
          ======================================================== */}
      {/* TIER 1: OUTER WIDE PETALS */}
      {outerTier > 0.02 && (
        <g opacity={Math.min(1, outerTier * 2.5)}>
          {Array.from({ length: type === "gardenia" ? 6 : 8 }).map((_, i) => {
            const count = type === "gardenia" ? 6 : 8;
            const angle = (i * 360) / count + (type === "peony" ? 14 : 0);
            const pScale = interpolate(outerTier, [0, 1], [0.18, 1]);
            const pDist = interpolate(outerTier, [0, 1], [r * 0.1, r * 0.56]);

            return (
              <g key={`t1-${i}`} transform={`rotate(${angle}) translate(0 -${pDist}) scale(${pScale})`}>
                <path
                  d={`M 0,-${r * 0.54} C -${r * 0.38},-${r * 0.48} -${r * 0.44},-${r * 0.18} -${r * 0.24},${r * 0.08} C -${r * 0.12},${r * 0.24} ${r * 0.12},${r * 0.24} ${r * 0.24},${r * 0.08} C ${r * 0.44},-${r * 0.18} ${r * 0.38},-${r * 0.48} 0,-${r * 0.54} Z`}
                  fill={i % 2 === 0 ? palette.mid : palette.light}
                  stroke={palette.dark}
                  strokeWidth="1.2"
                />
                <path
                  d={`M 0,-${r * 0.46} Q -2,-${r * 0.12} 0,${r * 0.06}`}
                  stroke={palette.highlight}
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  opacity={0.7}
                />
              </g>
            );
          })}
        </g>
      )}

      {/* TIER 2: MID-LAYER PETALS */}
      {midTier > 0.05 && (
        <g opacity={Math.min(1, midTier * 2.2)}>
          {Array.from({ length: 7 }).map((_, i) => {
            const angle = (i * 360) / 7 + 25;
            const pScale = interpolate(midTier, [0, 1], [0.12, 0.88]);
            const pDist = interpolate(midTier, [0, 1], [r * 0.06, r * 0.38]);

            return (
              <g key={`t2-${i}`} transform={`rotate(${angle}) translate(0 -${pDist}) scale(${pScale})`}>
                <path
                  d={`M 0,-${r * 0.46} C -${r * 0.30},-${r * 0.40} -${r * 0.34},-${r * 0.14} -${r * 0.18},${r * 0.06} C -${r * 0.08},${r * 0.18} ${r * 0.08},${r * 0.18} ${r * 0.18},${r * 0.06} C ${r * 0.34},-${r * 0.14} ${r * 0.30},-${r * 0.40} 0,-${r * 0.46} Z`}
                  fill={palette.light}
                  stroke={palette.base}
                  strokeWidth="1"
                />
                <path
                  d={`M 0,-${r * 0.38} Q 2,-${r * 0.1} 0,${r * 0.04}`}
                  stroke={palette.highlight}
                  strokeWidth="1.5"
                  fill="none"
                  opacity={0.8}
                />
              </g>
            );
          })}
        </g>
      )}

      {/* TIER 3: INNER PETALS */}
      {innerTier > 0.05 && (
        <g opacity={Math.min(1, innerTier * 2.5)}>
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * 360) / 6 + 10;
            const pScale = interpolate(innerTier, [0, 1], [0.1, 0.74]);
            const pDist = interpolate(innerTier, [0, 1], [r * 0.04, r * 0.22]);

            return (
              <g key={`t3-${i}`} transform={`rotate(${angle}) translate(0 -${pDist}) scale(${pScale})`}>
                <path
                  d={`M 0,-${r * 0.36} C -${r * 0.22},-${r * 0.30} -${r * 0.24},-${r * 0.10} -${r * 0.14},${r * 0.04} C -${r * 0.06},${r * 0.14} ${r * 0.06},${r * 0.14} ${r * 0.14},${r * 0.04} C ${r * 0.24},-${r * 0.10} ${r * 0.22},-${r * 0.30} 0,-${r * 0.36} Z`}
                  fill={palette.pale}
                  stroke={palette.mid}
                  strokeWidth="0.8"
                />
              </g>
            );
          })}
        </g>
      )}

      {/* TIER 4: GOLDEN CENTER STAMEN & ANTHERS */}
      {centerStamen > 0.05 && (
        <g transform={`scale(${centerStamen})`}>
          <circle r={r * 0.16} fill={palette.stamen} />
          <circle r={r * 0.09} fill={palette.pollen} />
          {Array.from({ length: 14 }).map((_, i) => {
            const angle = (i * 360) / 14;
            const len = r * (0.15 + (i % 2) * 0.04);
            return (
              <g key={`st-${i}`} transform={`rotate(${angle})`}>
                <line x1="0" y1="0" x2="0" y2={-len} stroke={palette.stamen} strokeWidth="1.2" />
                <circle cx="0" cy={-len} r="2.2" fill={palette.pollen} />
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};

// Lush, naturally staggered bouquet flower arrangement
const FLORAL_ARRANGEMENT = [
  // Top tier
  { type: "peony" as const, x: 520, y: 190, r: 96, palette: PALETTES.rosePeony, startFrame: 20, rot: 0 },
  { type: "ranunc" as const, x: 410, y: 230, r: 86, palette: PALETTES.peachRanunc, startFrame: 30, rot: -10 },
  { type: "buttercup" as const, x: 630, y: 235, r: 86, palette: PALETTES.goldenButtercup, startFrame: 36, rot: 12 },

  // Mid tier (staggered nicely)
  { type: "coral" as const, x: 470, y: 298, r: 90, palette: PALETTES.coralBlush, startFrame: 44, rot: -4 },
  { type: "peony" as const, x: 575, y: 302, r: 90, palette: PALETTES.rosePeony, startFrame: 50, rot: 6 },
  { type: "buttercup" as const, x: 340, y: 295, r: 84, palette: PALETTES.goldenButtercup, startFrame: 56, rot: -16 },
  { type: "ranunc" as const, x: 700, y: 300, r: 84, palette: PALETTES.peachRanunc, startFrame: 62, rot: 16 },

  // Lower collar tier (nestled right at the wrapper rim)
  { type: "coral" as const, x: 400, y: 370, r: 84, palette: PALETTES.coralBlush, startFrame: 68, rot: -8 },
  { type: "gardenia" as const, x: 520, y: 388, r: 84, palette: PALETTES.whiteGardenia, startFrame: 74, rot: 0 },
  { type: "peony" as const, x: 630, y: 375, r: 86, palette: PALETTES.rosePeony, startFrame: 80, rot: 8 },

  // Flanking shoulder blooms
  { type: "gardenia" as const, x: 265, y: 330, r: 74, palette: PALETTES.whiteGardenia, startFrame: 86, rot: -25 },
  { type: "buttercup" as const, x: 775, y: 335, r: 74, palette: PALETTES.goldenButtercup, startFrame: 92, rot: 25 },
];

// Rich botanical leaves filling between flowers
const BotanicalLeaf: React.FC<{
  x: number;
  y: number;
  len: number;
  rot: number;
  color?: string;
}> = ({ x, y, len, rot, color = "#50755C" }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path
      d={`M 0,0 C -${len * 0.28},-${len * 0.35} -${len * 0.24},-${len * 0.75} 0,-${len} C ${len * 0.24},-${len * 0.75} ${len * 0.28},-${len * 0.35} 0,0 Z`}
      fill={color}
      stroke="#365440"
      strokeWidth="1.2"
    />
    <path d={`M 0,0 L 0,-${len * 0.85}`} stroke="#6CA37E" strokeWidth="1.4" fill="none" opacity={0.7} />
  </g>
);

// Eucalyptus foliage branch
const EucalyptusBranch: React.FC<{
  x: number;
  y: number;
  len: number;
  rot: number;
  progress: number;
}> = ({ x, y, len, rot, progress }) => {
  const spread = interpolate(progress, [0, 1], [0.9, 1]);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${spread})`}>
      {/* Stem rooted inside the wrapper; bare lower half stays hidden behind blooms */}
      <path d={`M 0,0 Q 8,-${len * 0.5} 0,-${len}`} stroke="#37553E" strokeWidth="3.2" fill="none" />
      {/* Leaf pairs on the outer half, tapering smaller toward the tip */}
      {[0.5, 0.6, 0.69, 0.77, 0.84, 0.9, 0.95].map((pos, i) => {
        const s = 1.25 - 0.65 * pos;
        return (
          <g key={`euc-${i}`} transform={`translate(${Math.sin(i * 1.5) * 3} -${len * pos}) scale(${s})`}>
            <ellipse
              cx={-17}
              cy={0}
              rx="15"
              ry="11"
              fill="#5E8370"
              stroke="#416150"
              strokeWidth="1.2"
              transform="rotate(-22)"
            />
            <ellipse
              cx={17}
              cy={0}
              rx="15"
              ry="11"
              fill="#729885"
              stroke="#416150"
              strokeWidth="1.2"
              transform="rotate(22)"
            />
          </g>
        );
      })}
      {/* Single terminal leaf */}
      <ellipse cx={0} cy={-len - 6} rx="7" ry="10" fill="#729885" stroke="#416150" strokeWidth="1.2" />
    </g>
  );
};

// =========================================================================
// CLOSED BUD: upright unopened bud that stays closed.
// Petal tips face up, dark green sepals cup the base, and the stem
// runs down toward the wrapper (tilted to fan out from its center).
// =========================================================================
const ClosedBud: React.FC<{
  x: number;
  y: number;
  size: number;
  palette: typeof PALETTES.rosePeony;
  startFrame: number;
  frame: number;
}> = ({ x, y, size, palette, startFrame, frame }) => {
  const h = size;
  const w = size * 0.66;
  // Tilt the bud along its stem, which runs into the wrap opening
  const baseY = y + h * 0.5;
  const { tx, ty } = stemTarget(x, baseY);
  const rot = (Math.atan2(x - tx, ty - baseY) * 180) / Math.PI;
  const grow = interpolate(frame, [startFrame, startFrame + 50], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.back(1.3)),
  });
  const sway = Math.sin(frame * 0.045 + x * 0.05) * 2;

  return (
    <>
      <path
        d={stemPath(x, baseY, rot)}
        stroke={palette.calyxMid}
        strokeWidth="4"
        fill="none"
        opacity={Math.min(1, Math.max(0, grow))}
      />
      <g transform={`translate(${x} ${baseY}) rotate(${rot + sway}) scale(${grow})`}>
        <BudShape h={h} w={w} palette={palette} />
      </g>
    </>
  );
};

// Closed buds on long stems rising out around the top and shoulders of the blooms
const CLOSED_BUDS = [
  { x: 450, y: 55, size: 70, palette: PALETTES.peachRanunc, startFrame: 10 },
  { x: 595, y: 52, size: 68, palette: PALETTES.goldenButtercup, startFrame: 16 },
  { x: 320, y: 104, size: 66, palette: PALETTES.whiteGardenia, startFrame: 22 },
  { x: 720, y: 104, size: 68, palette: PALETTES.rosePeony, startFrame: 28 },
  { x: 222, y: 171, size: 62, palette: PALETTES.coralBlush, startFrame: 34 },
  { x: 827, y: 179, size: 62, palette: PALETTES.whiteGardenia, startFrame: 40 },
  { x: 135, y: 252, size: 58, palette: PALETTES.goldenButtercup, startFrame: 46 },
  { x: 911, y: 257, size: 58, palette: PALETTES.peachRanunc, startFrame: 52 },
];

// Web page props (the video uses neither): onTagClick opens the letter,
// embedded drops the square background so the page's own background shows through
export const MainBouquetVideo: React.FC<{ onTagClick?: () => void; embedded?: boolean }> = ({
  onTagClick,
  embedded,
}) => {
  const frame = useCurrentFrame();

  // Bloom progression
  const masterProgress = interpolate(frame, [15, 230], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });

  // Living bouquet sway
  const bouquetSway = Math.sin(frame * 0.035) * 2.2;
  const tagSwing = Math.sin(frame * 0.05) * 4.5;
  const ribbonFlutter = Math.sin(frame * 0.06) * 3.5;

  // Flowers in depth order; drawn as two layers so stems stay behind the wrap
  const renderFlowers = (layer: "stem" | "bloom") =>
    FLORAL_ARRANGEMENT.map((item, i) => {
      const flowerProgress = interpolate(
        frame,
        [item.startFrame, item.startFrame + 115],
        [0, 1],
        { ...clamp, easing: Easing.inOut(Easing.cubic) }
      );

      return (
        <BotanicalFlower
          key={`flower-${layer}-${i}`}
          x={item.x}
          y={item.y}
          r={item.r}
          type={item.type}
          palette={item.palette}
          bloomProgress={flowerProgress}
          rotation={item.rot}
          frame={frame}
          layer={layer}
        />
      );
    });

  return (
    <AbsoluteFill
      style={{
        background: embedded ? "transparent" : "radial-gradient(circle at 50% 46%, #FFFDF9 0%, #FAF6EE 55%, #ECE4D3 100%)",
        overflow: "hidden"
      }}
    >
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
        <defs>
          <filter id="shadowBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <radialGradient id="bloomAmbientGlow" cx="50%" cy="36%" r="48%">
            <stop offset="0%" stopColor="#FFFDF7" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#FFF9E8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#F5ECE0" stopOpacity="0" />
          </radialGradient>

          {/* Warm kraft paper gradients matching user's reference image */}
          <linearGradient id="kraftLeftSheet" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E5CDAF" />
            <stop offset="50%" stopColor="#F0DEBF" />
            <stop offset="100%" stopColor="#E2C4A4" />
          </linearGradient>
          <linearGradient id="kraftRightSheet" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FCEDD7" />
            <stop offset="45%" stopColor="#F7E2C7" />
            <stop offset="100%" stopColor="#ECD0B2" />
          </linearGradient>
          <linearGradient id="kraftInnerFunnel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D5B48F" />
            <stop offset="100%" stopColor="#BE9C76" />
          </linearGradient>
          <linearGradient id="kraftSkirtGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E2C7A8" />
            <stop offset="100%" stopColor="#D1B391" />
          </linearGradient>
        </defs>

        {/* Ambient glow */}
        <circle cx={540} cy={410} r={460} fill="url(#bloomAmbientGlow)" />

        {/* Soft ground shadow below bouquet */}
        <ellipse cx={540} cy={1005} rx={145} ry={16} fill="#7A6856" opacity={0.20} filter="url(#shadowBlur)" />

        {/* Floating pollen particles */}
        {Array.from({ length: 28 }).map((_, i) => {
          const speed = 0.9 + (i % 4) * 0.35;
          const px = (i * 41 + Math.sin(frame * 0.04 + i) * 35) % W;
          const py = ((H - (frame * speed + i * 42)) % (H + 80)) - 40;
          const r = 1.4 + (i % 3) * 0.8;
          const particleOpacity = interpolate(masterProgress, [0.35, 0.9], [0, 0.45 + (i % 3) * 0.15], clamp);
          return <circle key={`pollen-${i}`} cx={px} cy={py} r={r} fill="#F7CA79" opacity={particleOpacity} />;
        })}

        {/* ========================================================
            MAIN BOUQUET GROUP
            ======================================================== */}
        {/* Shifted (20, 50) so the bouquet sits in the center of the frame */}
        <g transform={`translate(${20 + bouquetSway} 50)`}>
          {/* Back of kraft wrap opening */}
          <path
            d="M 265,410 Q 520,470 775,385 L 565,720 Q 520,725 480,720 Z"
            fill="url(#kraftInnerFunnel)"
            stroke="#BD9E81"
            strokeWidth="1.5"
          />

          {/* Backdrop Eucalyptus foliage */}
          {/* Stems rooted low inside the wrapper, fanning up and out */}
          <EucalyptusBranch x={450} y={470} len={434} rot={-51.5} progress={masterProgress} />
          <EucalyptusBranch x={590} y={470} len={434} rot={51.5} progress={masterProgress} />
          <EucalyptusBranch x={485} y={470} len={478} rot={-21.5} progress={masterProgress} />
          <EucalyptusBranch x={555} y={470} len={474} rot={21.7} progress={masterProgress} />
          <EucalyptusBranch x={520} y={470} len={455} rot={0} progress={masterProgress} />

          {/* Lush filler foliage nestled among flowers */}
          <BotanicalLeaf x={350} y={245} len={65} rot={-45} color="#456B4E" />
          <BotanicalLeaf x={690} y={250} len={65} rot={45} color="#456B4E" />
          <BotanicalLeaf x={460} y={205} len={55} rot={-15} color="#588263" />
          <BotanicalLeaf x={580} y={210} len={55} rot={18} color="#588263" />
          <BotanicalLeaf x={290} y={330} len={65} rot={-60} color="#4D7356" />
          <BotanicalLeaf x={750} y={335} len={65} rot={60} color="#4D7356" />
          <BotanicalLeaf x={465} y={325} len={50} rot={-20} color="#567D5E" />
          <BotanicalLeaf x={575} y={330} len={50} rot={20} color="#567D5E" />

          {/* Baby's breath filler sprigs */}
          {[
            { x: 320, y: 245 },
            { x: 720, y: 250 },
            { x: 425, y: 180 },
            { x: 615, y: 185 },
            { x: 260, y: 310 },
            { x: 780, y: 315 },
            { x: 415, y: 320 },
            { x: 625, y: 325 },
          ].map((pos, i) => {
            const sprigBloom = interpolate(masterProgress, [0.2 + (i % 4) * 0.1, 0.85], [0, 1], clamp);
            return (
              <g key={`gyp-${i}`} transform={`translate(${pos.x} ${pos.y})`}>
                <circle r={sprigBloom * 5} fill="#FFFFFF" stroke="#E1EBE0" strokeWidth="0.8" />
                <circle r={sprigBloom * 2} fill="#FFECA1" />
              </g>
            );
          })}

          {/* Upright closed buds (stay closed), behind the blooms */}
          {CLOSED_BUDS.map((bud, i) => (
            <ClosedBud key={`bud-${i}`} {...bud} frame={frame} />
          ))}

          {/* Small foliage tucked between the buds */}
          <BotanicalLeaf x={400} y={140} len={45} rot={-30} color="#588263" />
          <BotanicalLeaf x={650} y={145} len={45} rot={30} color="#588263" />
          <BotanicalLeaf x={295} y={220} len={42} rot={-45} color="#4D7356" />
          <BotanicalLeaf x={745} y={225} len={42} rot={45} color="#4D7356" />
          <BotanicalLeaf x={522} y={100} len={40} rot={0} color="#567D5E" />

          {/* Bud-stage flowers and their stems, behind the wrap */}
          {renderFlowers("stem")}

          {/* ========================================================
              FRONT KRAFT WRAPPER (MATCHING USER REFERENCE IMAGE)
              Clean tall inverted cone with overlapping folded front panel,
              pinched waist with pink line-drawn bow, flared bottom skirt,
              and dangling pink heart gift tag on the upper right!
              ======================================================== */}
          <g>
            {/* Stem ends poking out below the skirt (drawn behind it) */}
            {[
              [468, 462],
              [490, 487],
              [512, 513],
              [535, 540],
              [558, 566],
            ].map(([x0, x1], i) => (
              <g key={`stem-${i}`}>
                <path d={`M ${x0},820 L ${x1},905`} stroke="#3F6B44" strokeWidth="10" strokeLinecap="butt" />
                <path d={`M ${x0},820 L ${x1},905`} stroke="#5E8D5F" strokeWidth="6" strokeLinecap="butt" />
                <ellipse cx={x1} cy={905} rx="5" ry="2.5" fill="#A8CC98" stroke="#3F6B44" strokeWidth="1" />
              </g>
            ))}

            {/* Flared Bottom Skirt (below the bow waist) */}
            <g>
              {/* Back skirt shadow */}
              <path
                d="M 470,720 L 430,865 Q 520,880 605,865 L 565,720 Z"
                fill="url(#kraftSkirtGrad)"
                stroke="#B59678"
                strokeWidth="1.6"
              />
              {/* Overlapping fold in skirt */}
              <path
                d="M 505,720 L 495,870 Q 550,878 605,865 L 565,720 Z"
                fill="url(#kraftRightSheet)"
                stroke="#B59678"
                strokeWidth="1.4"
              />
              <path d="M 505,720 L 495,870" stroke="#9E8063" strokeWidth="1.8" />
            </g>

            {/* Left Cone Wrap Sheet */}
            <path
              d="M 265,410 L 472,720 Q 515,722 522,720 L 472,432 Z"
              fill="url(#kraftLeftSheet)"
              stroke="#BA9C80"
              strokeWidth="1.8"
            />
            {/* Soft inner shadow under overlapping right sheet */}
            <path
              d="M 455,438 L 522,720 L 500,720 L 435,438 Z"
              fill="#D4BA9C"
              opacity={0.45}
            />

            {/* Right Cone Wrap Sheet (Crisply folded over to the left) */}
            <path
              d="M 472,432 L 775,385 L 565,720 Q 535,722 512,720 L 448,448 Z"
              fill="url(#kraftRightSheet)"
              stroke="#BA9C80"
              strokeWidth="1.8"
            />

            {/* Crisp vertical overlap fold line down the center-left to waist */}
            <path
              d="M 448,448 L 512,720"
              stroke="#9E8063"
              strokeWidth="2.4"
            />
            {/* Paper thickness highlight along the folded crease */}
            <path
              d="M 450,450 L 514,720"
              stroke="#FFF9F0"
              strokeWidth="1.4"
              opacity={0.75}
            />

            {/* Top rim fold highlights */}
            <path d="M 267,412 Q 370,423 470,433" stroke="#FFF9F0" strokeWidth="1.6" opacity={0.65} fill="none" />
            <path d="M 472,433 Q 630,408 773,387" stroke="#FFF9F0" strokeWidth="1.6" opacity={0.65} fill="none" />

            {/* Blooming flowers in front of the wrap */}
            {renderFlowers("bloom")}

            {/* ====================================================
                HANGING GIFT TAG WITH HEART (MATCHING USER REFERENCE)
                Slender brown cord tied from top-right wrap edge to tag
                ==================================================== */}
            <g transform="translate(758 390)">
              {/* Slender diagonal cord */}
              <path
                d="M 0,0 Q 32,32 72,72"
                stroke="#AC8966"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />

              {/* Tag with gentle pendulum sway */}
              <g transform={`translate(72 72) rotate(${-32 + tagSwing})`}>
                <g
                  className="bouquet-tag"
                  onClick={onTagClick}
                  onKeyDown={(e) => {
                    if (onTagClick && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onTagClick();
                    }
                  }}
                  role={onTagClick ? "button" : undefined}
                  tabIndex={onTagClick ? 0 : undefined}
                  aria-label={onTagClick ? "Open the letter" : undefined}
                  style={onTagClick ? { cursor: "pointer" } : undefined}
                >
                {/* Generous invisible tap area for fingers */}
                {onTagClick && <rect x="-46" y="-14" width="92" height="122" fill="transparent" />}

                {/* Knot / eyelet */}
                <circle cx="0" cy="0" r="5" fill="#AC8966" />
                <circle cx="0" cy="0" r="2.2" fill="#FAF6EE" />

                {/* Tag Body (Soft pastel pink gift tag) */}
                <rect
                  x="-28"
                  y="7"
                  width="56"
                  height="86"
                  rx="16"
                  ry="16"
                  fill="#FFB6C6"
                  stroke="#FFA0B4"
                  strokeWidth="1.6"
                />

                {/* Stitched dashed border */}
                <rect
                  x="-22"
                  y="13"
                  width="44"
                  height="74"
                  rx="11"
                  ry="11"
                  fill="none"
                  stroke="#FF8DA4"
                  strokeWidth="1.4"
                  strokeDasharray="4 3"
                />

                {/* Crisp Pink/Red Heart (matching user's reference) */}
                <path
                  d="M 0,40 C -2,36 -15,25 -15,17 C -15,10 -9,5 -1,5 C 0,8 0,8 0,8 C 0,8 0,8 1,5 C 9,5 15,10 15,17 C 15,25 2,36 0,40 Z"
                  fill="#E63956"
                  transform="translate(0 28) scale(1.2)"
                />
                </g>
              </g>
            </g>

            {/* ====================================================
                PINK RIBBON CORD & BOW (EXACT MATCH TO REFERENCE)
                Vivid pink cord tied around the waist:
                - Two horizontal cord wraps
                - Two horizontal loops
                - Central knot
                - Two graceful curving trailing cord ends
                ==================================================== */}
            <g transform="translate(515, 720)">
              {/* Cord wraps across the pinched waist */}
              <path
                d="M -56,-7 Q 0,14 56,-7"
                stroke="#EE4266"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M -48,9 Q 0,26 48,9"
                stroke="#D82C52"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
              />
              {/* Highlight sheen */}
              <path
                d="M -54,-9 Q 0,12 54,-9"
                stroke="#FFA3BA"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                opacity={0.85}
              />

              {/* Left Bow Loop (smooth line-drawn loop matching reference) */}
              <path
                d="M -4,5 C -35,-8 -105,-22 -118,12 C -128,38 -75,44 -18,18 Z"
                fill="#FF4B75"
                stroke="#C71842"
                strokeWidth="3"
              />
              <path
                d="M -16,6 C -48,-1 -92,0 -100,18 C -106,30 -72,32 -26,17"
                stroke="#FF8EA7"
                strokeWidth="2.2"
                fill="none"
                opacity={0.8}
              />

              {/* Right Bow Loop (smooth line-drawn loop matching reference) */}
              <path
                d="M 4,5 C 35,-8 105,-22 118,12 C 128,38 75,44 18,18 Z"
                fill="#FF4B75"
                stroke="#C71842"
                strokeWidth="3"
              />
              <path
                d="M 16,6 C 48,-1 92,0 100,18 C 106,30 72,32 26,17"
                stroke="#FF8EA7"
                strokeWidth="2.2"
                fill="none"
                opacity={0.8}
              />

              {/* Center Bow Knot */}
              <ellipse cx="0" cy="9" rx="13" ry="11" fill="#E62854" stroke="#BD143C" strokeWidth="2.8" />
              <ellipse cx="-2" cy="7" rx="5" ry="3.5" fill="#FFA5BC" opacity={0.85} />

              {/* Graceful Wavy Trailing Cord Ends (matching reference curves) */}
              {/* Left trailing cord */}
              <path
                d={`M -6,18 Q -28,60 ${-36 + ribbonFlutter},105 Q ${-42 + ribbonFlutter},142 ${-54 + ribbonFlutter},168`}
                stroke="#EE4266"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={`M -6,18 Q -28,60 ${-36 + ribbonFlutter},105 Q ${-42 + ribbonFlutter},142 ${-54 + ribbonFlutter},168`}
                stroke="#FFA3BA"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
                opacity={0.75}
              />

              {/* Right trailing cord */}
              <path
                d={`M 6,18 Q 28,60 ${36 - ribbonFlutter},105 Q ${42 - ribbonFlutter},142 ${56 - ribbonFlutter},168`}
                stroke="#D82C52"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d={`M 6,18 Q 28,60 ${36 - ribbonFlutter},105 Q ${42 - ribbonFlutter},142 ${56 - ribbonFlutter},168`}
                stroke="#FFA3BA"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
                opacity={0.75}
              />
            </g>
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export const RemotionRoot = () => (
  <Composition
    id="main"
    component={MainBouquetVideo}
    durationInFrames={300}
    fps={30}
    width={W}
    height={H}
  />
);
