-- Removes the demo data created by seed_sample_data.sql. Deleting the sample users cascades
-- to their questions (with any answers and reactions on them), answers, upvotes, bookmarks,
-- and notifications. Real accounts and their content are untouched.
delete from public.users where email like '%@demo.example.com';
