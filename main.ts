// News image for make.fun — "Sum up 17 November's world news in one image".
// Node 22, standard library only, no network. The program draws the whole
// 1024x1024 front page itself (panels, a world map, icons, headlines in a 5x7 pixel font)
// and writes it to /output/entry.png, deterministically: same bytes every run.
//
// Run locally: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

// ---------------------------------------------------------------------------
// 5x7 pixel font. Each glyph is 7 rows of 5 bits, '#' = on, '.' = off.
// Uppercase, digits and the punctuation the headlines need.
const FONT: Record<string, string[]> = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.####'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  '0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  '3': ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '6': ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
  ',': ['.....', '.....', '.....', '.....', '.##..', '..#..', '.#...'],
  ':': ['.....', '.##..', '.##..', '.....', '.##..', '.##..', '.....'],
  '-': ['.....', '.....', '.....', '.###.', '.....', '.....', '.....'],
  '(': ['...#.', '..#..', '.#...', '.#...', '.#...', '..#..', '...#.'],
  ')': ['.#...', '..#..', '...#.', '...#.', '...#.', '..#..', '.#...'],
  '/': ['....#', '...#.', '...#.', '..#..', '.#...', '.#...', '#....'],
  '&': ['.##..', '#..#.', '#.#..', '.#...', '#.#.#', '#..#.', '.##.#'],
  "'": ['..#..', '..#..', '.#...', '.....', '.....', '.....', '.....'],
  '!': ['..#..', '..#..', '..#..', '..#..', '..#..', '.....', '..#..'],
  '?': ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'],
  '%': ['##..#', '##.#.', '...#.', '..#..', '.#...', '#.##.', '#..##'],
  '+': ['.....', '..#..', '..#..', '.###.', '..#..', '..#..', '.....'],
  '•': ['.....', '.....', '.##..', '.##..', '.##..', '.....', '.....'],
};

