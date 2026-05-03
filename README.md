# 🎪 BIANCARNIVAL

**The 3rd Annual BianCarnival — May 30, 2026 · 6PM · Bushwick, NY**

A conceptual, interactive comedy carnival from the completely perfect mind of **Bianca Dot**. This is the official event landing page — physics curtain and all.

---

## Overview

BianCarnival is a single-page event website with a theatrical entrance experience. Visitors are greeted by a velvet physics curtain (Three.js cloth simulation) that they must tap/click to open, after which the full page animates in. The aesthetic is an underground carnival zine — grainy, hand-stamped, chaotic in the best way.

### Key Features

- **Physics Curtain** — Three.js cloth simulation (`curtain.js`) with gravity and mouse interaction before the user opens it
- **Layered Audio** — Web Audio API synthesized SFX (woosh, reveal rumble, tap clicks) + a looping CC0 background music track
- **GSAP Entrance Sequence** — Staggered animations for title, faces, info boxes, decorations, and buttons after curtain opens
- **Interactive Title Letters** — Click each letter to explode it off-screen; when all 12 are gone, they bounce back in
- **Spinning Faces** — Physics-based spin on click for Bianca's face images, with momentum and friction
- **Mouse Parallax** — All `data-depth` elements shift with cursor position for a 3D depth effect
- **Box 3D Tilt** — Info cards respond to mouse movement with perspective tilt + dynamic box-shadow
- **Overlay Cards** — Click any info box to expand it in a full-screen overlay modal
- **Mobile Horizontal Swipe Strip** — On mobile, cards become a horizontal scroll snap carousel with scale-on-center highlighting
- **Custom Cursor** — Blob cursor on pointer devices, hidden on touch
- **Mute Toggle** — Persistent button to mute/unmute background music

---

## File Structure

```
biancarnival/
├── index.html                 # Main page — all markup and layout
├── style.css                  # All styling, responsive, and animation CSS
├── script.js                  # Main JS — audio, GSAP animations, interactivity
├── curtain.js                 # Three.js cloth physics curtain simulation
├── background_music_cc0.wav   # Looping ambient background music (CC0)
├── curtains.wav               # Curtain whoosh SFX
└── biancasface.png            # Bianca's face — used as favicon, face collage, etc.
```

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Vanilla HTML/CSS/JS | Core structure, styling, logic |
| [GSAP 3](https://gsap.com/) | All animations and timelines |
| [Three.js r128](https://threejs.org/) | Cloth curtain physics simulation |
| Web Audio API | Synthesized SFX (no external deps) |
| Google Fonts | Syne, Space Mono, Inter, Playfair Display |

No build step. No framework. No bundler. Just open `index.html`.

---

## Design System

Defined in `:root` CSS variables:

| Variable | Value | Usage |
|---|---|---|
| `--bg` | `#111` | Page background |
| `--paper` | `#f0e8d8` | Off-white text/cards |
| `--red` | `#ff3333` | Primary accent |
| `--blue` | `#3366ff` | Secondary accent |
| `--yellow` | `#ffcc00` | Tertiary accent |
| `--green` | `#33cc66` | Quaternary accent |
| `--mono` | Space Mono | Labels, metadata, tickets |
| `--display` | Syne | Headlines, card titles |
| `--body` | Inter | Body text |
| `--serif` | Playfair Display | Subtitle, curtain prompt |

---

## Info Cards

Eight `<article class="box">` cards are scattered across the stage on desktop and swipeable on mobile:

| # | Card | Color |
|---|---|---|
| 01 | About | Red |
| 02 | Date | Paper (ruled) |
| 03 | Location | Blue |
| 04 | The Acts | Yellow |
| 05 | FAQ | Dark |
| 06 | Tickets | Red |
| 07 | Bianca Dot | Paper (ruled) |
| 08 | Contact | Green |
| ?? | ??? | Striped mystery |

Each card opens in a full-screen overlay on click.

---

## Event Details

| | |
|---|---|
| **Date** | May 30, 2026 |
| **Time** | Doors 6:00 PM · Show shortly after |
| **Venue** | Rubulad, Bushwick, Brooklyn, NY |
| **Transit** | Jefferson St. stop, L train |
| **Tickets** | $18 Early Bird (until May 15) · $20 GA · $23 Door |
| **Purchase** | Venmo @biancamangravite |

Schedule:
- **6:00 PM** — Live variety show (lineup TBA)
- **7:30 PM** — Interactive carnival booths
- **10:00 PM** — Afters with DJ sets by Barbara and Elena

---

## Running Locally

No server required — open directly in a browser:

```bash
open index.html
```

Or serve it (recommended to avoid audio autoplay quirks):

```bash
npx serve .
```

---

## Browser Notes

- Audio requires a user gesture to start (browser policy) — the curtain click counts
- Custom cursor is hidden on touch/coarse pointer devices (mobile)
- The `getComputedStyle` calls on `.deco` elements are wrapped in try/catch to handle edge cases in Cloudflare-proxied environments
- `overflow: hidden` on `html, body` is intentional — the page is a fixed-height stage, not a scroll document (except the mobile card strip)

---

## Credits

Website by [alden](https://instagram.com/verybigandstrong)  
Event by **Bianca Dot**  
© 2026 BIANCARNIVAL · No refunds
