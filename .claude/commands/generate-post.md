Generate full AI content for Facebook articles using Claude Code in-context (no Anthropic API calls from Node.js).

Can be called with specific IDs: /generate-post <id1> <id2> ...
Without arguments: full editorial brief mode — fetches all pending articles.

---

## Step 1 — Fetch articles

**If article IDs were provided** as $ARGUMENTS (not empty), fetch just those articles:

  node -e "import('dotenv/config').then(() => import('./src/services/supabase.js').then(async m => { const ids = '$ARGUMENTS'.split(' '); const results = await Promise.all(ids.map(id => m.getArticleById(id))); console.log(JSON.stringify(results.filter(Boolean))); }))"

**If no arguments**, fetch all pending articles:

  node -e "import('dotenv/config').then(() => import('./src/services/supabase.js').then(async m => { const a = await m.getPendingArticles(); console.log(JSON.stringify(a)); }))"

If the result is an empty array, stop and tell the user there are no pending articles.

---

## Step 2 — Generate editorial brief (Claude Code in-context — no API call)

Using the article data fetched above, produce the full editorial brief below.
All AI generation happens here in-context. No Node.js scripts are run in this step.

Page names by country: FR = "France Aujourd'hui" · IT = "Italia Oggi"
Watermark files: FR = FranceAujourdhui_Logo_v2.png · IT = ItaliaOggi_Logo.png

---

### ⛔ Violations to Skip First

Scan every article for these rules:

NEVER POST (flag with ⛔):
- Minors (under 18) as victims of violence, sexual crimes, fatal accidents, or abuse
- Religion + law + exclusion framing in combination
- Sexual violence cases with identifiable victims

ORGANIC ONLY — never boost (flag with ⚠️):
- Content mentioning drugs, narcotics, or controlled substances
- Content mentioning weapons or armed civilian violence (not international war reporting)

Also check the `boost_warning` and `blocked_reason` DB fields.

For each violation: **[Title ≤60 chars]** — [Source] ⛔ [One-line reason. Never post.]

If none: *No violations found in this batch.*

---

### Top [N] Ranked — Clean, Safe, Prioritised

Rank all remaining clean articles from 1 downward. Factors:
- `criticality`: breaking=100, alert=75, trending=50, standard=25
- `priority_score` field (0–100)
- Audience resonance for 35+ adults: sports victories, public health, justice/crime, economic impact, political positioning, nostalgia/culture, international crises
- Multi-source coverage lifts rank

Assign priority colour: 🔴 post today · 🟡 post tomorrow · 🟢 post this week

For each article produce this exact block:

---

### [colour] [N]. [HEADLINE IN CAPS — max 80 chars, in article's language]
**[Sources]. [One sentence editorial hook.]**

[2–3 sentence paragraph: story angle, audience relevance, emotion or debate it triggers.]

**Why it's #[N]:**
- [reason 1]
- [reason 2]
- [reason 3 if applicable]

**Regulation risk:** [Zero / Low / Medium] — [one sentence]

**Image headline:** `"[punchy overlay text — max 65 chars, in article's language]"`

**Formatted Image Prompt** *(copy directly into Midjourney / DALL-E)*:
```
[ORIGINAL PROMPT]
[Write the full ultra-realistic cinematic photograph description here.
Requirements: no people, no faces, no identifiable individuals, no flags with readable text, no brand logos, no text in scene.
Include: specific camera + model, lens focal length, aperture, named light source, colour grading note.
Style: photojournalism / documentary realism / atmospheric editorial.
End with: no people, no text, no logos, photorealistic.]

[TEXT OVERLAY]
Content: "[exact image headline from above]"
Position: upper
Opacity: 80%

[OUTPUT]
No people, no text, no logos visible.
Add a subtle gradient overlay beneath the text for legibility.
Overlay the text above in large white Anton font at the upper position, semi-transparent at 80% opacity, integrated with [key lighting element from the original prompt — e.g. "the warm golden hour light", "the cold fluorescent corridor lighting"].
Add [FranceAujourdhui_Logo_v2.png for FR / ItaliaOggi_Logo.png for IT] watermark, bottom-right, small, 70% opacity.
```

**Facebook SEO Post:**
```
[emoji] [STRONG OPENING in article's language]

[Paragraph 1: lead fact — specific, with numbers/names/dates from the article. Max 25 words per sentence.]

[Paragraph 2: context, cause, or consequence.]

[Optional → bullet points if multiple key data points]

[Paragraph 3: emotional hook or surprising angle]

🗣️ [Specific, debatable question in article's language]

📰 Sources : [source1] · [source2]
👉 Suivez [page name] pour l'actualité [française / italiana] sans filtre — chaque jour.

#[5–6 CamelCase hashtags in article's language]
```

---

### Posting Schedule

| Slot | Story | Priority | Boost? |
|---|---|---|---|
| Now | [headline ≤40 chars] | 🔴 | ✅ Yes |
| +2h | ... | ... | ... |

Min 2 hours between posts. Recommend boosting 🔴 and 🟡. Organic only for ⚠️ or 🟢.

End with one sentence: which article to post first and why.

---

## Step 3 — Save to database (no Anthropic API call)

For each article the user wants to save, generate the structured JSON fields in-context
(using the content from Step 2 above), write a temp file, and run the save script.

First ask: "Save to database for which articles? [all] [FR] [IT] [numbers e.g. 1 3 5] [skip]"

For each article to save:

**3a. Generate the structured fields in-context** (take from the brief already generated above):

```json
{
  "id": "<article id from DB>",
  "country": "<FR or IT>",
  "ai_caption": {
    "intro": "<3-4 sentence intro from the Facebook post above>",
    "question": "<the 🗣️ question from above, without the emoji>",
    "cta": "<the 👉 CTA line from above, without the emoji>",
    "image_headline": "<the image headline from above>"
  },
  "seo_title": "<generate a SEO title ≤60 chars, keyword-first, in article's language>",
  "seo_description": "<generate a SEO description ≤160 chars with CTA, in article's language>",
  "image_prompt": "<the raw image description from the [ORIGINAL PROMPT] section above>"
}
```

**3b. Write the JSON to a temp file** using the Write tool:
  Path: /tmp/article-save-<article-id>.json

**3c. Run the save script** (pure DB write — no Anthropic API call):
  node src/scripts/save-article-content.js /tmp/article-save-<article-id>.json

Report: ✓ Saved or ✗ Error for each article.

**If the user selected "all" or a country**, loop through each clean article from the ranked list,
generating and saving them one by one using steps 3a–3c.
