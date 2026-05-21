import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { article_id } = await req.json();
    if (!article_id) return json({ error: 'article_id required' }, 400);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: article, error: fetchErr } = await supabase
      .from('articles')
      .select('id, image_prompt, country')
      .eq('id', article_id)
      .single();

    if (fetchErr || !article) return json({ error: 'Article not found' }, 404);
    if (!article.image_prompt) return json({ error: 'No image_prompt — generate caption first' }, 400);

    // Build the Pollinations URL — no API key needed, image served via CDN.
    // The seed combines article ID hash + current time so each regeneration is unique.
    const idHash = article_id.replace(/-/g, '').slice(0, 8);
    const seed = (parseInt(idHash, 16) ^ Date.now()) % 999983;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(article.image_prompt)}?width=1080&height=1080&model=flux&nologo=true&seed=${seed}`;

    // The browser <img> will load directly from Pollinations — no prefetch needed here.

    const { error: updateErr } = await supabase
      .from('articles')
      .update({ generated_image_url: imageUrl })
      .eq('id', article_id);

    if (updateErr) throw new Error(`DB update failed: ${updateErr.message}`);

    return json({ url: imageUrl });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500);
  }
});
