# Video Reel Pipeline — Technical Reference

Complete reference for the automated Facebook Reel generation system. Covers architecture, dependencies, configuration, all tuneable parameters, CLI usage, and how to extend it.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Dependencies](#3-dependencies)
4. [File Map](#4-file-map)
5. [Database Schema](#5-database-schema)
6. [Step-by-Step Pipeline](#6-step-by-step-pipeline)
   - 6.1 TTS — Voice-over
   - 6.2 Subtitles — Whisper
   - 6.3 Background Image
   - 6.4 Music Selection
   - 6.5 FFmpeg Composition
7. [Configuration Reference](#7-configuration-reference)
   - 7.1 Voice Mapping
   - 7.2 Music Tracks
   - 7.3 Watermark Logos
   - 7.4 Visual Parameters
   - 7.5 Audio Mix
   - 7.6 Output Encoding
8. [CLI Scripts](#8-cli-scripts)
9. [Environment Variables](#9-environment-variables)
10. [Facebook Publishing](#10-facebook-publishing)
11. [Dashboard — Reel Tab](#11-dashboard--reel-tab)
12. [Tuning Guide](#12-tuning-guide)
13. [Adding a New Country](#13-adding-a-new-country)
14. [Troubleshooting](#14-troubleshooting)
15. [Music Licensing](#15-music-licensing)

---

## 1. Overview

The Reel pipeline takes a fully-captioned article from Supabase and produces a 1080×1920 MP4 video suitable for Facebook Reels. No manual video editing is required. The pipeline runs locally and writes the output file to `output/reels/<article_id>.mp4`.

**What a generated reel contains:**
- AI-generated background image (cinematic, 1080×1920)
- French or Italian voice-over narrated by Kokoro TTS
- Auto-generated burnt-in subtitles (Whisper transcription)
- Headline text overlaid at the top (Anton font, white, fade-in)
- Country-specific watermark logo at the bottom-right
- Royalty-free background music mixed at 15% volume, fading out at the end

**Typical output:** 20–60 seconds, 3–6 MB, H.264/AAC.

---

## 2. Architecture

```
Article in Supabase
  │  (requires: ai_caption, image_prompt or generated_image_url)
  │
  ▼
src/scripts/preview-reel.js   ← local preview, no DB write
src/scripts/generate-reel.js  ← production, writes reel_path + reel_duration to DB
  │
  ▼
src/renderers/reel.js  (Node.js orchestrator)
  │
  ├── Step 1: TTS ──────────────────────────────────────────────────
  │     src/renderers/tts.py  (Python, kokoro_onnx)
  │     → /tmp/reels/<id>/voice.wav
  │
  ├── Step 2: Subtitles ────────────────────────────────────────────
  │     whisper CLI  (OpenAI Whisper, tiny model)
  │     → /tmp/reels/<id>/voice.srt
  │
  ├── Step 3: Background Image ────────────────────────────────────
  │     generated_image_url (re-used, resized 1080×1920)  ← preferred
  │     OR image_prompt → Cloudflare / Google / Pollinations
  │     → /tmp/reels/<id>/bg.png
  │
  ├── Step 4: Music ──────────────────────────────────────────────
  │     assets/music/{breaking|standard|positive}.mp3
  │     Selected by article.criticality
  │
  └── Step 5: FFmpeg Compose ─────────────────────────────────────
        Inputs: bg.png + voice.wav + logo.png + music.mp3
        Output: output/reels/<id>.mp4  (1080×1920, H.264, AAC)
        Work dir cleaned up after render.
```

---

## 3. Dependencies

### System tools (must be on PATH)

| Tool | Version used | Purpose | Install |
|---|---|---|---|
| `ffmpeg` | 4.4.2 | Video composition, encoding | `sudo apt install ffmpeg` |
| `ffprobe` | 4.4.2 | Audio duration measurement | included with ffmpeg |
| `python3` | 3.10.12 | TTS script runner | system |
| `whisper` | OpenAI Whisper | SRT subtitle generation | `pip install openai-whisper` |

### Python packages

| Package | Version | Purpose | Install |
|---|---|---|---|
| `kokoro-onnx` | 0.4.9 | Neural TTS engine | `pip install kokoro-onnx` |
| `soundfile` | 0.13.1 | Write numpy audio array → WAV | `pip install soundfile` |

### Kokoro model files (not installed via pip)

Stored at `/home/jayam/projects/shared/kokoro-tts/`:

| File | Size | Description |
|---|---|---|
| `kokoro-v1.0.onnx` | 311 MB | ONNX acoustic model |
| `voices-v1.0.bin` | 27 MB | Voice embedding bank |

The absolute paths are hardcoded in `src/renderers/tts.py`. If the files move, update `MODEL` and `VOICES` at the top of that file.

### Node.js packages (already in package.json)

`axios`, `sharp` — both used in `reel.js` for image fetching and resizing.

### FFmpeg version note

`zoompan` filter expressions using the `n` variable are **not supported in FFmpeg 4.4.2**. Do not add Ken Burns / zoom effects using `zoompan=z='1+0.0003*n'` — it will silently fail. Upgrade to FFmpeg 6+ first if you need animated zoom.

---

## 4. File Map

```
src/
├── renderers/
│   ├── tts.py              ← Python TTS helper (called via child_process.spawn)
│   └── reel.js             ← Core pipeline: TTS → Subtitles → Image → FFmpeg
├── scripts/
│   ├── generate-reel.js    ← CLI: render + write reel_path/reel_duration to DB
│   └── preview-reel.js     ← CLI: render locally, no DB write
└── services/
    └── facebook.js         ← postVideoToFacebook() export for publish-slot

assets/
└── music/
    ├── breaking.mp3        ← "Investigations" by Kevin MacLeod (93s, CC BY 4.0)
    ├── standard.mp3        ← "Chill Wave" by Kevin MacLeod (240s, CC BY 3.0)
    └── positive.mp3        ← "Upbeat Forever" by Kevin MacLeod (195s, CC BY)

dashboard/public/
├── fonts/
│   └── Anton-Regular.ttf  ← Headline font
└── logos/
    ├── FranceAujourdhui_Logo.png   (500×500px, scaled to 100px in FFmpeg)
    └── vivere_in_italia_banner_logo.png  (1200×1200px, scaled to 100px in FFmpeg)

output/
└── reels/
    └── <article_id>.mp4   ← Final rendered reels (git-ignored)

supabase/migrations/
└── 018_reel_fields.sql    ← Adds reel_path TEXT, reel_duration INTEGER
```

---

## 5. Database Schema

Migration `018_reel_fields.sql` adds two columns to the `articles` table:

```sql
ALTER TABLE articles ADD COLUMN IF NOT EXISTS reel_path TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS reel_duration INTEGER; -- seconds
```

Apply via the Supabase SQL editor (project `nnxtvbolhuvihlpwppbj`).

**Article fields consumed by the reel pipeline:**

| Field | Required | Used for |
|---|---|---|
| `id` | yes | Work dir path, output filename |
| `ai_caption.intro` | yes* | Narration text (first part) |
| `ai_caption.question` | yes* | Narration text (second part) |
| `ai_caption.text` | legacy fallback | Used if intro/question are absent |
| `image_headline` | no | Headline overlay text (falls back to title) |
| `title` | no | Fallback for headline |
| `generated_image_url` | no | Re-used background image (preferred over generating) |
| `image_prompt` | yes** | Generate background image if URL unavailable |
| `criticality` | no | Selects music track (defaults to `standard`) |
| `country` | yes | Selects voice, language, watermark logo |

\* At least one of `intro`/`question` or `text` must be present.
\*\* Required if `generated_image_url` is absent or fails.

**Fields written back by `generate-reel.js`:**

| Field | Value written |
|---|---|
| `reel_path` | Absolute path to the MP4, e.g. `/home/.../output/reels/<id>.mp4` |
| `reel_duration` | Duration in whole seconds |

---

## 6. Step-by-Step Pipeline

### 6.1 TTS — Voice-over

**File:** `src/renderers/tts.py`
**Called by:** `reel.js` via `child_process.spawn('python3', [TTS_SCRIPT, text, voice, wavPath])`

**Narration text construction** (in `reel.js → generateReel()`):
```javascript
const { intro, question, text } = article.ai_caption;
const narration = [intro, question].filter(Boolean).join(' ')
               || (text ?? '').split('\n')[0];
```

The full `intro` paragraph + `question` are joined and narrated. For long articles, this can produce 40–60 second audio.

**Voice mapping:**

| Country | Voice code | Language |
|---|---|---|
| FR | `ff_siwis` | French female |
| IT | `if_sara` | Italian female |
| (fallback) | `ff_siwis` | — |

**Output:** `voice.wav` — mono, 24 000 Hz, PCM 16-bit, duration varies.

**Speed:** Default is `1.0`. Pass a 4th CLI arg to `tts.py` to adjust (e.g. `1.1` for 10% faster).

**TTS script signature:**
```
python3 src/renderers/tts.py "<text>" <voice_code> <output_path.wav> [speed]
```

---

### 6.2 Subtitles — Whisper

**Tool:** `whisper` CLI (OpenAI Whisper)
**Model:** `tiny` (downloads on first use, ~75 MB)

**Whisper CLI call:**
```bash
whisper voice.wav \
  --model tiny \
  --language fr \          # or 'it'
  --output_dir /tmp/reels/<id>/ \
  --output_format srt \
  --word_timestamps True
```

**Output:** `voice.srt` — standard SubRip format, word-level timestamps.

**Language mapping:**

| Country | Whisper lang code |
|---|---|
| FR | `fr` |
| IT | `it` |
| (fallback) | `fr` |

**Note:** The `tiny` model transcribes fast but can mishear proper nouns (especially French names like "Léna Mahfouf" → "l'énemorphofe"). Use `--model small` or `--model medium` for higher accuracy at the cost of speed.

---

### 6.3 Background Image

**Function:** `prepareBgImage(article, workDir)` in `reel.js`

**Priority order:**

1. **`article.generated_image_url`** — download and resize to 1080×1920 (`sharp`, `fit: 'cover'`). Falls through to step 2 on HTTP error.
2. **`article.image_prompt`** → generate via `IMAGE_PROVIDER` env var:
   - `cloudflare` (default) — Cloudflare Workers AI, FLUX.1-schnell, `width:1080, height:1920`
   - `google` — Gemini 2.0 Flash image generation
   - `pollinations` — Pollinations.ai FLUX model

All providers produce an image resized and cropped to exactly **1080×1920** via `sharp`.

**Output:** `bg.png` in the work dir.

**Cloudflare image model:** Override via `CF_IMAGE_MODEL` env var (default: `@cf/black-forest-labs/flux-1-schnell`).

---

### 6.4 Music Selection

Music is selected by `article.criticality`:

| criticality | Track file | Title | Artist | Duration | License |
|---|---|---|---|---|---|
| `breaking` | `breaking.mp3` | Investigations | Kevin MacLeod | 93s | CC BY 4.0 |
| `alert` | `breaking.mp3` | Investigations | Kevin MacLeod | 93s | CC BY 4.0 |
| `trending` | `standard.mp3` | Chill Wave | Kevin MacLeod | 240s | CC BY 3.0 |
| `standard` | `standard.mp3` | Chill Wave | Kevin MacLeod | 240s | CC BY 3.0 |
| (any other) | `standard.mp3` | Chill Wave | Kevin MacLeod | 240s | CC BY 3.0 |

`positive.mp3` ("Upbeat Forever", 195s, CC BY) is present in `assets/music/` but not currently mapped — reserved for future use (e.g. a `positive` criticality tier or lifestyle content).

**All tracks must be at least as long as the longest expected reel.** Current tracks (93s, 195s, 240s) safely cover the typical 20–60s reel length.

---

### 6.5 FFmpeg Composition

**Function:** `compositeReel({...})` in `reel.js`

**Inputs to FFmpeg:**

| Index | Stream | Source |
|---|---|---|
| `[0:v]` | Background video | `bg.png` (looped with `-loop 1`) |
| `[1:a]` | Voice-over | `voice.wav` |
| `[2:v]` | Watermark logo | `dashboard/public/logos/<country>.png` |
| `[3:a]` | Background music | `assets/music/<track>.mp3` |

**Total duration:** `audio_duration + 2s` (2-second tail after voice ends).

**Filter graph (annotated):**

```
[0:v]
  scale=1080:1920:force_original_aspect_ratio=increase,
  crop=1080:1920,
  setsar=1,
  drawtext=fontfile=Anton-Regular.ttf
          :text='<headline>'
          :fontsize=52
          :fontcolor=white
          :x=(w-tw)/2         ← horizontally centred
          :y=90               ← 90px from top
          :borderw=3
          :bordercolor=black@0.85
          :enable='between(t,0.5,<totalDur>)'
          :alpha='if(lt(t,0.5),0,if(lt(t,1),(t-0.5)/0.5,1))'   ← 0.5s fade-in
  subtitles='voice.srt':force_style='FontName=Arial,FontSize=13,
             PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,
             Outline=2,MarginV=80,MarginL=40,MarginR=40'
[vtext];

[2:v]scale=100:-1[logo];      ← scale watermark to 100px wide
[vtext][logo]
  overlay=x=W-w-24:y=H-h-24:format=auto
[vout];

[1:a]volume=1.0[voice];
[3:a]volume=0.15,
     afade=t=in:st=0:d=1,
     afade=t=out:st=<fadeOutAt>:d=2
[music];
[voice][music]amix=inputs=2:duration=first[aout]
```

**FFmpeg encoding flags:**

| Flag | Value | Reason |
|---|---|---|
| `-r` | `30` | 30 fps |
| `-c:v` | `libx264` | H.264 video |
| `-preset` | `fast` | Speed/quality balance |
| `-crf` | `23` | Quality (lower = better, 18–28 typical range) |
| `-c:a` | `aac` | AAC audio |
| `-b:a` | `192k` | Audio bitrate |
| `-movflags` | `+faststart` | moov atom at start — required for streaming |
| `-pix_fmt` | `yuv420p` | Broadest player compatibility |

**Output specification:**

| Property | Value |
|---|---|
| Container | MP4 |
| Resolution | 1080×1920 (9:16) |
| Frame rate | 30 fps |
| Video codec | H.264 (libx264), CRF 23 |
| Audio codec | AAC-LC, 192 kbps, stereo |
| Typical file size | 3–6 MB (20–60s reel) |
| Typical bitrate | 450–700 kbps |

---

## 7. Configuration Reference

### 7.1 Voice Mapping

In `src/renderers/reel.js`:

```javascript
const VOICES = { FR: 'ff_siwis', IT: 'if_sara' };
```

Other available voices in the Kokoro `voices-v1.0.bin` bundle (see Kokoro docs for full list):
- `im_nicola` — Italian male
- `ff_siwis` — French female (current FR)
- `if_sara` — Italian female (current IT)

To change a voice, update the `VOICES` object.

### 7.2 Music Tracks

In `src/renderers/reel.js`:

```javascript
const MUSIC = {
  breaking: join(MUSIC_DIR, 'breaking.mp3'),
  alert:    join(MUSIC_DIR, 'breaking.mp3'),
  trending: join(MUSIC_DIR, 'standard.mp3'),
  standard: join(MUSIC_DIR, 'standard.mp3'),
};
```

To swap a track: replace the `.mp3` file (keep the same filename) or update this mapping.

### 7.3 Watermark Logos

Logos are configured per country in `src/config/sources.js`:

```javascript
FR: { watermarkFile: 'FranceAujourdhui_Logo.png', ... }
IT: { watermarkFile: 'vivere_in_italia_banner_logo.png', ... }
```

Files live in `dashboard/public/logos/`. FFmpeg scales them to **100px wide** in the filter graph regardless of source size. To change the rendered size, update `scale=100:-1` in `compositeReel()`.

### 7.4 Visual Parameters

All in `compositeReel()` in `reel.js`:

| Parameter | Current value | What it controls |
|---|---|---|
| Headline `fontsize` | `52` | Anton font size in pixels |
| Headline `y` | `90` | Distance from top edge in pixels |
| Headline fade-in start | `0.5s` | When headline starts appearing |
| Headline fade-in duration | `0.5s` | How long the fade-in takes |
| Subtitle `FontSize` | `13` | ASS virtual-pixel size (maps to ~85px at 1920px height via default PlayRes 384×288 scaling) |
| Subtitle `MarginV` | `80` | Bottom margin in ASS virtual pixels |
| Subtitle `MarginL` / `MarginR` | `40` each | Horizontal safe zone — prevents edge clipping |
| Subtitle `Outline` | `2` | Black outline width for legibility |
| Watermark size | `100px wide` | `scale=100:-1` in filter graph |
| Watermark position | bottom-right | `x=W-w-24:y=H-h-24` (24px inset from edges) |
| Video tail | `+2s` | Seconds of silence/music after voice ends |

### 7.5 Audio Mix

| Track | Volume | Effect |
|---|---|---|
| Voice-over | `1.0` (100%) | No attenuation |
| Background music | `0.15` (15%) | 1s fade-in at start, 2s fade-out before end |

To adjust music volume, change the `volume=0.15` value in the filter graph. A value of `0.10`–`0.20` is the typical range.

### 7.6 Output Encoding

To increase quality: lower `-crf` (e.g. `18`). File size increases proportionally.
To reduce file size: raise `-crf` (e.g. `28`). Quality decreases.
To change speed/quality trade-off: change `-preset` (`ultrafast`, `superfast`, `veryfast`, `faster`, `fast`, `medium`, `slow`).

---

## 8. CLI Scripts

### Preview (no DB write)

```bash
node src/scripts/preview-reel.js <article_id> [<article_id2> ...]
```

Renders the reel and saves it to `output/reels/<id>.mp4`. Does **not** update Supabase. Use this for testing before committing.

### Generate + save to DB

```bash
node src/scripts/generate-reel.js <article_id> [<article_id2> ...]
```

Same as preview but writes `reel_path` and `reel_duration` back to the article row in Supabase.

### Requirements for an article to be renderable

The article must have:
- `ai_caption` not null (with `intro` + `question`, or legacy `text`)
- Either `generated_image_url` or `image_prompt` populated
- `country` set to a known key (`FR` or `IT`)

### Smoke test sequence

```bash
# 1. Verify Python dependencies
python3 -c "import kokoro_onnx, soundfile; print('deps ok')"

# 2. TTS only (takes ~10s on i7-4770)
python3 src/renderers/tts.py "Bonjour, ceci est un test." ff_siwis /tmp/test_fr.wav
aplay /tmp/test_fr.wav  # or: ffplay /tmp/test_fr.wav

# 3. Whisper only
whisper /tmp/test_fr.wav --model tiny --language fr --output_format srt --output_dir /tmp

# 4. Full reel preview
node src/scripts/preview-reel.js <article_id>
# → output/reels/<article_id>.mp4 should appear

# 5. DB write
node src/scripts/generate-reel.js <article_id>
```

---

## 9. Environment Variables

The reel pipeline uses the same `.env` as the rest of the pipeline. Reel-specific variables:

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `IMAGE_PROVIDER` | no | `cloudflare` | Image generation backend: `cloudflare`, `google`, `pollinations` |
| `CF_ACCOUNT_ID` | if Cloudflare | — | Cloudflare account ID |
| `CF_API_TOKEN` | if Cloudflare | — | Cloudflare API token |
| `CF_IMAGE_MODEL` | no | `@cf/black-forest-labs/flux-1-schnell` | Cloudflare image model |
| `GOOGLE_AI_KEY` | if Google | — | Google AI Studio API key |
| `GOOGLE_IMAGE_MODEL` | no | `gemini-2.0-flash-preview-image-generation` | Google image model |
| `POLLINATIONS_TOKEN` | no | — | Pollinations token (removes rate limits) |
| `POLLINATIONS_MODEL` | no | `flux` | Pollinations model |
| `SUPABASE_URL` | yes | — | Supabase project URL |
| `SUPABASE_KEY` | yes | — | Supabase service key |

---

## 10. Facebook Publishing

When `post_format = 'video'` and `reel_path` is set on an article, `publish-slot.js` routes to the video publisher instead of the normal photo upload.

**Function:** `postVideoToFacebook(videoPath, captionObj, article, country)` in `src/services/facebook.js`

**API endpoint:** `POST https://graph.facebook.com/v22.0/{pageId}/videos`

**Form fields sent:**

| Field | Value |
|---|---|
| `video_source` | Binary MP4 buffer |
| `caption` | `intro + "\n\n" + question + "\n\n" + cta` |
| `description` | `article.title` |
| `access_token` | `FB_ACCESS_TOKEN_<country>` |

**Timeout:** 120 seconds (large file upload).

**To trigger at publish time:**
1. Run `node src/scripts/generate-reel.js <id>` to render and save `reel_path` to DB.
2. In the dashboard, set `post_format = 'video'` on the article.
3. At the next slot window, `publish-slot.js` will use the video path automatically.

---

## 11. Dashboard — Reel Tab

The article detail dialog has a **Reel** tab (tab index 5). It shows:

- Status badge: green "Reel ready ✓" if `reel_path` is set, grey "Not generated" otherwise
- Duration chip: `<reel_duration>s` if available
- Voice info: which voice code will be used for this article's country
- Post format indicator: warns if `post_format` is not `video` (reel won't publish automatically)
- CLI command to copy: `node src/scripts/generate-reel.js <id>`
- Local file path display if `reel_path` is set (note: the dashboard cannot stream the local file — open it directly in a media player)

The `Article` TypeScript interface in `dashboard/src/app/core/supabase.service.ts` includes:
```typescript
reel_path:     string | null;
reel_duration: number | null;
```

---

## 12. Tuning Guide

### Make subtitles smaller / larger

Edit `FontSize` in the `subStyle` string in `compositeReel()`:
```javascript
const subStyle = '...FontSize=13...';
//                          ^^^ change this
```

The value is in ASS virtual-pixel units. With the default libass PlayRes of 384×288, the rendered font at 1920px height is approximately `FontSize × 6.7`. So:
- `FontSize=10` → ~67px rendered
- `FontSize=13` → ~87px rendered (current)
- `FontSize=16` → ~107px rendered
- `FontSize=20` → ~133px rendered (original, too large)

### Fix subtitle text cut off at edges

Increase `MarginL` and `MarginR` in `subStyle`. Current value is `40` each. These also scale by ~2.8× from ASS units to actual pixels (1080 wide), so `MarginL=40` ≈ 112px from the left edge.

### Move headline higher or lower

Change `y=90` in the `drawtextFilter` array. Value is in pixels from the top of the frame.

### Change headline font size

Change `fontsize=52` in the `drawtextFilter`. Value is in pixels.

### Make music louder

Change `volume=0.15` in the filter graph. E.g. `0.25` for 25%.

### Change the 2-second silence tail

Change `const totalDur = audioDur + 2;` in `compositeReel()`. Set to `0` for no tail.

### Use a different Whisper model for better accuracy

In `generateSubtitles()`:
```javascript
'--model', 'tiny',   // change to 'small', 'medium', or 'large'
```

`small` is a good balance: ~240 MB, noticeably better accuracy on French/Italian names, ~3× slower than tiny.

### Slow down or speed up the TTS voice

Pass a `speed` argument to `tts.py`. In `generateTTS()`:
```javascript
await run('python3', [TTS_SCRIPT, text, voice, wavPath, '0.9'], 'tts');
//                                                        ^^^ speed (default 1.0)
```

---

## 13. Adding a New Country

1. Add the country to `src/config/sources.js` with a `watermarkFile` key pointing to a PNG in `dashboard/public/logos/`.

2. Add voice and language mappings in `src/renderers/reel.js`:
   ```javascript
   const VOICES     = { FR: 'ff_siwis', IT: 'if_sara', XX: '<kokoro_voice_code>' };
   const LANG_CODES = { FR: 'fr',       IT: 'it',      XX: '<whisper_lang_code>' };
   ```

3. Check that Kokoro has a voice for the target language (see `voices-v1.0.bin` contents via the kokoro-onnx docs).

4. Add Facebook credentials to `.env` and GitHub Secrets: `FB_PAGE_ID_XX`, `FB_ACCESS_TOKEN_XX`.

No other changes needed — the pipeline iterates `SOURCES` automatically.

---

## 14. Troubleshooting

### `[tts] exited with code 1`

- Check Python path: `which python3`
- Check kokoro_onnx is installed: `pip show kokoro-onnx`
- Check model files exist at the hardcoded paths in `tts.py`
- Check soundfile is installed: `pip show soundfile`
- Run manually: `python3 src/renderers/tts.py "test" ff_siwis /tmp/test.wav`

### `[whisper] exited with code 1`

- Check Whisper is on PATH: `which whisper`
- Verify it works standalone: `whisper /tmp/test.wav --model tiny --language fr --output_format srt --output_dir /tmp`
- The first run downloads the model (~75 MB for `tiny`) — ensure internet access

### `[ffmpeg] exited with code 1`

- Read the full ffmpeg stderr output — it always names the specific filter or argument that failed
- Common causes: subtitle path contains special characters (colons, spaces), logo file missing, music file shorter than reel duration
- Subtitle path escaping: colons in the path must be escaped as `\:` in the filter string (handled automatically by `srtEscaped`)

### `generated_image_url fetch failed`

- Pollinations URLs occasionally return 500. The pipeline auto-falls back to `image_prompt` via Cloudflare.
- If both fail, check `CF_ACCOUNT_ID` and `CF_API_TOKEN` in `.env`.

### Subtitles not appearing in output

- Verify the `.srt` file was created in the work dir: check Whisper's output
- Check that `libass` is compiled into your FFmpeg: `ffmpeg -filters | grep subtitles`
- Verify the SRT path doesn't contain characters that need extra escaping

### Reel not posted to Facebook

- Check `article.post_format === 'video'` in the DB (dashboard Overview tab)
- Check `article.reel_path` is set and the file exists at that path
- Check `FB_PAGE_ID_<country>` and `FB_ACCESS_TOKEN_<country>` are valid
- Facebook video upload timeout is 120s — large files (>50 MB) may fail; typical reels are 3–6 MB

---

## 15. Music Licensing

All three background music tracks are by **Kevin MacLeod** (incompetech.com) and licensed under Creative Commons. Attribution is required.

| File | Title | License | Source |
|---|---|---|---|
| `breaking.mp3` | Investigations | CC BY 4.0 | archive.org |
| `standard.mp3` | Chill Wave | CC BY 3.0 | archive.org |
| `positive.mp3` | Upbeat Forever | CC BY | archive.org |

**Required attribution (CC BY):**
> Music by Kevin MacLeod (incompetech.com) — Licensed under Creative Commons: By Attribution

If you post reels publicly, include this attribution in the video description, post caption, or a pinned comment. The Facebook post caption currently does not include it automatically — this can be added to the `cta` field in the article or appended in `postVideoToFacebook()` if required.
