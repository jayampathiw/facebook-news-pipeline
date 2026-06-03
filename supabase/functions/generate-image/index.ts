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

    // Generate image via Cloudflare Flux 1 Schnell (returns base64 JSON, no expiry)
    const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${Deno.env.get('CF_ACCOUNT_ID')}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
    const cfRes = await fetch(cfUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('CF_API_TOKEN')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: article.image_prompt, num_steps: 8, width: 1080, height: 1920 }),
    });

    if (!cfRes.ok) {
      const err = await cfRes.json().catch(() => ({}));
      throw new Error(`Cloudflare error ${cfRes.status}: ${JSON.stringify(err)}`);
    }

    const cfData = await cfRes.json();
    const base64Image: string = cfData.result?.image;
    if (!base64Image) throw new Error('No image in Cloudflare response');

    // Decode base64 → bytes
    const imageBytes = Uint8Array.from(atob(base64Image), (c) => c.charCodeAt(0));

    // Upload to Supabase Storage (upsert so regeneration overwrites the old file)
    const storagePath = `${article_id}.png`;
    const { error: uploadErr } = await supabase.storage
      .from('article-images')
      .upload(storagePath, imageBytes, { contentType: 'image/png', upsert: true });

    if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`);

    // Permanent public URL — never expires
    const imageUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/article-images/${storagePath}`;

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
