import React, { useState } from 'react';
import { Notification, QuestionWithRelations, UserWithRelations } from '../lib/supabase';
import { Utils } from '../lib/utils';
import { Search, Menu, Plus, Video, Mic, FileText, ThumbsUp, Bookmark, LogIn, LogOut, User as LucideUser, Shield, X, Upload, Play, Pause, Mail, Lock, ArrowRight, Eye, EyeOff, LayoutDashboard, Users, MessageSquare, TrendingUp, Settings, Bell, CheckCircle, Clock, AlertCircle, BarChart3, Activity, Award, Star, ChevronDown, HelpCircle } from 'lucide-react';

type AdminView = 'dashboard' | 'questions' | 'users';

interface AdminPanelProps {
    questions: QuestionWithRelations[]
    users: UserWithRelations[]
    setSelectedQuestion: (question: QuestionWithRelations | null) => void
    setIsAdminView: (show: boolean) => void,
    handleLogout: () => void
}

// Admin Panel Page
const AdminPanel: React.FC<AdminPanelProps> = ({
    questions,
    users,
    setSelectedQuestion,
    setIsAdminView,
    handleLogout
}) => {
    const [adminView, setAdminView] = useState<AdminView>('dashboard');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'answered'>('all');

    const pendingQuestions = questions.filter(q => q.status === 'PENDING');
    const answeredQuestions = questions.filter(q => q.status === 'ANSWERED');
    const activeUsers = users.filter(u => !u.isAdmin);

    const getFilteredQuestions = (): QuestionWithRelations[] => {
        if (filterStatus === 'pending') return pendingQuestions;
        if (filterStatus === 'answered') return answeredQuestions;
        return questions;
    };

    const DashboardView: React.FC = () => (
        <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div
                    onClick={() => setAdminView('questions')}
                    className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl rounded-xl p-6 border border-blue-500/20 cursor-pointer hover:scale-105 transition-transform"
                >
                    <MessageSquare className="w-8 h-8 text-blue-400 mb-4" />
                    <h3 className="text-3xl font-bold">{questions.length}</h3>
                    <p className="text-white/60">Total Questions</p>
                    <p className="text-sm text-blue-400 mt-2">Click to view all →</p>
                </div>

                <div
                    onClick={() => {
                        setAdminView('questions');
                        setFilterStatus('pending');
                    }}
                    className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-xl rounded-xl p-6 border border-orange-500/20 cursor-pointer hover:scale-105 transition-transform"
                >
                    <Clock className="w-8 h-8 text-orange-400 mb-4" />
                    <h3 className="text-3xl font-bold">{pendingQuestions.length}</h3>
                    <p className="text-white/60">Pending Questions</p>
                    <p className="text-sm text-orange-400 mt-2">Click to view →</p>
                </div>

                <div
                    onClick={() => setAdminView('users')}
                    className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-xl rounded-xl p-6 border border-green-500/20 cursor-pointer hover:scale-105 transition-transform"
                >
                    <Users className="w-8 h-8 text-green-400 mb-4" />
                    <h3 className="text-3xl font-bold">{activeUsers.length}</h3>
                    <p className="text-white/60">Active Users</p>
                    <p className="text-sm text-green-400 mt-2">Click to manage →</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
                    <BarChart3 className="w-8 h-8 text-purple-400 mb-4" />
                    <h3 className="text-3xl font-bold">{questions.reduce((acc, q) => acc + q.views, 0)}</h3>
                    <p className="text-white/60">Total Views</p>
                </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-4">
                    {questions.slice(0, 5).map(question => (
                        <div key={question.id} className="p-4 bg-white/5 rounded-lg flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold">{question.text}</h3>
                                <p className="text-sm text-white/60 mt-1">
                                    {question.author.name} • {Utils.formatTimestamp(question.createdAt)}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs ${question.status === 'ANSWERED' ? 'bg-green-500/20 text-green-300' :
                                'bg-orange-500/20 text-orange-300'
                                }`}>
                                {question.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );

    const QuestionsView: React.FC = () => (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Question Management</h2>
                <div className="flex gap-4">
                    <button
                        onClick={() => setAdminView('dashboard')}
                        className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                    >
                        ← Back to Dashboard
                    </button>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'answered')}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    >
                        <option value="all">All Questions</option>
                        <option value="pending">Pending Only</option>
                        <option value="answered">Answered Only</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {getFilteredQuestions().map(question => (
                    <div key={question.id} className="p-4 bg-white/5 rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold">{question.text}</h3>
                                <p className="text-sm text-white/60 mt-1">
                                    {question.author.name} • {Utils.formatTimestamp(question.createdAt)}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedQuestion(question);
                                    setIsAdminView(false);
                                }}
                                className="px-3 py-1 bg-blue-500/20 rounded text-sm hover:bg-blue-500/30 transition"
                            >
                                {question.status === 'ANSWERED' ? 'View' : 'Answer'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const UsersView: React.FC = () => (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">User Management</h2>
                <button
                    onClick={() => setAdminView('dashboard')}
                    className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                >
                    ← Back to Dashboard
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/20">
                            <th className="text-left py-3 px-4">User</th>
                            <th className="text-left py-3 px-4">Joined</th>
                            <th className="text-left py-3 px-4">Points</th>
                            <th className="text-left py-3 px-4">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeUsers.map(user => (
                            <tr key={user.email} className="border-b border-white/10">
                                <td className="py-3 px-4">
                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-sm text-white/60">{user.email}</p>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-sm">
                                    {user.joinDate.toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4">
                                    {user.points || 0}
                                </td>
                                <td className="py-3 px-4">
                                    <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                                        Active
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Shield className="w-6 h-6 text-yellow-400" />
                            Admin Dashboard
                        </h1>
                        <nav className="flex gap-2">
                            <button
                                onClick={() => setAdminView('dashboard')}
                                className={`px-3 py-1 rounded-lg transition ${adminView === 'dashboard' ? 'bg-white/20' : 'hover:bg-white/10'
                                    }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setAdminView('questions')}
                                className={`px-3 py-1 rounded-lg transition ${adminView === 'questions' ? 'bg-white/20' : 'hover:bg-white/10'
                                    }`}
                            >
                                Questions
                            </button>
                            <button
                                onClick={() => setAdminView('users')}
                                className={`px-3 py-1 rounded-lg transition ${adminView === 'users' ? 'bg-white/20' : 'hover:bg-white/10'
                                    }`}
                            >
                                Users
                            </button>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsAdminView(false)}
                            className="px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition"
                        >
                            Switch to User View
                        </button>
                        <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg transition">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {adminView === 'dashboard' && <DashboardView />}
                {adminView === 'questions' && <QuestionsView />}
                {adminView === 'users' && <UsersView />}
            </div>
        </div>
    );
};

export default AdminPanel;