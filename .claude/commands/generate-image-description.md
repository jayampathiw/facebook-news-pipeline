Generate image descriptions for Facebook articles: produces the raw image_prompt and the formatted_image_prompt in [ORIGINAL PROMPT]/[TEXT OVERLAY]/[OUTPUT] format with the correct country watermark, ready to paste into Midjourney or DALL-E.

Use this when you want to regenerate or generate only the image content for articles that may already have captions.

Steps:
1. If article IDs are provided as arguments ($ARGUMENTS), use those IDs directly and skip to step 3.

2. Otherwise, run this command to list articles without an image prompt:
   node -e "import('dotenv/config').then(() => import('./src/services/supabase.js').then(async m => { const a = await m.getPendingArticles(); const pending = a.filter(x => !x.image_prompt); if (pending.length === 0) { console.log('NO_PENDING'); return; } pending.slice(0,20).forEach((x, i) => console.log((i+1)+'|'+x.id+'|'+x.country+'|'+x.title.slice(0,60))); }))"

   If NO_PENDING, tell the user all articles already have image prompts.
   Otherwise show the list and ask: "Generate image descriptions for which articles? Enter numbers from the list or 'all' (max 20 shown)"

   For "all", collect all IDs. For numbers, extract the IDs at those positions.

3. Run: node src/scripts/generate-image.js <id1> <id2> ...

4. The script will print the full formatted_image_prompt for each article to stdout. Display the complete output — this is what the user copies into Midjourney or DALL-E.

5. Confirm how many image prompts were saved to Supabase.
