import type { QuestionReaction, QuestionWithRelations, User, UserSummary } from '../types/models';

export function makeUserSummary(overrides: Partial<UserSummary> = {}): UserSummary {
  return {
    id: 'user-1',
    name: 'Jordan Lee',
    isAdmin: false,
    avatar: null,
    title: null,
    ...overrides,
  };
}

export function makeReaction(overrides: Partial<QuestionReaction> = {}): QuestionReaction {
  return {
    id: 1,
    questionId: 1,
    userId: 'user-1',
    createdAt: '2025-01-01T00:00:00+00:00',
    ...overrides,
  };
}

export function makeQuestion(
  overrides: Partial<QuestionWithRelations> = {},
): QuestionWithRelations {
  return {
    id: 1,
    text: 'How do I handle pricing objections?',
    description: null,
    role: 'Member',
    tags: ['Sales'],
    views: 0,
    status: 'PENDING',
    priority: 'LOW',
    authorId: 'user-1',
    assignedToId: null,
    createdAt: '2025-01-01T00:00:00+00:00',
    updatedAt: '2025-01-01T00:00:00+00:00',
    author: makeUserSummary(),
    assignedTo: null,
    answers: [],
    upvotes: [],
    bookmarks: [],
    ...overrides,
  };
}

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'jordan@example.com',
    name: 'Jordan Lee',
    isAdmin: false,
    status: 'ACTIVE',
    title: null,
    expertise: null,
    bio: null,
    rating: null,
    responseTime: null,
    avatar: null,
    points: 0,
    createdAt: '2025-01-01T00:00:00+00:00',
    updatedAt: '2025-01-01T00:00:00+00:00',
    ...overrides,
  };
}
