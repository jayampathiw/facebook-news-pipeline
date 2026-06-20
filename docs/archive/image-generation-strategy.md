# Image Generation Strategy

*Last updated: 2026-06-03*

---

## Background: Why the Old Approach Was Failing

The original image generation pipeline was built around ultra-realistic documentary photography. Every prompt was prepended with:

```
DSLR photograph, photorealistic, tack sharp, ultra detailed, high resolution, 8K UHD, f/8 maximum clarity, high micro-contrast, crisp edges —
```

And a NEGATIVE_PROMPT actively killed all creative styles:

```
cartoon, anime, illustration, painting, drawing, 3D render, CGI, digital art, watercolor, concept art, unrealistic, fantasy, sketch, vector art, ...
```

The result was beautiful but generic. An empty football stadium, a blank clay tennis court, a server room corridor — technically correct but visually indistinguishable from stock photography and emotionally flat.

For comparison, Grok-generated prompts (the target benchmark) emphasised:
- Named subjects in dramatic action (Vlahovic leaping, Cobolli celebrating)
- Cinematic lighting and dynamic composition
- Strong emotional and physical energy
- Specific technical specifications (lens, aperture, focal length)

---

## The Core Problem: People, Faces, and Legal Risk

The no-people restriction was a **defensive default**, not a legal requirement.

**What the law actually says:**
| Type of use | Risk level |
|---|---|
| Real person's name + fictional face | Low — not identifiable |
| Real person's face, factual reporting | Generally permitted under editorial exception |
| Real person's likeness used to falsely imply endorsement | High — defamation risk |
| Celebrity likeness on a commercial product | High — right of publicity |

**Conclusion:** For illustration/editorial styles with stylised (non-photorealistic) faces, the risk is minimal. The page is framed as news commentary, not commercial promotion, and stylised art has broad editorial protection.

**For now:** Using illustration and 3D rendered styles where faces are present is acceptable. If a specific legal concern arises, it can be revisited.

---

## Style Options Evaluated

### Style A — Comic Book / Pop Art
Bold ink lines, flat colour fills, halftone dots, high contrast. Inspired by Roy Lichtenstein.
- **Verdict:** Very distinctive, but may feel too casual/irreverent for serious news events. Worth testing for sports/entertainment articles.

### Style B — Editorial Painterly Illustration (Primary recommendation)
Loose textured brushwork, restrained muted palette, visible canvas grain, painterly strokes. Inspired by NYT Op-Ed illustration, Le Monde Dimanche, The Economist covers.
- **Strengths:** Authoritative, journalistic credibility, distinctive visual identity, ages well
- **Weaknesses:** Flux Schnell struggles with text elements bleeding in (e.g. "The York Times" appearing on podiums). Requires prompt anchors to be generic (e.g. "high-end editorial illustration style" rather than "New York Times style").
- **Best for:** Politics, economics, elections, serious news

### Style C — 3D Rendered / Soft Realism
Semi-stylised 3D with subsurface skin shading, cinematic lighting, depth of field. Inspired by Bloomberg Businessweek 3D editorial.
- **Strengths:** Modern, premium feel; excellent for objects/vehicles/technology; strong depth of field
- **Weaknesses:** Flux Schnell renders human faces in Pixar/Funko territory — too cartoonish. Needs a higher-quality model (Pollinations flux-pro, 35 steps) to render humans believably.
- **Best for:** Technology, business, product-focused stories; humans only on flux-pro or Midjourney

### Style D — Flat Vector / Minimalist
Clean geometric shapes, limited palette, icon-like. Inspired by Vox and Quartz infographic style.
- **Verdict:** Clean but potentially too sparse for social media scroll-stopping. Not prioritised.

### Current Ultrarealistic (Baseline)
DSLR photograph style with PHOTO_PREFIX + NEGATIVE_PROMPT blocking all creative styles.
- **Verdict:** Safe and technically correct but emotionally flat. Functionally indistinguishable from stock photography.

---

## Recommended Hybrid Approach (Option C)

Apply style per content category rather than one global style:

| Content category | Recommended style | Why |
|---|---|---|
| Politics / elections / leaders | Style B (editorial painterly) | Authority + editorial credibility |
| Crime / justice / social issues | Style B (editorial painterly) | Seriousness, emotional weight |
| Technology / business / products | Style C (3D rendered) | Modern, premium, depth |
| Sports (triumph/celebration) | Style C or Midjourney with people | Energy and dynamism |
| Entertainment / culture | Style A (comic/pop) or B | Versatility |
| Breaking news / crisis | Ultrarealistic photo style | Speed, gravity |

---

## Prompt Engineering Rules (Applies to All Styles)

### 1. Never put text content in the image prompt
Flux cannot render readable text reliably. Text in prompts produces garbled, unreadable letters that look worse than no text at all. Example failures: "Access granned", "looring profiles", "Ai access granded".

