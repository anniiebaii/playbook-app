import { User } from "./supabase";

class DummyData {
    static getDummyUsers = (): User[] => {
        return [
            {
                id: "550e8400-e29b-41d4-a716-446655440000",
                email: 'admin@leaderlink.com',
                password: 'admin123',
                name: 'Stacey Santos',
                isAdmin: true,
                joinDate: new Date('2025-01-01'),
                status: 'active',
                title: 'Frontier',
                expertise: ['Sales Strategy', 'Team Management', 'Enterprise Sales'],
                bio: 'Over 20 years of experience building and scaling high-performance sales teams.',
                answersCount: 156,
                rating: 4.9,
                responseTime: '< 2 hours',
                avatar: 'SS',
                points: 15600
            },
            {
                id: "550e8400-e29b-41d4-a716-446655440001",
                email: 'sarah.expert@leaderlink.com',
                password: 'expert123',
                name: 'Richard Anderson',
                isAdmin: true,
                joinDate: new Date('2025-01-15'),
                status: 'active',
                title: 'Frontier',
                expertise: ['Cold Calling', 'Objection Handling', 'Sales Training'],
                bio: 'Certified sales trainer with 15+ years helping teams exceed quotas.',
                answersCount: 89,
                rating: 4.8,
                responseTime: '< 4 hours',
                avatar: 'RA',
                points: 8900
            },
            {
                id: "550e8400-e29b-41d4-a716-446655440002",
                email: 'demo@example.com',
                password: 'demo123',
                name: 'Demo User',
                isAdmin: false,
                joinDate: new Date('2025-03-15'),
                status: 'active',
                points: 450
            }
        ];
    };

}