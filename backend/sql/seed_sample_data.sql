-- Sample data for demos and local development.
--
-- Creates fictional members and experts (all @demo.example.com) plus questions, answers,
-- upvotes, and bookmarks between them. The sample people are profile-only rows with no
-- Supabase Auth login, so nobody can sign in as them. Timestamps are relative to now().
--
-- Apply with `npm run db:seed`. Re-running replaces the sample data. Remove it with
-- `npm run db:seed:remove`: deleting the sample users cascades to everything they created.

begin;

delete from public.users where email like '%@demo.example.com';

-- Deterministic IDs, so re-running produces the same sample users.
create or replace function pg_temp.sample_user(key text)
returns uuid
language sql
immutable
as $$ select md5('playbook-sample-' || key)::uuid $$;

insert into public.users
  (id, email, name, "isAdmin", title, expertise, bio, rating, "responseTime", points, "createdAt", "updatedAt")
values
  (pg_temp.sample_user('rachel'), 'rachel@demo.example.com', 'Rachel Morgan', true, 'VP of Sales',
   array['Enterprise Sales', 'Sales Leadership', 'Forecasting'],
   'Built and scaled three enterprise sales teams from first hire to $50M ARR. Focused on pipeline discipline and developing first-time managers.',
   4.9, '< 4 hours', 4200, now() - interval '120 days', now() - interval '120 days'),
  (pg_temp.sample_user('kevin'), 'kevin@demo.example.com', 'Kevin Tran', true, 'Director of Sales Enablement',
   array['Coaching', 'Discovery', 'Objection Handling'],
   'Former top-performing AE turned enablement leader. Designs onboarding and coaching programs that shorten ramp time.',
   4.8, '< 12 hours', 3100, now() - interval '110 days', now() - interval '110 days'),
  (pg_temp.sample_user('aisha'), 'aisha@demo.example.com', 'Aisha Patel', true, 'Head of Revenue Talent',
   array['Recruiting', 'Interviewing', 'Onboarding'],
   'Has hired more than 300 sellers across SDR, AE, and leadership roles. Helps teams build repeatable, fair hiring processes.',
   4.7, '< 24 hours', 2600, now() - interval '100 days', now() - interval '100 days'),
  (pg_temp.sample_user('maya'), 'maya@demo.example.com', 'Maya Chen', false, null, null, null, null, null, 340, now() - interval '60 days', now() - interval '60 days'),
  (pg_temp.sample_user('daniel'), 'daniel@demo.example.com', 'Daniel Okafor', false, null, null, null, null, null, 210, now() - interval '55 days', now() - interval '55 days'),
  (pg_temp.sample_user('priya'), 'priya@demo.example.com', 'Priya Raman', false, null, null, null, null, null, 180, now() - interval '50 days', now() - interval '50 days'),
  (pg_temp.sample_user('marcus'), 'marcus@demo.example.com', 'Marcus Webb', false, null, null, null, null, null, 260, now() - interval '48 days', now() - interval '48 days'),
  (pg_temp.sample_user('elena'), 'elena@demo.example.com', 'Elena Petrova', false, null, null, null, null, null, 390, now() - interval '45 days', now() - interval '45 days'),
  (pg_temp.sample_user('jordan'), 'jordan@demo.example.com', 'Jordan Brooks', false, null, null, null, null, null, 90, now() - interval '30 days', now() - interval '30 days'),
  (pg_temp.sample_user('sofia'), 'sofia@demo.example.com', 'Sofia Alvarez', false, null, null, null, null, null, 150, now() - interval '28 days', now() - interval '28 days'),
  (pg_temp.sample_user('tom'), 'tom@demo.example.com', 'Tom Nguyen', false, null, null, null, null, null, 120, now() - interval '25 days', now() - interval '25 days');

