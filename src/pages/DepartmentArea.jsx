import { useEffect, useMemo, useState } from 'react';
import { Lock } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';
import { DEPARTMENT_BY_ID } from '../constants';
import { Tasks } from './Tasks';

export function DepartmentArea({ departmentId, displayMode }) {
  const { user, isAdmin, profile } = useAuth();
  const dept = DEPARTMENT_BY_ID[departmentId];
  const allowed = isAdmin || profile?.department === departmentId;

  const [members, setMembers] = useState([]);
  const [activeBoardOwner, setActiveBoardOwner] = useState(null);
  const [loading, setLoading] = useState(allowed);

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    supabase
      .from('profiles')
      .select('id,name,department')
      .eq('department', departmentId)
      .order('name')
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error('Erro ao listar membros do depto:', error);
          setLoading(false);
          return;
        }
        const list = data || [];
        setMembers(list);
        // Se não-admin, força o próprio quadro. Admin: começa pelo primeiro membro.
        const initial = isAdmin ? (list[0]?.id ?? null) : user?.id;
        setActiveBoardOwner(initial);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [allowed, departmentId, isAdmin, user?.id]);

  const visibleMembers = useMemo(() => (
    isAdmin ? members : members.filter(m => m.id === user?.id)
  ), [members, isAdmin, user?.id]);

  if (!dept) return <div className="tasks-state">Área não encontrada.</div>;

  if (!allowed) {
    return (
      <div className="locked-area">
        <Lock size={42} />
        <h2>{dept.label}</h2>
        <p>Esta área é restrita. Apenas administradores e membros desta área podem acessar.</p>
      </div>
    );
  }

  if (loading) return <div className="tasks-state">Carregando área...</div>;

  if (visibleMembers.length === 0) {
    return (
      <div className="empty-area">
        <h2>{dept.label}</h2>
        <p>Nenhum colaborador atribuído a esta área ainda.</p>
        {isAdmin && (
          <p className="empty-area-hint">
            Atribua colaboradores executando no SQL Editor:<br />
            <code>UPDATE public.profiles SET department='{departmentId}' WHERE name='Fulano';</code>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="department-area">
      {visibleMembers.length > 1 && (
        <div className="dept-tabs">
          {visibleMembers.map(m => (
            <button
              key={m.id}
              className={`dept-tab ${activeBoardOwner === m.id ? 'active' : ''}`}
              onClick={() => setActiveBoardOwner(m.id)}
            >
              {m.name}
            </button>
          ))}
        </div>
      )}

      {activeBoardOwner && (
        <Tasks
          displayMode={displayMode}
          viewingBoardOwnerId={activeBoardOwner}
          currentUserId={user.id}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
