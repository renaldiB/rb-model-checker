---
name: Obsidian Sentinel
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353942'
  surface-container-lowest: '#0a0e16'
  surface-container-low: '#181c24'
  surface-container: '#1c2028'
  surface-container-high: '#262a33'
  surface-container-highest: '#31353e'
  on-surface: '#dfe2ee'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#dfe2ee'
  inverse-on-surface: '#2c3039'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#ffb2b7'
  on-tertiary: '#67001b'
  tertiary-container: '#ff7886'
  on-tertiary-container: '#780021'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#0f131c'
  on-background: '#dfe2ee'
  surface-variant: '#31353e'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.06em
  code-output:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system embodies an uncompromising, high-precision cybersecurity operations console built for machine learning engineers, security analysts, and AI infrastructure architects. The emotional response is one of absolute control, diagnostic clarity, and zero-trust certainty in an environment saturated with model spoofing, endpoint impersonation, and weight-masking threats.

The aesthetic fuses **Tactile Sci-Fi HUD** architecture with refined **Glassmorphism** and utilitarian **Minimalism**. Rather than ornamental sci-fi clutter, every line, border, and glow acts as a functional telemetry cue:
- **Obsidian Voids**: Pitch-black canvas depths remove all environmental distractions, anchoring high-contrast status cues.
- **Instrument-Grade Glass**: Semi-translucent panels with fine 1px structural framing create optical layering that replicates heads-up tactical displays.
- **Deterministic Lighting**: Accents function strictly as state-driven illumination—lighting up only when telemetry updates, verification confirms, or an adversarial intrusion occurs.

## Colors

The palette operates in strict semantic regimes tailored to low-latency alert triage:

- **Void Base (`#0B0F17`)**: The primary root background. Absorbent, low-reflectance charcoal obsidian that eliminates eye strain during deep-night operational surveillance.
- **Primary / Emerald Authenticity (`#10B981`)**: Dedicated exclusively to cryptographic validation, authentic weight hashes, verified SSL cert pins, and legitimate routing states. Never used decoratively.
- **Secondary / Electric Cyan (`#06B6D4`)**: Signals live streaming network telemetry, real-time packet inspection, token throughput, and active probes.
- **Tertiary / Electric Crimson (`#F43F5E`)**: High-priority alert state indicating model masking, prompt-injection proxying, token spoofing, or signature invalidation.
- **Support / Amber Gold (`#F59E0B`)**: Intermediary anomaly state: latency anomalies, unknown wrapper drift, token rate deviations.
- **Dark Slate Containers (`#111726`)**: Translucent card backings providing contrast against `#0B0F17` while allowing background HUD gridlines to diffuse through.
- **Border Matrix (`rgba(255, 255, 255, 0.08)`)**: Hairline containment borders preventing visual bleeding across complex multi-window displays.

## Typography

The typographic hierarchy enforces a division of labor between narrative structure and technical data:

- **Geist (Headlines & Body)**: Provides ultra-clean, neutral, and compact structural legibility for views, sections, analytical descriptions, and system instructions.
- **JetBrains Mono (Telemetry, Metadata & Badges)**: Assigned to all machine-readable values—model parameter hashes, endpoint latency, IP/DNS stamps, hex addresses, payload sizes, and status tags. The monospace alignment maintains strict tabular scanability in rapid-refresh data streams.
- **Case Conventions**: Data tags, security clearance tiers, and status descriptors strictly leverage uppercase styling via `label-sm` or `label-md` with positive letter spacing (`0.04em` - `0.06em`) to echo terminal readout monitors.

## Layout & Spacing

The system runs on a 12-column responsive fluid grid structured for dense information architecture and modular surveillance widgets:

- **Desktop (1200px+)**: 12 columns with `1.5rem` gutters and `2rem` outer margins. Dynamic HUD modules (Endpoint Tree, Live Telemetry Stream, Hash Signature Terminal, Spoof Detection Matrix) form multi-pane tile arrangements.
- **Tablet (768px - 1199px)**: 8 columns with `1rem` gutters and `1.5rem` margins. Side panels fold into off-canvas drawers; the central model inspection radar dominates the visual field.
- **Mobile (Below 768px)**: 4 columns with `1rem` gutters and `1rem` margins. Panes convert into a linear feed ordered by threat severity (Crimson Spoof warnings pinned to the top, verified items below).
- **Rhythm Principle**: Internal card padding matches `space-lg` (`1.5rem`) for macro-containers and `space-md` (`1rem`) for telemetry cells. Dense key-value readouts use tight `space-xs` and `space-sm` gaps to pack maximum diagnostic payload into single viewports without vertical scrolling.

