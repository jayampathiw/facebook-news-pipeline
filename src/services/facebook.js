import axios from 'axios';

const FB_BASE = 'https://graph.facebook.com/v22.0';

export async function postToFacebook(article, captionObj, country) {
  const pageId = process.env[`FB_PAGE_ID_${country}`];
  const token  = process.env[`FB_ACCESS_TOKEN_${country}`];

  if (!pageId || !token) {
    throw new Error(`Missing Facebook credentials for country: ${country}`);
  }

  const { intro, question, cta } = captionObj;
  const parts = [intro, question, cta].filter(Boolean);
  const message = parts.join('\n\n');

  const response = await axios.post(`${FB_BASE}/${pageId}/feed`, {
    message,
    link: article.original_url,
    access_token: token,
  });

  return response.data.id;
}

export async function deletePost(postId, country) {
  const token = process.env[`FB_ACCESS_TOKEN_${country}`];
  if (!token) throw new Error(`Missing Facebook token for country: ${country}`);

  await axios.delete(`${FB_BASE}/${postId}`, {
    params: { access_token: token },
  });
}
