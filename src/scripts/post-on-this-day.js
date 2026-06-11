/**
 * Post an "On This Day" multi-photo post to Facebook.
 * Usage:  node src/scripts/post-on-this-day.js <post-id>
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { postMultiPhotoToFacebook } from '../services/facebook.js';

const postId = process.argv[2];
if (!postId) {
  console.error('Usage: node src/scripts/post-on-this-day.js <post-id>');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function run() {
  const { data: post, error } = await supabase
    .from('on_this_day_posts')
    .select('*')
    .eq('id', postId)
    .single();

  if (error || !post) {
    console.error(`Post not found: ${postId}`);
    process.exit(1);
  }

  if (post.status === 'posted') {
    console.error(`Already posted (fb_post_id: ${post.fb_post_id})`);
    process.exit(1);
  }

  const imageUrls = (post.events || []).map(e => e.image_url).filter(Boolean);
  if (!imageUrls.length) {
    console.error('No images available — re-run queue-on-this-day.js to regenerate images');
    process.exit(1);
  }

  console.log(`[${post.country}] Posting "${post.title}" with ${imageUrls.length} images…`);

  const fbPostId = await postMultiPhotoToFacebook(imageUrls, post.ai_caption, post.country);

  await supabase.from('on_this_day_posts').update({
    status: 'posted',
    fb_post_id: fbPostId,
    posted_at: new Date().toISOString(),
  }).eq('id', postId);

  console.log(`✓ Posted! fb_post_id: ${fbPostId}`);
}

run().catch(err => { console.error('FAILED:', err.message); process.exit(1); });
