import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Login } from './pages/Login';
import './App.css';

function App() {
  const { user, profile, loading, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('tasks');
  const [taskDisplay, setTaskDisplay] = useState('board');
  const [viewingBoardOwnerId, setViewingBoardOwnerId] = useState(null);

  useEffect(() => {
    if (user && !viewingBoardOwnerId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setViewingBoardOwnerId(user.id);
    }
    if (!user && viewingBoardOwnerId) {
      setViewingBoardOwnerId(null);
    }
  }, [user, viewingBoardOwnerId]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-text-secondary)', fontSize: '0.9rem'
      }}>
        Carregando...
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  const viewingSelf = viewingBoardOwnerId === user.id;
  const baseTitle = currentView === 'dashboard' ? 'Dashboard' : (viewingSelf ? 'Minhas Tarefas' : 'Tarefas');

  return (
    <div className="app-container">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        viewingBoardOwnerId={viewingBoardOwnerId}
        setViewingBoardOwnerId={setViewingBoardOwnerId}
      />

      <main className="main-content">
        <Header
          title={baseTitle}
          currentView={currentView}
          taskDisplay={taskDisplay}
          setTaskDisplay={setTaskDisplay}
        />

        <div className="page-content">
          {currentView === 'dashboard' ? (
            <Dashboard />
          ) : (
            <Tasks
              displayMode={taskDisplay}
              viewingBoardOwnerId={viewingBoardOwnerId || user.id}
              currentUserId={user.id}
              isAdmin={isAdmin}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
