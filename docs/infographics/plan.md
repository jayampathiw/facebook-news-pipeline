# Infographics & Explainer Videos — Planning Document

**Status:** 📋 Planning Pending  
**Created:** 2026-06-18

---

## What This Is

A new content type alongside news articles and reels: visual explainer content — either static infographics (single image with data/diagrams) or short animated explainer videos (slide-by-slide, like a converted PowerPoint). Both formats perform well on Facebook as organic reach drivers because they are saved and shared rather than just liked.

---

## Why Add This

News posts (text + single image) and reels (video) are strong for engagement. But two other formats consistently outperform on organic reach and saves:

1. **Infographics** — "10 facts about X" or "How Y works" as a visually laid-out image. High save rate, Pinterest/Facebook crossover audience.
2. **Explainer carousels / slide videos** — a multi-slide format that walks through a topic step by step. Facebook treats carousel engagement as a strong signal; slide videos (MP4 with text transitions) get pushed by the algorithm as "educational content."

Both formats are orthogonal to breaking news — they are evergreen, reusable across countries, and can be produced in batches.

---

## Content Types in Scope

### Type 1 — Static Infographic (single image)
A single 1080×1920 (or 1080×1080 for feed) image with:
- A headline
- 5–10 data points, facts, or steps laid out visually
- Country-appropriate branding (watermark, colour palette)
- Generated via a template + AI-filled content

**Examples for FR/IT pages:**
- "10 choses que vous ne saviez pas sur la Tour Eiffel"
- "Come funziona il sistema pensionistico italiano"
- "Les 5 plus grandes entreprises françaises"

### Type 2 — Animated Explainer Video (slide-based MP4)
A sequence of 4–8 slides, each displayed for 3–5 seconds with a text reveal animation, combined into a single 30–60s MP4. Similar to a PowerPoint converted to video.

**Structure per slide:**
- Background image (AI-generated or stock)
- Headline text (Anton font, animated fade-in)
- 1–3 bullet points (animated reveal)
- Optional icon/number

**Technical approach:** FFmpeg slide compositor — each slide is an image + text overlay + duration, concatenated into one MP4 with crossfade transitions.

### Type 3 — Data Visualisation Infographic
Charts, maps, timelines rendered as images. Higher effort — requires a chart rendering step (e.g. Chart.js → headless browser screenshot, or a pre-built SVG template).

**Defer to v2.** Start with Types 1 and 2.

---

## Rendering Approaches

### For static infographics (Type 1)

**Option A — fal.ai with a structured prompt**
Generate the entire infographic as an image via fal.ai Recraft V3 (good at diagram/infographic styles). Fast, but limited control over exact layout and data placement.

**Option B — HTML template → Puppeteer screenshot**
Build an HTML/CSS template per infographic style. Inject Claude-generated content. Render with Puppeteer (headless Chrome) to PNG. Gives pixel-perfect layout control.

**Recommendation: Option B for Type 1.** Puppeteer is already used in similar pipelines and produces reliable, branded output. fal.ai generation is too unpredictable for data-heavy layouts.

### For explainer videos (Type 2)

**FFmpeg slide compositor** — the same approach as the documentary renderer, adapted for slide-based content:
1. Claude generates slide content (headline + bullets per slide)
2. Background image per slide: fal.ai or stock
3. Text overlaid via FFmpeg `drawtext` (Anton font, animated)
4. Slides concatenated with crossfade transitions
5. Optional TTS narration (same Kokoro stack as reels)
6. Optional background music

This reuses ~70% of the existing documentary renderer code.

---

## Content Generation Flow

```
Topic / brief
    │
    ▼ Claude (Haiku 4.5)
Generate slide content:
  - Headline per slide
  - 3 bullet points per slide
  - Image prompt per slide
  - Narration text (optional, for TTS)
    │
    ▼ fal.ai (parallel)
Generate background image per slide
    │
    ▼ FFmpeg
Composite each slide (image + text overlay)
    │
    ▼ FFmpeg concat
Join slides with crossfade → output MP4
    │
    ▼ Cloudflare R2
Upload MP4 → public URL
    │
    ▼ Dashboard
Queue for review → post to Facebook
```

---

## Content Sources

Where topics come from:

| Source | Examples |
|---|---|
| Evergreen country topics | Culture, history, food, lifestyle facts about FR/IT |
| Current news article | Turn a news story into an explainer ("What is X and why does it matter?") |
| Scheduled evergreen backlog | Same pattern as historical stories — a curated list of topics |
| Trending questions | "What does the new pension reform actually change?" |

---

## Open Questions (must answer before dev starts)

1. **Static image or video first?** Slide video (Type 2) reuses more existing code (documentary renderer). Static infographic (Type 1) is a new rendering path (Puppeteer). Which delivers more value first?

2. **Where does infographic content appear in the dashboard?** Three options:
   - Extend the existing articles table with a `content_type` column (`news` / `infographic` / `explainer`)
   - New `infographics` table in Supabase, separate dashboard section
   - Treat as a `content_item` in the reels-pipeline schema (since it's video)

3. **Branded templates for Type 1?** Static infographics need a visual identity (colour palette, font hierarchy, icon set). Need design decisions before building the HTML template. Does the existing Anton/gradient/watermark system apply here, or does infographic content need a different aesthetic?

4. **TTS narration on explainer videos?** Adding voiceover makes the video much more engaging but adds 2–3 minutes to render time. Optional by default, or always on?

5. **How often to publish?** News articles go up 2–3×/day. Infographics/explainers are slower to produce — realistically 2–3×/week per page. Does this justify a separate scheduling system?

---

## Reuse from Existing Code

| Existing component | How it reuses |
|---|---|
| `src/renderers/documentary.js` | ~70% reusable for slide-based MP4 rendering |
| `src/renderers/tts.py` | Unchanged — same TTS for narration |
| Whisper subtitles | Unchanged — same caption generation |
| `packages/ai/image-gen/` | Unchanged — same fal.ai call per slide |
| `packages/ai/claude.js` | New prompt template: slide content generation |
| FFmpeg filter graph | Adapted from documentary renderer |
| Supabase Storage | Unchanged — same upload pattern |
| Angular dashboard | New article type filter, new detail view |

---

## Estimated Effort

| Component | Effort |
|---|---|
| Claude slide content prompt template | 1–2h |
| FFmpeg slide compositor (adapt from documentary) | 3–4h |
| fal.ai image per slide (parallel batch) | 1h |
| R2 upload + dashboard integration | 2h |
| Puppeteer infographic renderer (Type 1, if prioritised) | 4–6h |
| HTML/CSS infographic template design | 3–4h |
| **Explainer video MVP (Type 2 only)** | **~8–10h** |
| **Full (Type 1 + 2)** | **~18–24h** |

---

## Next Step

Answer the 5 open questions above, then this becomes a 🔲 Ready to Start task. Start with Type 2 (explainer video) since it reuses the most existing code.
