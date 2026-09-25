import { useCallback, useState, type ReactNode } from 'react';

import { AskExpertModal } from './components/modals/AskExpertModal';
import { AskQuestionModal } from './components/modals/AskQuestionModal';
import { ExpertProfileModal } from './components/modals/ExpertProfileModal';
import { ExpertsModal } from './components/modals/ExpertsModal';
import { NotificationsModal } from './components/modals/NotificationsModal';
import { QuestionDetailModal } from './components/modals/QuestionDetailModal';
import type { QuestionDraft } from './components/questions/QuestionForm';
import { Toast } from './components/ui/Toast';
import { QUESTION_TAGS } from './constants';
import { useAuth } from './hooks/useAuth';
import { useExperts } from './hooks/useExperts';
import { useNotifications } from './hooks/useNotifications';
import { useQuestions } from './hooks/useQuestions';
import { AdminPage } from './pages/AdminPage';
import { AuthPage } from './pages/AuthPage';
import { HomePage } from './pages/HomePage';
import type { ExpertProfile, QuestionWithRelations, User } from './types/models';
import { getErrorMessage } from './utils/errors';

type Screen = 'home' | 'auth' | 'admin';

/** At most one modal is open at a time; each variant carries the data it needs. */
type ActiveModal =
  | { kind: 'askQuestion' }
  | { kind: 'questionDetail'; questionId: number }
  | { kind: 'notifications' }
  | { kind: 'experts' }
  | { kind: 'expertProfile'; expert: ExpertProfile }
  | { kind: 'askExpert'; expert: ExpertProfile };

const GENERIC_ERROR = 'Something went wrong. Please try again.';

/** Top-level coordinator: owns app-wide data, the current screen, and the open modal. */
export function App() {
  const { currentUser, signOut } = useAuth();
  const { questions, isLoading, error, createQuestion, addAnswer, toggleUpvote, toggleBookmark } =
    useQuestions();
  const { experts, isLoading: isLoadingExperts } = useExperts();
  const notifications = useNotifications(currentUser?.id);

  const [screen, setScreen] = useState<Screen>('home');
  const [modal, setModal] = useState<ActiveModal | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);
  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // The admin screen is only reachable by admins, even if `screen` is stale after sign-out.
  const activeScreen: Screen = screen === 'admin' && !currentUser?.isAdmin ? 'home' : screen;

  /** Runs `action` for signed-in users and sends guests to the sign-in screen instead. */
  const requireUser = (action: (user: User) => void) => {
    if (currentUser) {
      action(currentUser);
    } else {
      setModal(null);
      setScreen('auth');
    }
  };

  const handleSignOut = () => {
    setScreen('home');
    setModal(null);
    signOut().catch((signOutError: unknown) => {
      setToast(getErrorMessage(signOutError));
    });
  };

  const reactionHandler =
    (toggle: (question: QuestionWithRelations, userId: string) => Promise<void>) =>
    (question: QuestionWithRelations) => {
      requireUser((user) => {
        toggle(question, user.id).catch(() => {
          setToast(GENERIC_ERROR);
        });
      });
    };

  const submitQuestion = async (draft: QuestionDraft, expert?: ExpertProfile) => {
    if (!currentUser) throw new Error('Please sign in to ask a question.');
    await createQuestion({
      ...draft,
      authorId: currentUser.id,
      assignedToId: expert?.id,
      priority: expert ? 'MEDIUM' : 'LOW',
    });
  };

  const openQuestion = (questionId: number) => {
    setScreen('home');
    setModal({ kind: 'questionDetail', questionId });
  };

  const renderModal = (): ReactNode => {
    switch (modal?.kind) {
      case undefined:
        return null;

      case 'askQuestion':
        return (
          <AskQuestionModal
            tags={QUESTION_TAGS}
            onClose={closeModal}
            onSubmit={async (draft) => {
              await submitQuestion(draft);
              closeModal();
            }}
          />
        );

      case 'questionDetail': {
        const question = questions.find((q) => q.id === modal.questionId);
        if (!question) return null;
        return (
          <QuestionDetailModal
            question={question}
            canAnswer={currentUser?.isAdmin ?? false}
            onClose={closeModal}
            onSubmitAnswer={async (content) => {
              if (!currentUser) throw new Error('Please sign in to answer.');
              await addAnswer({
                questionId: question.id,
                authorId: currentUser.id,
                content,
                type: 'TEXT',
              });
            }}
          />
        );
      }

      case 'notifications':
        return (
          <NotificationsModal
            notifications={notifications.notifications}
            isLoading={notifications.isLoading}
            onClose={closeModal}
          />
        );

      case 'experts':
        return (
          <ExpertsModal
            experts={experts}
            isLoading={isLoadingExperts}
            onClose={closeModal}
            onViewProfile={(expert) => {
              setModal({ kind: 'expertProfile', expert });
            }}
            onAsk={(expert) => {
              requireUser(() => {
                setModal({ kind: 'askExpert', expert });
              });
            }}
          />
        );

      case 'expertProfile':
        return (
          <ExpertProfileModal
            expert={modal.expert}
            onClose={closeModal}
            onAsk={() => {
              requireUser(() => {
                setModal({ kind: 'askExpert', expert: modal.expert });
              });
            }}
          />
        );

      case 'askExpert':
        return (
          <AskExpertModal
            expert={modal.expert}
            tags={QUESTION_TAGS}
            onClose={closeModal}
            onSubmit={(draft) => submitQuestion(draft, modal.expert)}
          />
        );
    }
  };

  let page: ReactNode;
  if (activeScreen === 'auth') {
    page = (
      <AuthPage
        onAuthenticated={(user) => {
          setScreen(user.isAdmin ? 'admin' : 'home');
        }}
        onContinueAsGuest={() => {
          setScreen('home');
        }}
      />
    );
  } else if (activeScreen === 'admin') {
    page = (
      <AdminPage
        questions={questions}
        onOpenQuestion={openQuestion}
        onExit={() => {
          setScreen('home');
        }}
        onSignOut={handleSignOut}
      />
    );
  } else {
    page = (
      <HomePage
        currentUser={currentUser}
        questions={questions}
        isLoadingQuestions={isLoading}
        questionsError={error}
        expertCount={experts.length}
        unreadNotificationCount={notifications.unreadCount}
        onSignIn={() => {
          setScreen('auth');
        }}
        onSignOut={handleSignOut}
        onOpenAdmin={() => {
          setScreen('admin');
        }}
        onOpenNotifications={() => {
          setModal({ kind: 'notifications' });
        }}
        onShowExperts={() => {
          setModal({ kind: 'experts' });
        }}
        onAskQuestion={() => {
          requireUser(() => {
            setModal({ kind: 'askQuestion' });
          });
        }}
        onOpenQuestion={openQuestion}
        onToggleUpvote={reactionHandler(toggleUpvote)}
        onToggleBookmark={reactionHandler(toggleBookmark)}
      />
    );
  }

  return (
    <>
      {page}
      {activeScreen === 'home' && renderModal()}
      {toast && <Toast message={toast} onDismiss={dismissToast} />}
    </>
  );
}
