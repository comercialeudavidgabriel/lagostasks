import { useState } from 'react';
import { Bell, X } from 'lucide-react';

export function NewTasksAlert({ tasks, currentUserId }) {
  const unseen = tasks.filter(t => t.assigned_to === currentUserId && !t.seen_at);
  const [dismissedAt, setDismissedAt] = useState(0);

  if (unseen.length === 0 || unseen.length <= dismissedAt) return null;

  return (
    <div className="new-tasks-alert" role="alert">
      <div className="new-tasks-alert-icon">
        <Bell size={22} />
      </div>
      <div className="new-tasks-alert-body">
        <div className="new-tasks-alert-title">
          {unseen.length === 1
            ? 'Você tem 1 nova tarefa!'
            : `Você tem ${unseen.length} novas tarefas!`}
        </div>
        <div className="new-tasks-alert-sub">
          Os cards com brilho azul são tarefas que ainda não foram visualizadas. Clique nelas para abrir.
        </div>
      </div>
      <button
        className="new-tasks-alert-close"
        onClick={() => setDismissedAt(unseen.length)}
        aria-label="Fechar aviso"
      >
        <X size={16} />
      </button>
    </div>
  );
}
