import { useEffect, useState } from 'react';
import { LayoutDashboard, CheckSquare, Users, LogOut, Briefcase, Lock } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabase';
import { DEPARTMENTS } from '../constants';
import './Sidebar.css';

function avatarFor(name) {
  const safe = encodeURIComponent(name || 'User');
  return `https://ui-avatars.com/api/?name=${safe}&background=2563eb&color=fff`;
}

export function Sidebar({ currentView, setCurrentView, viewingBoardOwnerId, setViewingBoardOwnerId, viewingDepartment, setViewingDepartment }) {
  const { user, profile, isAdmin, signOut } = useAuth();
  const [teamProfiles, setTeamProfiles] = useState([]);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    supabase
      .from('profiles')
      .select('id,name,role,department')
      .order('name')
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('Erro ao listar profiles:', error);
          return;
        }
        setTeamProfiles((data || []).filter(p => p.id !== user?.id));
      });
    return () => { cancelled = true; };
  }, [isAdmin, user?.id]);

  const goToMyBoard = () => {
    setViewingBoardOwnerId(user.id);
    setViewingDepartment(null);
    setCurrentView('tasks');
  };

  const goToBoard = (ownerId) => {
    setViewingBoardOwnerId(ownerId);
    setViewingDepartment(null);
    setCurrentView('tasks');
  };

  const goToDepartment = (deptId) => {
    if (!isAdmin && profile?.department !== deptId) return;
    setViewingDepartment(deptId);
    setViewingBoardOwnerId(null);
    setCurrentView('department');
  };

  const isViewingSelf = currentView === 'tasks' && viewingBoardOwnerId === user?.id;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon"></div>
        <h1 className="logo-text">Tasks Lagos</h1>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>

        <button
          className={`nav-item ${isViewingSelf ? 'active' : ''}`}
          onClick={goToMyBoard}
        >
          <CheckSquare size={20} />
          <span>Meu quadro</span>
        </button>

        <button
          className={`nav-item ${currentView === 'clients' ? 'active' : ''}`}
          onClick={() => setCurrentView('clients')}
        >
          <Briefcase size={20} />
          <span>Clientes</span>
        </button>

        <div className="nav-section">
          <div className="nav-section-title">
            <Users size={14} />
            <span>Áreas</span>
          </div>
          {DEPARTMENTS.map(dept => {
            const allowed = isAdmin || profile?.department === dept.id;
            const active = currentView === 'department' && viewingDepartment === dept.id;
            return (
              <button
                key={dept.id}
                className={`nav-item nav-item-team ${active ? 'active' : ''} ${!allowed ? 'nav-item-locked' : ''}`}
                onClick={() => goToDepartment(dept.id)}
                title={allowed ? dept.label : `${dept.label} — acesso restrito`}
              >
                <span className="dept-icon">{dept.label.charAt(0)}</span>
                <span>{dept.label}</span>
                {!allowed && <Lock size={12} className="lock-icon" />}
              </button>
            );
          })}
        </div>

        {isAdmin && teamProfiles.length > 0 && (
          <div className="nav-section">
            <div className="nav-section-title">
              <Users size={14} />
              <span>Quadros da equipe</span>
            </div>
            {teamProfiles.map(p => (
              <button
                key={p.id}
                className={`nav-item nav-item-team ${currentView === 'tasks' && viewingBoardOwnerId === p.id ? 'active' : ''}`}
                onClick={() => goToBoard(p.id)}
                title={p.role === 'admin' ? `${p.name} (admin)` : p.name}
              >
                <img src={avatarFor(p.name)} alt={p.name} className="nav-avatar" />
                <span>{p.name}</span>
                {p.role === 'admin' && <span className="role-tag">admin</span>}
              </button>
            ))}
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <img src={avatarFor(profile?.name)} alt={profile?.name} className="avatar" />
          <div className="user-info">
            <span className="user-name">{profile?.name}</span>
            <span className="user-role">{isAdmin ? 'Administrador' : 'Colaborador'}</span>
          </div>
          <button className="logout-btn" onClick={signOut} title="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
