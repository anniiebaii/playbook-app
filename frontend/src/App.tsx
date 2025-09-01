import React, { useState, useEffect } from 'react';
import { Search, Menu, Plus, Video, Mic, FileText, ThumbsUp, Bookmark, LogIn, LogOut, User as LucideUser, Shield, X, Upload, Play, Pause, Mail, Lock, ArrowRight, Eye, EyeOff, LayoutDashboard, Users, MessageSquare, TrendingUp, Settings, Bell, CheckCircle, Clock, AlertCircle, BarChart3, Activity, Award, Star, ChevronDown, HelpCircle } from 'lucide-react';

// App Interfaces/Types
import { Question, QuestionWithRelations, Answer, User, Notification, NewAnswer, AnswerData, QuestionData, QuestionUpvote, QuestionBookmark, AnswerWithRelations, CreateUpvoteInput, CreateUserInput, CreateBookmarkInput, UserWithRelations } from './lib/supabase';

// Libraries
import { QuestionService } from './lib/questionService';
import { AnswerService } from './lib/answerService';
import { UpvoteService } from './lib/upvoteService';
import { UserService } from './lib/userService';
import { BookmarkService } from './lib/bookmarkService';
import { Utils } from './lib/utils';

// Components
import AuthPage from './components/AuthPage';
import NotificationsModal from './components/NotificationsModal';
import AskQuestionModal from './components/AskQuestionModal'; 
import { ExpertsModal, ExpertProfileModal } from './components/ExpertsModal';
import AskExpertModal from './components/AskExpertModal';
import LoadingQuestionsSpinner from './components/LoadingQuestionsSpinner';

// Types and Interfaces
type ViewMode = 'trending' | 'recent' | 'unanswered';
export type AuthMode = 'signin' | 'signup';
type AdminView = 'dashboard' | 'questions' | 'users';