-- Adds a question, then upvotes and bookmarks from other sample users. Returns its id.
create or replace function pg_temp.add_question(
  p_author text,
  p_text text,
  p_description text,
  p_role text,
  p_tags text[],
  p_days_ago int,
  p_views int,
  p_upvotes int,
  p_bookmarks int,
  p_assigned_to text default null,
  p_priority public.priority default 'LOW'
)
returns int
language plpgsql
as $$
declare
  question_id int;
  created timestamptz := now() - make_interval(days => p_days_ago, hours => 2);
begin
  insert into public.questions
    (text, description, role, tags, views, priority, "authorId", "assignedToId", "createdAt", "updatedAt")
  values
    (p_text, p_description, p_role, p_tags, p_views, p_priority, pg_temp.sample_user(p_author),
     case when p_assigned_to is not null then pg_temp.sample_user(p_assigned_to) end, created, created)
  returning id into question_id;

  insert into public.question_upvotes ("userId", "questionId", "createdAt")
  select u.id, question_id, created + interval '1 hour'
  from public.users u
  where u.email like '%@demo.example.com' and u.id <> pg_temp.sample_user(p_author)
  order by md5(u.id::text || question_id)
  limit p_upvotes;

  insert into public.question_bookmarks ("userId", "questionId", "createdAt")
  select u.id, question_id, created + interval '2 hours'
  from public.users u
  where u.email like '%@demo.example.com' and u.id <> pg_temp.sample_user(p_author)
  order by md5(question_id || u.id::text)
  limit p_bookmarks;

  return question_id;
end;
$$;

-- Adds an expert answer some hours after the question and marks the question answered.
create or replace function pg_temp.add_answer(p_question_id int, p_expert text, p_content text, p_hours_after int)
returns void
language plpgsql
as $$
declare
  answered timestamptz;
begin
  select "createdAt" + make_interval(hours => p_hours_after) into answered
  from public.questions where id = p_question_id;

  insert into public.answers (content, "authorId", "questionId", "createdAt", "updatedAt")
  values (p_content, pg_temp.sample_user(p_expert), p_question_id, answered, answered);

  update public.questions
  set status = 'ANSWERED', "updatedAt" = greatest("updatedAt", answered)
  where id = p_question_id;
end;
$$;

do $$
declare
  q int;
