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

// UI Components
import AuthPage from './components/AuthPage';
import NotificationsModal from './components/modals/NotificationsModal';
import AskQuestionModal from './components/modals/AskQuestionModal';
import QuestionDetailModal from './components/modals/QuestionDetailModal';
import { ExpertsModal, ExpertProfileModal } from './components/modals/ExpertsModal';
import AskExpertModal from './components/modals/AskExpertModal';
import LoadingQuestionsSpinner from './components/LoadingQuestionsSpinner';
import AdminPanel from './components/AdminPanel';

// Types and Interfaces
type ViewMode = 'trending' | 'recent' | 'unanswered';
export type AuthMode = 'signin' | 'signup';

const App: React.FC = () => {
  // Dummy User data

  const getUpvotes = (): QuestionUpvote[] => {
    // TODO: implement fetching upvotes from DB logic
    return [];
  }

  const getBookmarks = (): QuestionBookmark[] => {
    // TODO: implement fetching bookmarks from DB logic
    return [];
  }

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
  const [questions, setQuestions] = useState<QuestionWithRelations[]>([]);

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

    const fetchUsers = async () => {
      try {
        const usersData = await UserService.getAllUsers();
        if (usersData) setUsers(usersData);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };

    fetchQuestions();
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

  const checkIfUserUpvoted = (question: QuestionWithRelations): boolean => {
    return question.upvotes?.some(upvote => upvote.userId === currentUser?.id) ?? false;
  }

  const checkIfUserBookmarked = (question: QuestionWithRelations): boolean => {
    return question.bookmarks?.some(bookmark => bookmark.userId === currentUser?.id) ?? false;
  }

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
    return <AdminPanel 
      questions={questions}
      users={users}
      setSelectedQuestion={setSelectedQuestion}
      setIsAdminView={setIsAdminView}
      handleLogout={handleLogout}
    />;
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
              className={`px-6 py-3 rounded-full border-2 transition ${!selectedTag ? 'bg-white/20 border-white/40' : 'bg-white/10 border-white/20 hover:bg-white/15'
                }`}
            >
              All Topics
            </button>
            {tags.slice(0, 3).map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-6 py-3 rounded-full border-2 transition ${selectedTag === tag ? 'bg-white/20 border-white/40' : 'bg-white/10 border-white/20 hover:bg-white/15'
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

          {loadingQuestions ? <LoadingQuestionsSpinner /> : null}
          {!loadingQuestions && filteredQuestions.length === 0 ? (
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
                        )) : null}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleUpvote(question.id);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${checkIfUserUpvoted(question)
                            ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50 scale-105'
                            : 'bg-white/10 hover:bg-white/15 border border-white/10'
                          }`}
                      >
                        <ThumbsUp className={`w-4 h-4 transition-transform duration-300 ${checkIfUserUpvoted(question)
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
                        className={`p-2 rounded-lg transition-all duration-300 ${checkIfUserBookmarked(question)
                            ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/50 scale-105'
                            : 'bg-white/10 hover:bg-white/15 border border-white/10'
                          }`}
                        title={checkIfUserBookmarked(question) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Bookmark className={`w-4 h-4 transition-transform duration-300 ${checkIfUserBookmarked(question)
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
      <AskQuestionModal
        currentUser={currentUser}
        tags={tags}
        showAskQuestion={showAskQuestion}
        setShowAskQuestion={setShowAskQuestion}
        handleAskQuestion={handleAskQuestion}
      />
      <QuestionDetailModal 
        selectedQuestion={selectedQuestion}
        questions={questions}
        setSelectedQuestion={setSelectedQuestion}
        currentUser={currentUser}
        handleAddAnswer={handleAddAnswer}
      />
      <NotificationsModal
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          notifications={notifications}
      />
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