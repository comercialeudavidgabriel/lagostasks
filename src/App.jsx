import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { isConfigured } from './supabase';
import { DEPARTMENT_BY_ID } from './constants';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Login } from './pages/Login';
import { SetupNeeded } from './pages/SetupNeeded';
import { Clients } from './pages/Clients';
import { DepartmentArea } from './pages/DepartmentArea';
import './App.css';

function App() {
  if (!isConfigured) {
    return <SetupNeeded />;
  }
  return <AppShell />;
}

function AppShell() {
  const { user, profile, loading, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState('tasks');
  const [taskDisplay, setTaskDisplay] = useState('board');
  const [viewingBoardOwnerId, setViewingBoardOwnerId] = useState(null);
  const [viewingDepartment, setViewingDepartment] = useState(null);

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
  let title = 'Tasks Lagos';
  if (currentView === 'dashboard') title = 'Dashboard';
  else if (currentView === 'tasks') title = viewingSelf ? 'Minhas Tarefas' : 'Tarefas';
  else if (currentView === 'clients') title = 'Clientes';
  else if (currentView === 'department') title = DEPARTMENT_BY_ID[viewingDepartment]?.label || 'Área';

  const showTaskToggle = currentView === 'tasks' || currentView === 'department';

  return (
    <div className="app-container">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        viewingBoardOwnerId={viewingBoardOwnerId}
        setViewingBoardOwnerId={setViewingBoardOwnerId}
        viewingDepartment={viewingDepartment}
        setViewingDepartment={setViewingDepartment}
      />

      <main className="main-content">
        <Header
          title={title}
          currentView={showTaskToggle ? 'tasks' : currentView}
          taskDisplay={taskDisplay}
          setTaskDisplay={setTaskDisplay}
        />

        <div className="page-content">
          {currentView === 'dashboard' && <Dashboard />}

          {currentView === 'tasks' && (
            <Tasks
              displayMode={taskDisplay}
              viewingBoardOwnerId={viewingBoardOwnerId || user.id}
              currentUserId={user.id}
              isAdmin={isAdmin}
            />
          )}

          {currentView === 'clients' && <Clients />}

          {currentView === 'department' && viewingDepartment && (
            <DepartmentArea
              departmentId={viewingDepartment}
              displayMode={taskDisplay}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