// ---------------------------------------------------------------------------
// Canvas: a plain RGB buffer with rect / circle / line / text drawing.
const W = 1024;
const H = 1024;
const px = new Uint8Array(W * H * 3);

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function setPx(x: number, y: number, c: [number, number, number]): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2];
}
function rect(x: number, y: number, w: number, h: number, color: string): void {
  const c = rgb(color);
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) setPx(i, j, c);
}
function circle(cx: number, cy: number, r: number, color: string): void {
  const c = rgb(color);
  for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
    if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r) setPx(x, y, c);
  }
}
function ring(cx: number, cy: number, r: number, t: number, color: string): void {
  const c = rgb(color);
  for (let y = cy - r - t; y <= cy + r + t; y++) for (let x = cx - r - t; x <= cx + r + t; x++) {
    const d = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
    if (Math.abs(d - r) <= t / 2) setPx(x, y, c);
  }
}
function hline(x: number, y: number, w: number, t: number, color: string): void {
  rect(x, y, w, t, color);
}
function vline(x: number, y: number, h: number, t: number, color: string): void {
  rect(x, y, t, h, color);
}
function textWidth(s: string, scale: number): number {
  return s.length * 6 * scale - scale;
}
function drawText(x: number, y: number, s: string, scale: number, color: string): void {
  const c = rgb(color);
  let cx = x;
  for (const ch of s.toUpperCase()) {
    const g = FONT[ch] ?? FONT['?'];
    for (let r = 0; r < 7; r++) for (let col = 0; col < 5; col++) {
      if (g[r][col] === '#') {
        for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) {
          setPx(cx + col * scale + dx, y + r * scale + dy, c);
        }
      }
    }
    cx += 6 * scale;
  }
}
function wrapText(s: string, scale: number, maxW: number): string[] {
  const words = s.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (textWidth(test, scale) <= maxW) cur = test;
    else { if (cur) lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}
function drawPara(x: number, y: number, s: string, scale: number, maxW: number, color: string): number {
  const lines = wrapText(s, scale, maxW);
  for (const line of lines) { drawText(x, y, line, scale, color); y += 9 * scale; }
  return y;
}

// ---------------------------------------------------------------------------
// Minimal PNG encoder (filter 0, zlib deflate, CRC32) — deterministic output.
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, 'ascii'), data])), 8 + data.length);
  return out;
}
function encodePng(): Buffer {
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0;
    raw.set(px.subarray(y * W * 3, (y + 1) * W * 3), y * (1 + W * 3) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// ---------------------------------------------------------------------------
// Layout: a dense newspaper front page for Tuesday 17 November 2026.
// v2: 59 stories across 6 continents — hero + stylised world map + 6 region
// sections of 7 stories each + a ticker. Stories verified against One Turn,
// Just Security, Algenom, Daily Brief, The Straits Times, Outlook India,
// RNZ, The Independent, Reuters, Bloomberg/SWI, Motley Fool, Africa CDC,
// NST and other outlets reporting on 17 Nov 2026 (see README.md).
// The five v1 heroes are kept (Qeshm Island, ASEAN deals, Japan jets,
// Pentagon audit, third US carrier) plus 54 more real Nov 17 stories.
const PAPER = '#f6f1e3';
const INK = '#16233f';
const NAVY = '#16233f';
const RED = '#a4242c';
const TEAL = '#0f766e';
const GOLD = '#c9a227';
const BLUE = '#1d4e89';
const LAND = '#3a8a7f';
const ORANGE = '#c25e1e';

function tag(x: number, y: number, label: string, color: string): void {
  const w = textWidth(label, 2) + 16;
  rect(x, y, w, 26, color);
  drawText(x + 8, y + 3, label, 2, '#ffffff');
}

function panel(x: number, y: number, w: number, h: number, bg: string, border: string): void {
  rect(x, y, w, h, bg);
  rect(x, y, w, 4, border);
  rect(x, y, 4, h, border);
  rect(x + w - 4, y, 4, h, border);
  rect(x, y + h - 4, w, 4, border);
}

// One region story: a short headline, wrapped to at most two scale-1 lines.
function storyItem(x: number, y: number, maxW: number, headline: string, color: string): number {
  rect(x, y + 2, 7, 7, color);
  const lines = wrapText(headline, 1, maxW - 16).slice(0, 2);
  let yy = y;
  for (const line of lines) { drawText(x + 14, yy, line, 1, INK); yy += 9; }
  return yy + 5;
}

function region(x: number, y: number, w: number, h: number, title: string, color: string, items: string[]): void {
  panel(x, y, w, h, '#ffffff', color);
  rect(x, y, w, 30, color);
  drawText(x + 10, y + 5, title, 2, '#ffffff');
  let yy = y + 42;
  for (const item of items) yy = storyItem(x + 10, yy, w - 20, item, color);
}

function drawMap(x: number, y: number, w: number, h: number): void {
  rect(x, y, w, h, NAVY);
  drawText(x + 10, y + 6, 'THE WORLD TODAY - 6 CONTINENTS', 1, GOLD);
  // Stylised continents: clusters of filled rects (land) on the navy band.
  const land = rgb(LAND);
  const blobs: Array<[number, number, number, number]> = [
    // North America
    [x + 46, y + 22, 92, 26], [x + 66, y + 48, 72, 18], [x + 126, y + 22, 42, 16],
    // Greenland
    [x + 226, y + 18, 18, 10],
    // South America
    [x + 191, y + 72, 46, 14], [x + 199, y + 86, 34, 22],
    // Europe
    [x + 446, y + 22, 56, 20], [x + 476, y + 42, 30, 12],
    // Africa
    [x + 446, y + 56, 62, 34], [x + 466, y + 90, 26, 10],
    // Asia
    [x + 516, y + 22, 182, 28], [x + 556, y + 50, 142, 22], [x + 676, y + 72, 62, 16],
    [x + 696, y + 88, 52, 10],
    // Oceania
    [x + 836, y + 88, 72, 16], [x + 856, y + 74, 22, 10],
  ];
  for (const [bx, by, bw, bh] of blobs) {
    for (let j = by; j < by + bh; j++) for (let i = bx; i < bx + bw; i++) setPx(i, j, land);
  }
  // Gold dots at the day's hot spots.
  const dots: Array<[number, number]> = [
    [x + 668, y + 62], [x + 500, y + 32], [x + 776, y + 82], [x + 846, y + 40],
    [x + 616, y + 66], [x + 476, y + 70], [x + 140, y + 36], [x + 214, y + 88],
    [x + 872, y + 94], [x + 576, y + 30],
  ];
  for (const [dx, dy] of dots) circle(dx, dy, 4, GOLD);
  drawText(x + 56, y + 34, 'N AMERICA', 1, '#ffffff');
  drawText(x + 448, y + 30, 'EUROPE', 1, '#ffffff');
  drawText(x + 452, y + 68, 'AFRICA', 1, '#ffffff');
  drawText(x + 600, y + 32, 'ASIA', 1, '#ffffff');
  drawText(x + 838, y + 92, 'OCEANIA', 1, '#ffffff');
  drawText(x + 196, y + 78, 'S AMERICA', 1, '#ffffff');
}

const REGIONS: Array<{ title: string; color: string; items: string[] }> = [
  { title: 'MIDDLE EAST & GULF', color: RED, items: [
    "IRAN'S 3RD DRONE ATTACK ON BAHRAIN IN 5 DAYS",
    'TANKER HIT IN HORMUZ: FIRE, 21 INDIANS SAVED, 1 MISSING',
    'HOUTHIS ADVANCE IN YEMEN, GOVT FALLS BACK TO ADEN',
    'GAZA AID: UK, AUSTRALIA, CANADA, ITALY URGE ISRAEL TO OPEN CROSSINGS',
    'OMAN EVACUATES 24 CREW FROM BURNING TANKER',
    'HOUTHIS LAUNCH DRONES AT SAUDI EAST-WEST PIPELINE',
    "TRUMP: US TAKING IRAN SITUATION 'VERY SERIOUSLY'",
    'BAHRAIN ISSUES ALL-CLEAR AFTER IRAN CLAIMS ATTACK',
    'PAKISTAN ARMY CHIEF, IRAN FM DISCUSS REGIONAL PEACE',
    'THIRD US CARRIER REACHES GULF, USS THEODORE ROOSEVELT',
  ] },
  { title: 'EUROPE', color: BLUE, items: [
    'UKRAINE HITS KERCH BRIDGE AGAIN, SPAN FALLS INTO STRAIT',
    'RUSSIA HITS KYIV BRIDGES, CLOSES DNIPRO CROSSINGS',
    "UKRAINE'S 1,300-DRONE BARRAGE, RUSSIA SAYS 1,441 DOWNED",
    'RAMSTEIN: GERMANY, NORWAY PAY USD 300M FOR UKRAINE AIR DEFENCE',
    'UK TO SEND UKRAINE 1,000+ AIR DEFENCE MISSILES',
    'FIVE EU STATES PLAN RWANDA DEPORTATION HUB FOR 2027',
    'IMF NEARS USD 1.6BN DEAL WITH UKRAINE',
    'ESTONIA BACKS UKRAINE NATO BID, CLOSES RUSSIA BORDER POINTS',
    "FINLAND'S STUBB URGES EUROPE TO TALK TO PUTIN DIRECTLY",
  ] },
  { title: 'ASIA-PACIFIC', color: TEAL, items: [
    'ASEAN ENDS: US-THAILAND TRADE DEAL, QUAD MINERAL PACTS',
    'TRUMP HEADS TO SHENZHEN FOR XI-PUTIN SUMMIT ON THURSDAY',
    'JAPAN SCRAMBLES JETS OVER RUSSIAN INCURSION',
    'SOUTH KOREA, TAIWAN ALSO FLAG RUSSIAN AIRCRAFT',
    'DELHI AQI 246, POOR FOR 16TH DAY, GRAP III LIFTED',
    'CYCLONE AKVAN NEARS INDIA, ANDHRA ON ORANGE ALERT',
    'MACRON IN MALAYSIA, ANWAR DEMANDS UN OVERHAUL',
    'MODI UNVEILS 7-POINT PUSH ON MARITIME SECURITY, MINERALS',
    'MALAYSIA INVESTMENT APPROVALS JUMP 20.7% TO RM350.4BN',
  ] },
  { title: 'AMERICAS', color: ORANGE, items: [
    'PENTAGON FAILS AUDIT FOR 9TH YEAR, USD 4.8TN UNVERIFIED',
    'NASDAQ IN CORRECTION AS TECH SELLS OFF, DOW -860',
    'NVIDIA Q3 REVENUE USD 115.8BN, +103%, SHARES REBOUND',
    'ANTHROPIC IPO WEDNESDAY, EYES USD 1.4TN VALUATION',
    'US AIR TRAVEL CHAOS: 1M+ STRANDED AT AIRPORTS',
    'ECUADOR FISHERMEN SUE US OVER DRONE SINKING',
    'JPMORGAN OUTAGE ENDS, TRANSACTIONS BACK TO NORMAL',
    'US RETAIL SALES RESILIENT, INDUSTRIAL OUTPUT WEAKER',
    'INTEL FALLS AFTER NVIDIA CUTS STAKE BY 25%',
  ] },
  { title: 'AFRICA & OCEANIA', color: '#5b7a1e', items: [
    'EBOLA IN DR CONGO PASSES 11,000 CASES, 5,500 DEAD',
    'SOUTH AFRICA: 17 DEAD IN TWO MASS SHOOTINGS',
    'SENEGAL BEAT SUDAN 4-2, CLOSE TO AFCON 2027',
    'GUINEA ARRESTS 1,200 IN GOLD-MINING CRACKDOWN',
    'CYCLONE XAVIER HEADS FOR COOK ISLANDS',
    'AUSTRALIA: BACKPACKERS MUST DO 4 MONTHS RURAL WORK',
    'ANGLOGOLD TO INVEST USD 2.5BN IN COLOMBIA COPPER MINE',
    'MOZAMBIQUE LAUNCHES USD 7.5BN PORT MODERNISATION',
    'COP31: 95% OF COASTAL NATIONS NOW INCLUDE OCEAN IN CLIMATE PLANS',
  ] },
  { title: 'MARKETS, TECH & CULTURE', color: '#6b3fa0', items: [
    'COP31 DRAFT DEAL CALLS FOR FASTER EXIT FROM FOSSIL FUELS',
    'FRANCE, BRAZIL LAUNCH OCEAN CLIMATE TASKFORCE AT COP31',
    'OIL, GOLD AND STOCKS FALL: BRENT -3.6% TO USD 92.44',
    'BITCOIN FALLS TO USD 64,140 AS TECH SELLS OFF',
    'DEPARDIEU DROPS APPEAL, ADMITS SEXUAL ASSAULT',
    'POPE FORGIVES ROSARY ATTACKER IN PERU',
    'PATTINSON NAMED NEXT JAMES BOND',
    'NASDAQ 100 -1.6%, STOXX 600 -1.5% AS TECH ROUT SPREADS',
    'GOLD FALLS 0.8% TO USD 3,848.51, LOWEST SINCE OCTOBER',
  ] },
];

function draw(): void {
  rect(0, 0, W, H, PAPER);

  // Header band.
  rect(0, 0, W, 104, NAVY);
  drawText(24, 14, 'THE WORLD IN ONE PICTURE', 2, GOLD);
  drawText(24, 44, '17 NOVEMBER 2026', 5, '#ffffff');
  rect(796, 14, 204, 76, GOLD);
  drawText(812, 24, '59 STORIES', 3, NAVY);
  drawText(812, 62, '6 CONTINENTS', 2, NAVY);

  // Hero: US strikes Iran's Qeshm Island in the Strait of Hormuz.
  panel(24, 112, 976, 150, '#ffffff', RED);
  tag(48, 128, 'MIDDLE EAST', RED);
  drawText(48, 166, "US STRIKES IRAN'S", 4, INK);
  drawText(48, 206, 'QESHM ISLAND', 4, INK);
  drawPara(560, 172, "US hits a missile site in the Strait of Hormuz after Iran's third drone attack on Bahrain.", 2, 290, '#333333');
  // Blast icon on the right of the hero: island with radiating spokes.
  circle(920, 187, 40, BLUE);
  ring(920, 187, 40, 3, '#ffffff');
  for (let a = 0; a < 8; a++) {
    const ang = (a * Math.PI) / 4;
    const x1 = 920 + Math.round(Math.cos(ang) * 46); const y1 = 187 + Math.round(Math.sin(ang) * 46);
    const x2 = 920 + Math.round(Math.cos(ang) * 62); const y2 = 187 + Math.round(Math.sin(ang) * 62);
    rect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1) + 4, Math.abs(y2 - y1) + 4, GOLD);
  }
  circle(920, 187, 10, GOLD);

  // World map strip.
  drawMap(24, 270, 976, 112);

  // Six region sections, 3 x 2.
  const rw = 320; const rh = 264;
  for (let i = 0; i < 6; i++) {
    const cx = 24 + (i % 3) * (rw + 8);
    const cy = 390 + Math.floor(i / 3) * (rh + 10);
    region(cx, cy, rw, rh, REGIONS[i].title, REGIONS[i].color, REGIONS[i].items);
  }

  // Bottom ticker.
  rect(24, 936, 976, 80, NAVY);
  drawText(48, 950, 'ALSO TODAY:', 2, GOLD);
  drawPara(48, 980, 'ALCARAZ BEATS TIAFOE 6-2 6-2 AT ATP FINALS - ACKERMAN HITS 157 FOR SOUTH AFRICA - NEPAL FIRST FOR UN LOSS AND DAMAGE FUND', 1, 928, '#ffffff');
}

draw();
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), encodePng());
