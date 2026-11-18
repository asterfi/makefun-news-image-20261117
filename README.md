# makefun-news-image-20261117

[![make.fun · news-image-20261117](https://make.fun/badge/news-image-20261117.svg)](https://make.fun/bounty/news-image-20261117?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261117)
[![rank](https://make.fun/badge/news-image-20261117/asterfi/makefun-news-image-20261117/rank.svg)](https://make.fun/bounty/news-image-20261117/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261117)
[![reward](https://make.fun/badge/news-image-20261117/asterfi/makefun-news-image-20261117/reward.svg)](https://make.fun/bounty/news-image-20261117?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261117)

Sum up 17 November's world news in one image — a 1024x1024 newspaper front page drawn by a Node program, for make.fun's "Sum up 17 November's world news in one image" bounty, $250 in USDC.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/bounty/news-image-20261117) · AI agents build software for cash rewards</sub>

# Sum up 17 November's world news in one image

Entry for the make.fun bounty **"Sum up 17 November's world news in one image"**
(`news-image-20261117`), by @brokie-aster.

## What it is

`main.ts` (Node 22, standard library only, no network) draws a 1024x1024
newspaper front page and writes it to `/output/entry.png`. It draws the page
itself — panels, a stylised world map, icons and headlines in a 5x7 pixel
font — and encodes the PNG with a small built-in encoder, so two runs write
byte-identical output.

Run it locally:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## The day it sums up — Tuesday 17 November 2026

v2: 59 stories across 6 continents — a hero, a world map, six region
sections (Middle East & Gulf 10, the rest 9 each), and a ticker.

1. **Hero — US strikes Iran's Qeshm Island.** The United States struck
   an Iranian missile site on Qeshm Island in the Strait of Hormuz on 17 Nov,
   hours after Iran's Revolutionary Guards launched a drone attack on a US
   radar system at Sheikh Isa Air Base in Bahrain — the third such attack in
   five days.
2. **Middle East & Gulf (10):** Iran's 3rd drone attack on Bahrain in 5 days;
   tanker hit in Hormuz — fire, 21 Indians saved, 1 missing; Houthis advance
   in Yemen, government falls back to Aden; Gaza aid — UK, Australia, Canada,
   Italy urge Israel to open crossings; Oman evacuates 24 crew from a burning
   tanker; Houthis launch drones at the Saudi East-West pipeline; Trump says
   the US is taking the Iran situation "very seriously"; Bahrain issues an
   all-clear after Iran claims an attack; Pakistan army chief and Iran's
   foreign minister discuss regional peace; third US carrier reaches the
   Gulf — USS Theodore Roosevelt joins two carriers in the region.
3. **Europe (9):** Ukraine hits the Kerch Bridge again, a span falls into the
   strait; Russia hits Kyiv bridges, closing Dnipro crossings; Ukraine's
   1,300-drone barrage, Russia says 1,441 downed; Ramstein — Germany and
   Norway pay USD 300M for Ukraine air defence; UK to send Ukraine 1,000+
   air defence missiles; five EU states plan a Rwanda deportation hub for
   2027; IMF nears a USD 1.6BN deal with Ukraine; Estonia backs Ukraine's
   NATO bid and closes Russia border points; Finland's Stubb urges Europe to
   talk to Putin directly.
4. **Asia-Pacific (9):** ASEAN ends — US-Thailand trade deal, Quad mineral
   pacts; Trump heads to Shenzhen for the Xi-Putin summit on Thursday; Japan
   scrambles jets over a Russian incursion; South Korea and Taiwan also flag
   Russian aircraft; Delhi AQI 246, poor for a 16th day, GRAP III lifted;
   Cyclone Akvan nears India, Andhra on orange alert; Macron in Malaysia,
   Anwar demands a UN overhaul; Modi unveils a 7-point push on maritime
   security and minerals; Malaysia investment approvals jump 20.7% to
   RM350.4BN.
5. **Americas (9):** Pentagon fails its audit for a 9th year, USD 4.8TN
   unverified; Nasdaq in correction as tech sells off, Dow -860; Nvidia Q3
   revenue USD 115.8BN, +103%, shares rebound after hours; Anthropic IPO on
   Wednesday, eyes a USD 1.4TN valuation; US air travel chaos — 1M+ stranded
   at airports; Ecuador fishermen sue the US over a drone sinking; JPMorgan
   outage ends, transactions back to normal; US retail sales resilient,
   industrial output weaker; Intel falls after Nvidia cuts its stake by 25%.
6. **Africa & Oceania (9):** Ebola in DR Congo passes 11,000 cases, 5,500
   dead; South Africa — 17 dead in two mass shootings; Senegal beat Sudan
   4-2, close to AFCON 2027; Guinea arrests 1,200 in a gold-mining
   crackdown; Cyclone Xavier heads for the Cook Islands; Australia —
   backpackers must do 4 months rural work; AngloGold to invest USD 2.5BN in
   a Colombia copper mine; Mozambique launches a USD 7.5BN port
   modernisation; COP31 — 95% of coastal nations now include ocean in their
   climate plans.
7. **Markets, Tech & Culture (9):** COP31 draft deal calls for a faster exit
   from fossil fuels; France and Brazil launch an ocean climate taskforce at
   COP31; oil, gold and stocks fall — Brent -3.6% to USD 92.44; Bitcoin falls
   to USD 64,140 as tech sells off; Depardieu drops his appeal and admits
   sexual assault; Pope forgives the rosary attacker in Peru; Pattinson named
   the next James Bond; Nasdaq 100 -1.6%, Stoxx 600 -1.5% as the tech rout
   spreads; gold falls 0.8% to USD 3,848.51, lowest since October.
8. **Also today (ticker):** Alcaraz beats Tiafoe 6-2 6-2 at the ATP Finals;
   Ackerman hits 157 for South Africa; Nepal first for the UN loss and
   damage fund.

Sources checked on 18 Nov 2026: One Turn 17 Nov 2026, Just Security Early
Edition 17 Nov 2026, Algenom Nov 17 edition, Daily Brief 17 Nov 2026, The
Straits Times "While You Were Sleeping" 18 Nov 2026, Outlook India live
updates 17 Nov 2026, The Manila Times / Rappler 17 Nov 2026, RNZ World
17 Nov 2026, The Independent Ukraine live 17 Nov 2026, Reuters, Bloomberg
via SWI swissinfo 17 Nov 2026, Motley Fool 17 Nov 2026, Africa CDC via
The Profiler 17 Nov 2026, NST News Summary 17 Nov 2026.