**Rule:** Describe what the interface/screen *shows conceptually* but never include literal words. Use Anton overlay step for all text.

Bad:
```
screen shows text bubble saying "Access Granted"
```

Good:
```
screen shows a stylised AI chat interface with two message bubbles — a question and a reply
```

### 2. Never use real publication names as style anchors
Flux interprets "New York Times style" as an instruction to render the masthead. Example failure: "The York Times" appeared on a podium in the Meloni editorial image.

**Rule:** Use generic style descriptors instead.

Bad:
```
in the style of New York Times opinion illustrations
```

Good:
```
in the style of high-end editorial illustration, painterly op-ed art, loose textured brushwork
```

### 3. Reserve upper 40% for headline overlay
Every image must leave the top portion clear for the Anton font headline overlay.

**Rule:** Always append this to every prompt regardless of style:

```
subject in lower 60% of frame, upper 40% reserved as [warm/cool/atmospheric] gradient negative space for headline overlay
```

### 4. 9:16 aspect ratio
All Facebook story/post images are 1080×1920.

---

## Test Results: Round 1 (Cloudflare Flux Schnell, 8 steps)

All generated at 1080×1920. Viewed in `output/style-tests/`.

| File | Subject | Style | Result | Issue |
|---|---|---|---|---|
| `1-meloni-styleB-editorial.png` | Meloni | Editorial B | ❌ Weak | "The York Times" text leaked onto podium |
| `2-meloni-styleC-3d.png` | Meloni | 3D C | ❌ Weak | Pixar princess — too cartoonish |
| `3-macron-styleB-editorial.png` | Macron | Editorial B | ✅ Strong | Recognisable, clean composition, authoritative |
| `4-macron-styleC-3d.png` | Macron | 3D C | ❌ Weak | Pixar/Funko territory |
| `5-spacex-styleB-editorial.png` | SpaceX rocket | Editorial B | ✅ Strong | Beautiful minimalist editorial |
| `6-spacex-styleC-3d.png` | SpaceX rocket | 3D C | ✅ Strong | Bloomberg 3D editorial look |
| `7-meta-hack-styleB-editorial.png` | Meta hack / phone | Editorial B | ❌ Weak | Good concept but text garble in UI |
| `8-meta-hack-styleC-3d.png` | Meta hack / phone | 3D C | ❌ Weak | Clean design but text garble in UI |

**Key finding:** Style B works well for objects + non-human scenes. Style C works for objects but struggles with human faces on Flux Schnell. Text in prompts always garbles.

---

## Round 2 Testing Plan

Re-test the 5 weak images across 4 approaches:

1. **Pollinations flux-pro** (35 steps) — higher quality, better faces
2. **Pollinations flux** (standard) — midpoint comparison
3. **Cloudflare Flux Schnell** (8 steps, baseline) — already have results
4. **Ultrarealistic photoreal** (PHOTO_PREFIX + NEGATIVE_PROMPT, pollinations flux-pro)

Output directory: `output/style-tests/round2/`
Naming convention: `<N>-<subject>-<style>-<model>.png`

**Images to re-test:**
- `1-meloni-styleB-editorial` — with publication name removed from prompt
- `2-meloni-styleC-3d`
- `4-macron-styleC-3d`
- `7-meta-hack-styleB-editorial` — with text content removed from prompt
- `8-meta-hack-styleC-3d` — with text content removed from prompt

---

## Implementation Plan (Once Winner Confirmed)

1. Update `src/scripts/preview-images.js`:
   - Remove `PHOTO_PREFIX` global — make it one of several style functions
   - Move `NEGATIVE_PROMPT` inside the photoreal function only
   - Add `buildEditorialPrompt()` and `build3DPrompt()` functions
   - Add `STYLE` env var to choose per-run (default: `editorial` for politics, `3d` for tech)

2. Update `.claude/commands/generate-post.md`:
   - Replace hard-coded photoreal requirements with category-aware style templates
   - Remove "no people, no faces" restriction (replace with "stylised faces only, no photorealistic likenesses")
   - Add composition rule (lower 60% subject, upper 40% clear)
   - Add text-in-prompt ban

3. Update `supabase/functions/generate-caption/index.ts` (Deno edge function):
   - Mirror the same prompt template changes

---

## Midjourney as Gold Standard

When Pollinations / Cloudflare results are not satisfying, paste the prompt into Midjourney with:

```
--ar 9:16 --stylize 130 --v 6
```

For Style B: `--style raw` reduces the Midjourney aesthetic signature and gets closer to editorial painterly.
For Style C: `--style raw` also helps avoid Pixar oversaturation.

Strip all `--` flags before sending to Cloudflare/Pollinations (they only support their own parameters).