begin
  q := pg_temp.add_question('maya',
    'How do you handle the "we''re happy with our current vendor" objection?',
    'My team hears this on almost every discovery call in our mid-market segment. Reps either fold immediately or get pushy. What''s a better way to respond?',
    'Sales Manager', array['Objections', 'Sales'], 3, 214, 9, 2);
  perform pg_temp.add_answer(q, 'rachel',
    'Treat it as a status-quo objection, not a rejection. Agree and get curious: "That makes sense. What made you choose them?" Then ask what they''d improve if they could change one thing. Most buyers have at least one frustration they''ve learned to live with. The goal on that call isn''t to replace the vendor; it''s to earn a second conversation about that one gap. Coach reps to stop pitching until the buyer names a problem in their own words.',
    5);

  q := pg_temp.add_question('daniel',
    'What''s the most predictive interview question for SDR hires?',
    'We''ve had 40% turnover on our SDR team this year. I want to screen better for resilience and coachability.',
    'Sales Director', array['Recruiting'], 6, 187, 7, 3);
  perform pg_temp.add_answer(q, 'aisha',
    'Skip the hypotheticals and test coachability live. Run a short role-play, give one specific piece of feedback, then run it again. Candidates who visibly apply the feedback in round two tend to ramp fastest. Pair that with a behavioral question like "Tell me about a goal you missed and what you changed afterwards"; you''re listening for ownership, not excuses. Also check when people leave: if most exits happen in months three to five, the problem may be onboarding rather than hiring.',
    20);

  q := pg_temp.add_question('priya',
    'What does an effective daily routine look like for a first-time sales manager?',
    'I was promoted from AE two months ago and my days disappear into Slack and fire drills. How do experienced managers structure their day?',
    'Sales Manager', array['Daily Routines', 'Leadership'], 1, 96, 6, 4);
  perform pg_temp.add_answer(q, 'rachel',
    'Protect two blocks every day: a morning block for pipeline review before the team starts calling, and an afternoon block for coaching, such as call reviews or joining live calls. Everything else fits around those. Check Slack at set times instead of living in it. The biggest shift from AE to manager is that your output is now your team''s output. If a task doesn''t make a rep better or unblock a deal, question whether it needs you.',
    4);
  perform pg_temp.add_answer(q, 'kevin',
    'One addition: end each day by writing down the single most important coaching conversation for tomorrow. New managers default to reacting. Deciding the night before who needs you most keeps coaching from getting crowded out.',
    9);

  q := pg_temp.add_question('marcus',
    'How do I manage a top performer who ignores the process?',
    'My top rep crushes quota but refuses to update the CRM, which turns forecasting into guesswork and frustrates the rest of the team.',
    'Regional Sales Lead', array['Team Management'], 9, 342, 10, 3);
  perform pg_temp.add_answer(q, 'kevin',
    'Make it about outcomes they care about, not compliance. Top performers respond to "this helps you win" far more than "this is the rule." Show how clean CRM data gets them better leads, faster deal approvals, or a bigger territory. Then set one clear, non-negotiable expectation, such as next steps updated within 24 hours of every call, and hold them to it the same way you would anyone else. The rest of the team is watching how you handle this.',
    26);

  q := pg_temp.add_question('elena',
    'How can I get reps to stop discounting so early?',
    'Deals are closing, but with 20-30% discounts we don''t need to give. Reps offer them before the buyer even asks.',
    'VP of Sales', array['Sales', 'Skills'], 12, 268, 8, 2);
  perform pg_temp.add_answer(q, 'rachel',
    'Early discounting is usually a confidence problem that looks like a pricing problem. Before any discount conversation, require reps to confirm three things: the buyer agrees the solution solves their problem, the decision maker is involved, and there''s a clear close date. Then make every discount a trade: never give a concession without getting something back, like a longer term, a case study, or a faster signature. Track discount rate per rep; what gets measured tends to improve.',
    30);

  q := pg_temp.add_question('jordan',
    'A buyer says "just send me some information." How do I keep the conversation going?',
    null,
    'Account Executive', array['Objections'], 2, 58, 4, 1);

  q := pg_temp.add_question('sofia',
    'Should I hire for industry experience or sales skill?',
    'I''m hiring two AEs for a technical product. Candidates either know the industry or know how to sell, rarely both.',
    'Head of Sales', array['Recruiting', 'Team Management'], 15, 155, 5, 2);
  perform pg_temp.add_answer(q, 'aisha',
    'For most roles, hire for selling skill and curiosity, then teach the industry. Product knowledge takes a few months to learn; discovery, deal control, and resilience take years. The exception is when buyers are deeply technical and expect a peer. Then one industry expert on the team can be a force multiplier. A good compromise is to hire strong sellers and pair each with a sales engineer or internal expert for their first quarter.',
    16);

  q := pg_temp.add_question('tom',
    'How do you keep morale up after the team misses its quarterly target?',
    'We missed by 18% and the team is deflated heading into the next quarter.',
    'Sales Manager', array['Leadership'], 4, 121, 6, 1, 'rachel', 'MEDIUM');

  q := pg_temp.add_question('maya',
    'What''s a good framework for running discovery calls?',
    'Our reps jump into demos too fast. I''d like a simple structure they can actually remember.',
    'Sales Manager', array['Skills', 'Sales'], 20, 403, 9, 5);
  perform pg_temp.add_answer(q, 'kevin',
    'Keep it to four stages: situation, problem, impact, and decision. Start with the buyer''s current situation, dig until they describe a specific problem, then quantify its impact in time, money, or risk. Finally, confirm how they make decisions and who''s involved. A useful rule: no demo until the buyer has said the impact out loud. Give reps two or three go-to questions for each stage rather than a long script.',
    7);

  q := pg_temp.add_question('daniel',
    'How much time should AEs spend prospecting versus working deals?',
    'We don''t have enough SDRs, so our AEs have to source much of their own pipeline.',
    'Sales Director', array['Daily Routines'], 8, 77, 3, 0);

  q := pg_temp.add_question('priya',
    'How do you run a weekly pipeline review that isn''t just a status meeting?',
    null,
    'Sales Manager', array['Team Management', 'Leadership'], 11, 189, 7, 3);
  perform pg_temp.add_answer(q, 'rachel',
    'Only review deals that changed or are at risk, not every opportunity. For each one, ask three questions: what''s the next step and when, who is the decision maker and have we met them, and what could kill this deal? Keep it under 45 minutes and end with one concrete action per deal. If reps leave with less clarity than they came in with, it turned into a status update.',
    18);

  q := pg_temp.add_question('marcus',
    'How do I coach reps to handle pricing objections on renewals?',
    'Customers are pushing back on a 7% increase at renewal, and reps give in to keep the account.',
    'Regional Sales Lead', array['Objections', 'Skills'], 5, 64, 3, 1, 'kevin', 'MEDIUM');

  q := pg_temp.add_question('elena',
    'How long should ramp time be for a new enterprise AE?',
    null,
    'VP of Sales', array['Recruiting'], 25, 211, 5, 2);
  perform pg_temp.add_answer(q, 'aisha',
    'For enterprise, plan on six to nine months to full productivity, depending on sales cycle length. A rule of thumb is one to one-and-a-half times your average sales cycle. Set milestones along the way, such as a first qualified opportunity by week six and a first late-stage deal by month four, so you can spot a struggling hire early instead of waiting for quota results.',
    40);

  q := pg_temp.add_question('tom',
    'How do I give tough feedback to someone who used to be my peer?',
    'I was promoted over two teammates and one of them is struggling. It feels awkward to bring it up.',
    'Sales Manager', array['Leadership', 'Team Management'], 7, 133, 8, 2);
  perform pg_temp.add_answer(q, 'kevin',
    'Acknowledge the change directly, once: "This is new for both of us, and I want to be straightforward with you because I respect you." After that, keep feedback specific and about behavior, not character: what happened, why it matters, and what good looks like. Doing it privately and promptly matters more than perfect wording. Former peers usually respect a manager who is direct far more than one who avoids the conversation.',
    12);

  q := pg_temp.add_question('sofia',
    'Is cold calling still worth it for B2B sales?',
    'Half my team swears by it and half thinks it''s dead. Connect rates are down, but the meetings we do book tend to be good.',
    'Head of Sales', array['Sales'], 3, 298, 10, 4);

  q := pg_temp.add_question('jordan',
    'What''s the best way to prepare for a call when I only have 10 minutes?',
    null,
    'Account Executive', array['Daily Routines', 'Skills'], 1, 41, 2, 1);

  q := pg_temp.add_question('marcus',
    'How do you handle a rep who is consistently late on follow-ups?',
    'Deals are slipping because follow-up emails go out days after calls. We''ve talked about it twice.',
    'Regional Sales Lead', array['Team Management'], 14, 88, 4, 0);

  q := pg_temp.add_question('elena',
    'What metrics should a sales manager track every week?',
    null,
    'VP of Sales', array['Leadership'], 18, 176, 6, 3, 'rachel', 'MEDIUM');
  perform pg_temp.add_answer(q, 'rachel',
    'Track a mix of leading and lagging indicators. Leading: new pipeline created, meetings booked, and stage conversion rates, which tell you what next quarter looks like. Lagging: bookings against target, win rate, and average deal size. Add one quality metric, such as the share of opportunities with a confirmed decision maker. Look at trends over four to six weeks instead of reacting to a single week.',
    6);
end;
$$;

commit;
