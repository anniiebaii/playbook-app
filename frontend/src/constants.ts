/** Topics a question can be tagged with. */
export const QUESTION_TAGS = [
  'Objections',
  'Recruiting',
  'Daily Routines',
  'Team Management',
  'Sales',
  'Skills',
  'Leadership',
] as const;

/** Number of tags shown in the topic filter before the user expands it. */
export const FEATURED_TAG_COUNT = 3;

/** Questions with more upvotes than this get a "HOT" badge. */
export const HOT_QUESTION_UPVOTE_THRESHOLD = 30;

/** Label stored on new questions describing the asker. */
export const DEFAULT_QUESTION_ROLE = 'Member';

export const DEFAULT_EXPERT_RESPONSE_TIME = '< 24 hours';