const App: React.FC = () => {
  // Dummy User data
  const getDummyUsers = (): User[] => {
    return [
      // { 
      //   id: "550e8400-e29b-41d4-a716-446655440000",
      //   email: 'admin@leaderlink.com', 
      //   password: 'admin123', 
      //   name: 'Stacey Santos', 
      //   isAdmin: true, 
      //   joinDate: new Date('2025-01-01'), 
      //   status: 'active',
      //   title: 'Frontier',
      //   expertise: ['Sales Strategy', 'Team Management', 'Enterprise Sales'],
      //   bio: 'Over 20 years of experience building and scaling high-performance sales teams.',
      //   answersCount: 156,
      //   rating: 4.9,
      //   responseTime: '< 2 hours',
      //   avatar: 'SS',
      //   points: 15600
      // },
      // { 
      //   id: "550e8400-e29b-41d4-a716-446655440001",
      //   email: 'sarah.expert@leaderlink.com', 
      //   password: 'expert123', 
      //   name: 'Richard Anderson', 
      //   isAdmin: true, 
      //   joinDate: new Date('2025-01-15'), 
      //   status: 'active',
      //   title: 'Frontier',
      //   expertise: ['Cold Calling', 'Objection Handling', 'Sales Training'],
      //   bio: 'Certified sales trainer with 15+ years helping teams exceed quotas.',
      //   answersCount: 89,
      //   rating: 4.8,
      //   responseTime: '< 4 hours',
      //   avatar: 'RA',
      //   points: 8900
      // },
      // { 
      //   id: "550e8400-e29b-41d4-a716-446655440002",
      //   email: 'demo@example.com', 
      //   password: 'demo123', 
      //   name: 'Demo User', 
      //   isAdmin: false, 
      //   joinDate: new Date('2025-03-15'), 
      //   status: 'active',
      //   points: 450
      // }
    ];
  };

  const getUpvotes = (): QuestionUpvote[] => {
    // TODO: implement fetching upvotes from DB logic
    return [];
  }

  const getBookmarks = (): QuestionBookmark[] => {  
    // TODO: implement fetching bookmarks from DB logic
    return [];
  }


  // Dummy questions
  const getDummyQuestions = (): QuestionWithRelations[] => {
    return [
    ];
  };

  // React Hooks and States with proper typing
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showAuthPage, setShowAuthPage] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('trending');

  /* App Object States */
  const [users, setUsers] = useState<UserWithRelations[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [upvotes, setUpvotes] = useState<QuestionUpvote[]>(getUpvotes());
  const [bookmarks, setBookmarks] = useState<QuestionBookmark[]>(getBookmarks());
  const [questions, setQuestions] = useState<QuestionWithRelations[]>(getDummyQuestions());

  /* Question States */
  const [showAskQuestion, setShowAskQuestion] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionWithRelations | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  /* Answer States */
  const [newAnswer, setNewAnswer] = useState<NewAnswer>({ type: 'TEXT', content: '' });

  /* Notification States */
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  /* Expert User States */
  const [showExperts, setShowExperts] = useState<boolean>(false);
  const [selectedExpert, setSelectedExpert] = useState<User | null>(null);
  const [showAskExpert, setShowAskExpert] = useState<boolean>(false);


  useEffect(() => {
    const fetchQuestions = async () => {
     try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 seconds delay

      const data = await QuestionService.getQuestionsWithRelations();
      setQuestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
    };
    
    fetchQuestions();
  }, []);  

  // Fetch users asynchronously after component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await UserService.getAllUsers();
        if (usersData) setUsers(usersData);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };

    fetchUsers();
  }, []);

  // TODO: handle notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'answer',
      title: 'New answer to your question',
      message: 'Admin answered your question',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      icon: MessageSquare,
      color: 'text-blue-400'
    }
  ]);

  // TODO: handle tags
  const tags: string[] = ["Objections", "Recruiting", "Daily Routines", "Team Management", "Sales", "Skills", "Leadership"];
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  const handleLogout = (): void => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsAdminView(false);
  };

  const handleAskQuestion = async (questionData: QuestionData) => {
    const now = new Date();
    const newQuestion: QuestionWithRelations = {
      id: questions.length + 1,
      text: questionData.title,
      description: questionData.description || '',
      author: currentUser!,
      authorId: currentUser?.id || "0",
      role: "Member",
      tags: questionData.tags,
      upvotes: [],
      status: "PENDING",
      priority: "LOW",
      views: 0,
      answers: [],
      createdAt: now,
      updatedAt: now
    };

    const insertedQuestion = await QuestionService.createQuestion(questionData);
    // reconcile actual id with temp id
    newQuestion.id = insertedQuestion.id;
    setQuestions([newQuestion, ...questions]);
    setShowAskQuestion(false);
  };

    const handleAddAnswer = async (content: string, type: Answer["type"]) => {
    if (!selectedQuestion || !currentUser?.isAdmin || !content) return;
    
    let answer: AnswerWithRelations = {
      id: (selectedQuestion.answers?.length ?? 0) + 1,
      type: type,
      content: content,
      author: currentUser,
      authorId: currentUser.id,
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      questionId: selectedQuestion.id
    };

    const answerData: AnswerData = {
      type: type,
      content: content,
      authorId: currentUser.id,
      questionId: selectedQuestion.id,
      isAdmin: true
    };

    const insertedAnswer = await AnswerService.createAnswer(answerData);

    answer.id = insertedAnswer.id;

    // Update question's status
    QuestionService.update(selectedQuestion.id, { status: 'ANSWERED' });
    
    setQuestions(questions.map(q => 
      q.id === selectedQuestion.id 
        ? { ...q, answers: [...(q.answers ?? []), answer], status: 'ANSWERED' as const }
        : q
    ));
    
    const updatedQuestion: Question = {
      ...selectedQuestion,
      status: 'ANSWERED'
    };
    
    setSelectedQuestion({
      ...selectedQuestion,
      answers: [...(selectedQuestion.answers ?? []), answer],
      status: 'ANSWERED'
    });
    setNewAnswer({ type: 'TEXT', content: '' });
  };

  const [error, setError] = useState<string>('');

  const handleSignIn = async (email: string, password: string) => {
      const user = await UserService.signIn(email, password)

      // TODO: handle signin error states
        // invalid email/password
        // user with email does not exist

      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
        setShowAuthPage(false);
        setError('');
        
        if (user.isAdmin) {
          setIsAdminView(true);
        }
      } else {
        setError('Invalid email or password');
      }
    };

  const handleSignUp = async (email: string, password: string, name: string) => {
    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }

    const newUserInput: CreateUserInput = {
      email,
      password,
      name,
      isAdmin: false
    };

    const newUser = await UserService.signUp(newUserInput);

    // TODO: handle signup errors
      // email already exists state

    if (!newUser) {
      setError('Error signing up. Please try again.');
      return;
    }
    
    // const updatedUsers = [...users, newUser];
    //setUsers(updatedUsers);
    setIsAuthenticated(true);
    setCurrentUser(newUser);
    setShowAuthPage(false);
    setError('');
  };

  const getQuestionById = (id: number): QuestionWithRelations | undefined => {
    return questions.find(q => q.id === id);
  }

  const toggleUpvote = async (questionId: number) => {
    if (!isAuthenticated) {
      setShowAuthPage(true);
      return;
    }

    const question = getQuestionById(questionId);

    if (!question) {
      console.error('Question not found with ID:', questionId);
      return;
    }
    const now = new Date();

    let newUpvotes: QuestionUpvote[] = Array.isArray(question.upvotes) ? [...question.upvotes] : [];

    const isUpvoted = checkIfUserUpvoted(questions.find(q => q.id === questionId)!);

    let newUpvote: CreateUpvoteInput = {
      //id: newUpvotes.length > 0 ? Math.max(...newUpvotes.map(u => u.id)) + 1 : 1, // Temporary ID; will be replaced by DB ID
      questionId: questionId,
      userId: currentUser!.id
    }; 

    if (isUpvoted) {
      // Remove upvote
      newUpvotes = newUpvotes.filter(upvote => upvote.userId !== currentUser!.id);

      await UpvoteService.deleteByQuestionAndUser(questionId, currentUser!.id);

    } else {
      // Add upvote
      const insertedUpvote = await UpvoteService.create(newUpvote);
      newUpvotes.push(insertedUpvote);
    }
    
    // Update upvote states
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          upvotes: newUpvotes,
          upvoteCount: newUpvotes.length
        };
      }
      return q;
    }));
  };

  const toggleSave = async (questionId: number) => {
    if (!isAuthenticated) {
      setShowAuthPage(true);
      return;
    }
    
    const question = getQuestionById(questionId);

    if (!question) {
      console.error('Question not found with ID:', questionId);
      return;
    }
    const now = new Date();

    let newBookmarks: QuestionBookmark[] = Array.isArray(question.bookmarks) ? [...question.bookmarks] : [];

    const isSaved = checkIfUserBookmarked(question);

    let newBookmark: CreateBookmarkInput = {
      questionId: questionId,
      userId: currentUser!.id
    }; 

    if (isSaved) {
      // Remove bookmark
      newBookmarks = newBookmarks.filter(upvote => upvote.userId !== currentUser!.id);

      await BookmarkService.deleteByQuestionAndUser(questionId, currentUser!.id);

    } else {
      // Add bookmark
      const insertedBookmark = await BookmarkService.create(newBookmark);
      newBookmarks.push(insertedBookmark);
    }
    
    // Update Bookmark states
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          bookmarks: newBookmarks,
          bookmarkCount: newBookmarks.length
        };
      }
      return q;
    }));
  };
  
  const sortQuestions = (questionsToSort: QuestionWithRelations[]): QuestionWithRelations[] => {
     return [...questionsToSort].sort((a, b) => {
    if (viewMode === 'recent') {
      return b.createdAt.getTime() - a.createdAt.getTime();
    } else if (viewMode === 'unanswered') {
      if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
      if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    } else { // trending
      //Compare upvoteCount directly, not upvotes arrays
      const aUpvoteCount = a.upvoteCount ?? a.upvotes?.length ?? 0;
      const bUpvoteCount = b.upvoteCount ?? b.upvotes?.length ?? 0;
      
      if (bUpvoteCount !== aUpvoteCount) {
        return bUpvoteCount - aUpvoteCount;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    }
  })
  }

  // Only sort when loading data initially
  useEffect(() => {
    // When questions first load, sort them once
    if (questions.length > 0) {
      setQuestions(sortQuestions(questions));
    }
  }, [questions.length, viewMode]); // Only when data loads or view changes

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         q.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || q.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const checkIfUserUpvoted = (question: QuestionWithRelations) : boolean => {
    return question.upvotes?.some(upvote => upvote.userId === currentUser?.id) ?? false;
  }

  const checkIfUserBookmarked = (question: QuestionWithRelations) : boolean => {
    return question.bookmarks?.some(bookmark => bookmark.userId === currentUser?.id) ?? false;
  }

  // Admin Panel Component
  const AdminPanel: React.FC = () => {
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
                <span className={`px-3 py-1 rounded-full text-xs ${
                  question.status === 'ANSWERED' ? 'bg-green-500/20 text-green-300' :
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
                  className={`px-3 py-1 rounded-lg transition ${
                    adminView === 'dashboard' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setAdminView('questions')}
                  className={`px-3 py-1 rounded-lg transition ${
                    adminView === 'questions' ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  Questions
                </button>
                <button
                  onClick={() => setAdminView('users')}
                  className={`px-3 py-1 rounded-lg transition ${
                    adminView === 'users' ? 'bg-white/20' : 'hover:bg-white/10'
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

  // Modals
  

  const QuestionDetailModal = () => {
    // Define our React Hook for managing the answer text state
    const [answerText, setAnswerText] = useState("");

    if (!selectedQuestion) return null;
    
    const question = questions.find(q => q.id === selectedQuestion.id) || selectedQuestion;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* max-h-[90vh]: keep the modal from being taller than 90% of the viewport height. */}
        { /* overflow-y-auto: make the modal scroll internally when content overflows. */}
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl max-w-4xl w-full border border-white/20 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl font-bold pr-4">{question.text}</h2>
            <button onClick={() => setSelectedQuestion(null)} className="p-2 hover:bg-white/10 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {question.description && (
            <p className="text-white/80 mb-6">{question.description}</p>
          )}
          
          <div className="flex items-center gap-4 mb-6 text-white/80">
            <span>{question.author.name}, {question.role}</span>
            <span>•</span>
            <span>{question.createdAt.toLocaleDateString()}</span>
          </div>
          
          <div className="flex gap-2 mb-8">
            {(question.tags ?? []).map(tag => (
              <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="border-t border-white/20 pt-6">
            <h3 className="text-xl font-semibold mb-4">Answers ({question.answers?.length ?? 0})</h3>
            
            {(question.answers ?? []).map(answer => (
              <div key={answer.id} className="mb-6 p-4 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  {answer.isAdmin && <Shield className="w-4 h-4 text-yellow-400" />}
                  <span className="font-semibold">{answer.author.name}</span>
                  <span className="text-sm text-white/60">{answer.createdAt.toLocaleDateString()}</span>
                </div>
                <p className="text-white/90">{answer.content}</p>
              </div>
            ))}
            
            {currentUser?.isAdmin && (
              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-yellow-400" />
                  Add Admin Answer
                </h4>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full p-3 mb-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 min-h-[100px]"
                />
                <button
                  onClick={() => {
                    handleAddAnswer(answerText, "TEXT");
                    setAnswerText(""); // clear after posting
                  }}
                  disabled={!answerText}
                  className="w-full py-3 bg-white/20 rounded-lg font-semibold hover:bg-white/30 transition disabled:opacity-50"
                >
                  Post Answer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Show auth page
  if (showAuthPage) {
    return <AuthPage
        authMode={authMode}
        setAuthMode={setAuthMode}
        handleSignIn={handleSignIn}
        handleSignUp={handleSignUp}
        error={error}
        setError={setError}
        setShowAuthPage={setShowAuthPage}
      />;
  }

  // Show admin panel
  if (isAuthenticated && currentUser?.isAdmin && isAdminView) {
    return <AdminPanel />;
  }

  // Main app
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-700 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome section for new users */}
        {!isAuthenticated && (
          <div className="mb-12 p-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-white/20 text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to Lynk</h2>
            <p className="text-lg text-white/80 mb-6 max-w-2xl mx-auto">
              Build the ultimate knowledge base for sales and business leaders. Get expert insights from verified professionals.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Knowledge Encyclopedia</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Expert-Driven Content</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Growing Question Library</span>
              </div>
            </div>
          </div>
        )}

        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold">Lynk</h1>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2">
                  {currentUser && currentUser.isAdmin && (
                    <button
                      onClick={() => setIsAdminView(true)}
                      className="px-3 py-1 bg-yellow-500/20 rounded-lg hover:bg-yellow-500/30 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 inline mr-1" />
                      Admin Panel
                    </button>
                  )}
                  <LucideUser className="w-5 h-5" />
                  <span>{currentUser?.name}</span>
                </div>
                <button onClick={() => setShowNotifications(true)} className="p-2 hover:bg-white/10 rounded-lg transition relative">
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg transition">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button onClick={() => setShowAuthPage(true)} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
                <LogIn className="w-5 h-5 inline mr-2" />
                Login
              </button>
            )}
          </div>
        </header>

        <section className="text-center mb-16">
          <div className="relative max-w-2xl mx-auto mb-8">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search our knowledge base..."
              className="w-full py-6 pl-16 pr-6 text-xl bg-white/10 backdrop-blur-md rounded-full border-2 border-white/20 focus:border-white/40 outline-none transition placeholder-white/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="flex gap-4 justify-center flex-wrap mb-6">
            <button
              onClick={() => setSelectedTag('')}
              className={`px-6 py-3 rounded-full border-2 transition ${
                !selectedTag ? 'bg-white/20 border-white/40' : 'bg-white/10 border-white/20 hover:bg-white/15'
              }`}
            >
              All Topics
            </button>
            {tags.slice(0, 3).map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-6 py-3 rounded-full border-2 transition ${
                  selectedTag === tag ? 'bg-white/20 border-white/40' : 'bg-white/10 border-white/20 hover:bg-white/15'
                }`}
              >
                {tag}
              </button>
            ))}
            <button
              onClick={() => {
                // Cycle through all tags
                const currentIndex = tags.indexOf(selectedTag);
                const nextIndex = (currentIndex + 1) % tags.length;
                setSelectedTag(currentIndex === -1 ? tags[0] : tags[nextIndex]);
              }}
              className="px-6 py-3 rounded-full border-2 bg-white/10 border-white/20 hover:bg-white/15 transition flex items-center gap-2"
              title="More topics"
            >
              More
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => setShowExperts(true)}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border-2 border-white/20 hover:border-white/40 transition group"
            >
              <Shield className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">Meet Our Expert Advisors</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </button>
            
            {!isAuthenticated && (
              <button
                onClick={() => setShowAuthPage(true)}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border-2 border-white/20 hover:border-white/40 transition group"
              >
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold">Contribute to Our Knowledge Base</span>
              </button>
            )}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {viewMode === 'trending' && 'Trending Questions'}
                {viewMode === 'recent' && 'Recent Questions'}
                {viewMode === 'unanswered' && 'Unanswered Questions'}
              </h2>
              <div className="flex gap-4">
                <button
                  onClick={() => setViewMode('trending')}
                  className={`text-sm ${viewMode === 'trending' ? 'text-white' : 'text-white/60 hover:text-white'} transition`}
                >
                  Trending
                </button>
                <button
                  onClick={() => setViewMode('recent')}
                  className={`text-sm ${viewMode === 'recent' ? 'text-white' : 'text-white/60 hover:text-white'} transition`}
                >
                  Recent
                </button>
                <button
                  onClick={() => setViewMode('unanswered')}
                  className={`text-sm ${viewMode === 'unanswered' ? 'text-white' : 'text-white/60 hover:text-white'} transition`}
                >
                  Unanswered ({questions.filter(q => q.status === 'PENDING').length})
                </button>
              </div>
            </div>
            <button
              onClick={() => isAuthenticated ? setShowAskQuestion(true) : setShowAuthPage(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border-2 border-white/20 hover:bg-white/20 hover:border-white/40 transition"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Ask a New Question</span>
              <span className="sm:hidden">Ask</span>
            </button>
          </div>

          { loadingQuestions ? <LoadingQuestionsSpinner/> : null }
          { !loadingQuestions && filteredQuestions.length === 0 ? (
            <div className="text-center py-16">
              <HelpCircle className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No questions found</h3>
              <p className="text-white/60 mb-6">Be the first to ask about this topic!</p>
              <button
                onClick={() => isAuthenticated ? setShowAskQuestion(true) : setShowAuthPage(true)}
                className="px-6 py-3 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition"
              >
                Ask the First Question
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className="p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 transition cursor-pointer group relative overflow-hidden"
                  onClick={() => setSelectedQuestion(question)}
                >
                  {/* Hot indicator for trending questions */}
                  {question.upvotes && question.upvotes.length > 30 && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-xs font-semibold">
                      HOT
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold mb-3 group-hover:text-white/90 transition">
                        {question.text}
                      </h3>
                      
                      {/* Question preview */}
                      {question.description && (
                        <p className="text-white/60 mb-3 line-clamp-2">
                          {question.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-white/70">
                        <span className="flex items-center gap-1">
                          <LucideUser className="w-4 h-4" />
                          {question.author.name}, {question.role}
                        </span>
                        <span>•</span>
                        <span>{Utils.formatTimestamp(question.createdAt)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {question.views} views
                        </span>
                        {question.status === 'ANSWERED' && (
                          <>
                            <span>•</span>
                            <span className="text-green-400 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Answered
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2 mt-4">
                        {question.tags != null ? question.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-sm hover:bg-white/20 transition">
                            {tag}
                          </span>
                        )): null }
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleUpvote(question.id);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                          checkIfUserUpvoted(question) 
                            ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50 scale-105' 
                            : 'bg-white/10 hover:bg-white/15 border border-white/10'
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 transition-transform duration-300 ${
                          checkIfUserUpvoted(question)
                            ? 'fill-current scale-110' 
                            : 'hover:scale-110'
                        }`} />
                        <span className="font-medium">{question.upvoteCount}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSave(question.id);
                        }}
                        className={`p-2 rounded-lg transition-all duration-300 ${
                          checkIfUserBookmarked(question) 
                            ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/50 scale-105' 
                            : 'bg-white/10 hover:bg-white/15 border border-white/10'
                        }`}
                        title={checkIfUserBookmarked(question) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Bookmark className={`w-4 h-4 transition-transform duration-300 ${
                          checkIfUserBookmarked(question) 
                            ? 'fill-current scale-110' 
                            : 'hover:scale-110'
                        }`} />
                      </button>
                    </div>
                  </div>
                  {(question.answers && question.answers.length > 0) && (
                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                      <p className="text-sm text-white/60">
                        {question.answers.length} answer{question.answers.length > 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-white/60">
                        Click to view answers →
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Quick stats */}
          {filteredQuestions.length > 0 && (
            <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl font-bold text-blue-400">{questions.length}</div>
                  <div className="text-white/60">Total Questions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">
                    {questions.filter(q => q.status === 'ANSWERED').length}
                  </div>
                  <div className="text-white/60">Expert Answers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-400">{users.filter(u => u.isAdmin).length}</div>
                  <div className="text-white/60">Expert Advisors</div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Modals */}
      {showAskQuestion ? <AskQuestionModal
        currentUser={currentUser}
        tags={tags}
        showAskQuestion={showAskQuestion}
        setShowAskQuestion={setShowAskQuestion}
        handleAskQuestion={handleAskQuestion}
      /> : null}
      <QuestionDetailModal />
      {showNotifications && (
        <NotificationsModal
          setShowNotifications={setShowNotifications}
          notifications={notifications}
        />
      )}
      <ExpertsModal
        showExperts={showExperts}
        setShowExperts={setShowExperts}
        setSelectedExpert={setSelectedExpert}
        setShowAskExpert={setShowAskExpert}
        users={users}
      />
      <ExpertProfileModal
        selectedExpert={selectedExpert}
        showAskExpert={showAskExpert}
        setSelectedExpert={setSelectedExpert}
        setShowAskExpert={setShowAskExpert}
      />
      <AskExpertModal 
        selectedExpert={selectedExpert}
        tags={tags}
        showAskExpert={showAskExpert}
        questions={questions}
        currentUser={currentUser}
        setQuestions={setQuestions}
        setSelectedExpert={setSelectedExpert}
        setShowAskExpert={setShowAskExpert}
    />
    </div>
  );
};

export default App;