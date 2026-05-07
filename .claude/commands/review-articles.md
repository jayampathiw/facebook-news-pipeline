Review pending articles from Supabase and approve or reject them.

Steps:
1. Query Supabase for articles where status='pending', ordered by priority_score desc, limit 10
2. For each article display:
   - Country flag + country code
   - Title and source
   - Priority score
   - ai_caption (intro, question, cta)
   - Original URL
3. Ask the user which articles to approve or reject
4. For approved articles: update status to 'approved' in Supabase
5. For rejected articles: update status to 'rejected' in Supabase
6. Confirm how many were approved and rejected

Use the Supabase service at src/services/supabase.js.
Require a .env file with SUPABASE_URL and SUPABASE_KEY.
