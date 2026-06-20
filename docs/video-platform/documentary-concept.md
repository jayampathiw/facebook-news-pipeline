# Documentary-Style Video Concept — Discussion Notes

**Date:** 2026-05-24
**Status:** Pre-production — concept agreed, 3 open decisions before scripting begins

---

## What We Discovered

Two posts on the FR/IT pages got outsized engagement by tapping into national pride:

| Page | Post hook | Response |
|---|---|---|
| Vivere in Italia | "SE AMI L'ITALIA, premi il pulsante Segui" | Huge comment thread — emotional patriotic responses |
| France Aujourd'hui | "SI VOUS AIMEZ LA FRANCE, appuyez sur le bouton Suivre" | 152+ likes |

The Italy comments were deeply emotional — *"Viva la nostra Italia"*, *"non c'è terra più bella della mia patria"*, *"siamo orgogliosi di appartenere a questa splendida nazione"*. This is the emotion the video must trigger.

**Reference video to replicate:** Géomythe's France reel
> "Between luxury, culture, history, technology and football, France radiates its elegance and global influence for centuries." #France #Elegance #Culture #Luxury #Influence 🇫🇷🔥

That reel covered: inventions, vehicle brands, sports stars, popular achievers, cultural icons — all set to a touching audio track. Our video follows the same formula.

---

## The Formula

```
National achievements montage
  + emotional/proud narration (not news anchor — love letter tone)
  + cinematic music build
  + "Se ami l'Italia / Si vous aimez la France" CTA at the end
= high engagement, shares, follows
```

---

## Agreed Decisions

| Decision | Choice |
|---|---|
| Format | Vertical 9:16 (Facebook Reel) — same as current news reels |
| Tone | Proud and emotional — not neutral. Like a love letter to the country |
| Duration | Under 3 minutes |
| Starting country | Italy first, then France |
| Script source | Claude generates full script → user approves → then produce |
| Frequency | Test first with one video, decide on series after seeing results |
| Language | Italian (IT video), French (FR video) |

---

## Italy Video Concept

**Working title:** *"L'Italia che ha conquistato il mondo"*
(The Italy that conquered the world)

**Proposed 6-scene structure (~25 seconds per scene = ~2.5 minutes):**

| # | Scene | Topic | Visual style |
|---|---|---|---|
| 1 | Opening hook | Italy's global recognition and presence | Aerial Rome / Colosseum at golden hour |
| 2 | Art & Architecture | da Vinci, Michelangelo, the Vatican, Roman monuments | Renaissance painting aesthetic |
| 3 | Fashion & Design | Gucci, Ferrari, Armani, Lamborghini | Luxury aesthetic, red Ferrari on Italian road |
| 4 | Food | Pizza, pasta, espresso — Italian food conquered the world | Cinematic food photography style |
| 5 | Sports | Calcio (Azzurri), Formula 1, Italian champions | Stadium, trophy, victory celebration |
| 6 | Closing | Emotional pride + Follow CTA | Italian flag, sweeping landscape |

**Narration opening line idea:**
*"Pochi paesi al mondo hanno lasciato un segno così profondo nell'umanità…"*
(Few countries in the world have left such a deep mark on humanity…)

---

## 3 Open Decisions — Need Answers Before Scripting

### Decision 1: Specific names to include

Which famous Italians and Italian achievements should the script specifically name?

Candidates to choose from (Claude picks the strongest if no preference):
- **Historical figures:** Galileo Galilei, Leonardo da Vinci, Dante Alighieri, Marco Polo, Christopher Columbus
- **Art:** Michelangelo, Raphael, Botticelli, Caravaggio
- **Science/invention:** Guglielmo Marconi (radio), Alessandro Volta (battery), Antonio Meucci (telephone)
- **Fashion:** Giorgio Armani, Gianni Versace, Guccio Gucci, Salvatore Ferragamo
- **Automotive:** Enzo Ferrari, Ferruccio Lamborghini, Maserati
- **Sports:** Roberto Baggio, Francesco Totti, Valentino Rossi, Azzurri 2006 World Cup
- **Food:** Pizza napoletana, pasta, espresso, gelato — conquered the world
- **Cinema:** Federico Fellini, Sophia Loren, Sergio Leone

→ **Action needed:** Confirm which categories and names to include, or let Claude choose.

---

### Decision 2: Music style

The current news music (Kevin MacLeod "Chill Wave", "Investigations") is too neutral for this format. This video needs something that builds emotionally.

Options:
- **A. Orchestral / triumphant** — full strings, rising build, cinematic epic feel (think film score)
- **B. Emotional piano** — soft start, builds to emotional climax, more intimate
- **C. Opera-inspired** — something that evokes Italian culture directly (bold choice)
- **D. Modern cinematic** — like Hans Zimmer style, starts quiet builds to powerful

All options available as Kevin MacLeod CC BY tracks (free, no licensing issues).

→ **Action needed:** Choose A, B, C, or D (or describe another style).

---

### Decision 3: Closing CTA

What exact words end the video?

Options:
- **A. Narrated only:** Voice-over says *"Se ami l'Italia, segui questa pagina — per te, ogni giorno, la nostra storia."*
- **B. Text overlay only:** End card with "SE AMI L'ITALIA 🇮🇹" + "Segui Vivere in Italia" in large Anton font
- **C. Both:** Narrator says it while text appears on screen simultaneously
- **D. Custom:** Different wording entirely

→ **Action needed:** Choose A, B, C, or D (or provide custom text).

---

## Technical Plan (Already Decided)

Once scripting is approved, the build requires:

1. **New multi-scene renderer** — unlike news reels (1 image), documentaries use one image per scene, concatenated with FFmpeg crossfades
2. **New music tracks** — download appropriate CC BY Kevin MacLeod tracks from archive.org
3. **Same TTS stack** — Kokoro `if_sara` for Italian, `ff_siwis` for French
4. **Same Whisper subtitle stack** — auto-generated from voice audio
5. **New DB fields** — `documentary_script` (JSON with scenes), `documentary_path`, `documentary_duration`
6. **New CLI scripts** — `preview-documentary.js`, `generate-documentary.js`
7. **Dashboard tab** — Documentary tab alongside the existing Reel tab

**Key technical note:** Ken Burns zoom/pan effect (slow zoom into images) requires FFmpeg 6+. Current system has FFmpeg 4.4.2. If we want animated scenes instead of static cuts, upgrading FFmpeg first would unlock this. Decision to make when we get to implementation.

---

## France Video (After Italy)

Same formula, localised:

**Working title:** *"La France qui a changé le monde"*

**Scene structure (proposed):**
1. Opening — France's global cultural reach
2. Art & Philosophy — Louvre, Impressionism, Sartre, Hugo, Voltaire
3. Luxury & Fashion — Chanel, Louis Vuitton, Dior, Hermès, haute couture
4. Gastronomy — French cuisine, wine, Michelin, croissant, champagne
5. Science & Innovation — Pasteur, Curie, Renault, Citroën, aviation
6. Sports & Cinema — Zidane, Tour de France, Cannes, French New Wave
7. Closing — "Si vous aimez la France, suivez cette page"

---

## Tomorrow's Session Plan

1. Provide answers to the 3 open decisions above
2. Claude drafts the full Italian script (scene-by-scene narration text + image prompt per scene)
3. Review and approve the script
4. Download appropriate music track
5. Build the multi-scene renderer
6. Render the first test video
