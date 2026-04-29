import { Calendar, Link as LinkIcon, FolderOpen } from 'lucide-react';
import './TaskCard.css';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function avatarFor(name) {
  const safe = encodeURIComponent(name || 'User');
  return `https://ui-avatars.com/api/?name=${safe}&background=2563eb&color=fff`;
}

export function TaskCard({ task, profiles, onClick, onDragStart }) {
  const assignee = profiles.find(p => p.id === task.assigned_to);
  const isUnseen = !task.seen_at;
  const isOverdue = task.due_date && !task.completed_at && new Date(task.due_date) < new Date(new Date().toDateString());

  return (
    <div
      className={`task-card ${isUnseen ? 'task-card--unseen' : ''} ${isOverdue ? 'task-card--overdue' : ''}`}
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
    >
      <div className="task-card-header">
        <span className={`badge badge-${task.priority}`}>
          {task.priority === 'low' ? 'Baixa' : task.priority === 'medium' ? 'Média' : 'Alta'}
        </span>
        {isUnseen && <span className="new-pill">Novo</span>}
      </div>

      <h3 className="task-title">{task.title}</h3>

      {(task.reference_link || task.drive_link) && (
        <div className="task-links">
          {task.reference_link && (
            <a
              href={task.reference_link}
              target="_blank"
              rel="noreferrer"
              className="task-link-chip"
              onClick={(e) => e.stopPropagation()}
            >
              <LinkIcon size={12} /> Referência
            </a>
          )}
          {task.drive_link && (
            <a
              href={task.drive_link}
              target="_blank"
              rel="noreferrer"
              className="task-link-chip"
              onClick={(e) => e.stopPropagation()}
            >
              <FolderOpen size={12} /> Drive
            </a>
          )}
        </div>
      )}

      <div className="task-card-footer">
        <div className="task-meta">
          {task.due_date && (
            <div className={`meta-item ${isOverdue ? 'meta-overdue' : ''}`} title="Data de entrega">
              <Calendar size={14} />
              <span>{formatDate(task.due_date)}</span>
            </div>
          )}
        </div>

        <div className="task-assignees">
          {assignee && (
            <img
              src={avatarFor(assignee.name)}
              alt={assignee.name}
              title={assignee.name}
              className="assignee-avatar"
            />
          )}
        </div>
      </div>
    </div>
  );
}