## Elevation & Depth

Depth is modeled as optical HUD filtration rather than natural drop shadows:

- **Level 0 (Canvas Void)**: `#0B0F17` base with an optional faint, repetitive `rgba(6, 182, 212, 0.03)` radial reticle or dot matrix pattern to establish an optical zero plane.
- **Level 1 (Data Modules & Panels)**: Background `#111726` with `backdrop-filter: blur(12px)`, layered with an inner glow or border of `1px solid rgba(255, 255, 255, 0.08)`. No traditional drop shadow is applied; separation is driven by luminescence contrast.
- **Level 2 (Active Inspections & Hover Targets)**: Background `#161F33` with `1px solid rgba(6, 182, 212, 0.35)` and a subtle ambient perimeter aura: `box-shadow: 0 0 20px -5px rgba(6, 182, 212, 0.15)`.
- **Level 3 (Alert Intercepts & Overlays)**: Critical anomaly modals or spoof alerts leverage `#1A111E` with `1px solid rgba(244, 63, 94, 0.5)` and a radiant edge: `box-shadow: 0 0 30px -4px rgba(244, 63, 94, 0.25)`.

## Shapes

The interface embraces a disciplined **Soft (1)** shape language:
- Core modules, telemetry cards, and panels utilize a precise `0.25rem` (4px) corner radius, preserving a razor-sharp, mechanical cyberware aesthetic without aggressive raw brutalist edges.
- Interactive inputs and structural controls scale up to `0.5rem` (`rounded-lg`) strictly when housing tactile toggles or data entry fields.
- Avoid spherical or large pill geometry for standard layout containers; pill shapes are reserved solely for high-visibility micro status badges and dynamic status indicators.
- Chamfered or cut-corner visual motifs may be expressed through 45-degree corner accent marks on the top-right corner of primary alert cards.

## Components

### Buttons & Trigger Controls
- **Primary Action (Scan / Verify)**: Dark emerald gradient or solid `#10B981` text over a translucent emerald tint (`rgba(16, 185, 129, 0.12)`), bounded by `1px solid rgba(16, 185, 129, 0.4)`. Hover triggers a tight `box-shadow: 0 0 12px rgba(16, 185, 129, 0.35)`.
- **Secondary (Inspect / Trace)**: JetBlack slate surface with `1px solid rgba(255, 255, 255, 0.12)`, text `#94A3B8`, transitioning to `#06B6D4` border and text on hover.
- **Destructive / Abort (Quarantine Endpoint)**: `rgba(244, 63, 94, 0.1)` base, `1px solid #F43F5E`, text `#F43F5E`. Glow spikes on hover.

### Glowing Micro-Badges
- Scaled to `label-sm` typography in JetBrains Mono.
- **Authentic / Verified**: Background `rgba(16, 185, 129, 0.1)`, text `#10B981`, leading 6px pulsing dot with ping animation.
- **Spoof / Masked**: Background `rgba(244, 63, 94, 0.12)`, text `#F43F5E`, framed in `1px solid rgba(244, 63, 94, 0.4)`.
- **Telemetry Streaming**: Background `rgba(6, 182, 212, 0.1)`, text `#06B6D4`, dynamic waveform or audio-style ticker icon.

### Cards & Telemetry Containers
- Built on `#111726` with 12px frosted backdrop blur and hairline `rgba(255, 255, 255, 0.08)` borders.
- Top-right panel headers contain monospaced coordinate/status indicators (e.g., `SYS.LOC // US-EAST-01 :: PORT 8443`).

### Input Fields (Endpoint & Hash Inspection)
- Deep inset background (`#090D14`), `1px solid rgba(255, 255, 255, 0.1)`.
- Active focus invokes a border transition to `#06B6D4` with `0 0 8px rgba(6, 182, 212, 0.25)` cyan halo. Monospaced font for zero-ambiguity character differentiation (e.g., `0` vs `O`, `1` vs `l`).

### Checkboxes, Radios & Switches
- Squared switches with `0.125rem` inner radiuses.
- Active states populate with neon fills (`#10B981` or `#06B6D4`) without gradient clutter.

### Specialized HUD Components
- **Hex Signature Streamer**: Live monospaced memory/token trace console displaying payload raw bytes, timestamped latency diffs, and verification checksums.
- **Model Legitimacy Gauge**: Segmented radial or multi-tick progress bar transitioning dynamically from Crimson (`0%-50%`) to Amber (`51%-85%`) to Neon Emerald (`86%-100%`).