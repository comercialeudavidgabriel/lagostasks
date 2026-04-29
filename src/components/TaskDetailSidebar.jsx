import { X, Trash2 } from 'lucide-react';

export function TaskDetailSidebar({ task, profiles, columns, isAdmin, canEdit, onClose, onUpdate, onDelete }) {
  const update = (patch) => canEdit && onUpdate(patch);

  return (
    <>
      <div className="task-detail-overlay" onClick={onClose} />
      <aside className="task-detail-sidebar" role="dialog" aria-label="Detalhes da tarefa">
        <div className="detail-header">
          <h2>Detalhes da tarefa</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="detail-body">
          <div className="detail-field">
            <label className="detail-field-label">Título</label>
            <input
              className="detail-input detail-title-input"
              value={task.title}
              onChange={(e) => update({ title: e.target.value })}
              disabled={!canEdit}
            />
          </div>

          <div className="detail-field">
            <label className="detail-field-label">Texto da solicitação</label>
            <textarea
              className="detail-textarea"
              placeholder="Cole aqui a copy ou descreva o que precisa ser feito..."
              value={task.description || ''}
              onChange={(e) => update({ description: e.target.value })}
              disabled={!canEdit}
            />
          </div>

          <div className="field-row">
            <div className="detail-field">
              <label className="detail-field-label">Link de referência</label>
              <input
                className="detail-input"
                placeholder="https://..."
                value={task.reference_link || ''}
                onChange={(e) => update({ reference_link: e.target.value })}
                disabled={!canEdit}
              />
            </div>
            <div className="detail-field">
              <label className="detail-field-label">Link do Drive</label>
              <input
                className="detail-input"
                placeholder="https://drive.google.com/..."
                value={task.drive_link || ''}
                onChange={(e) => update({ drive_link: e.target.value })}
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="field-row">
            <div className="detail-field">
              <label className="detail-field-label">Status</label>
              <select
                className="detail-select"
                value={task.column_id || ''}
                onChange={(e) => update({ column_id: e.target.value })}
                disabled={!canEdit}
              >
                {columns.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="detail-field">
              <label className="detail-field-label">Prioridade</label>
              <select
                className="detail-select"
                value={task.priority}
                onChange={(e) => update({ priority: e.target.value })}
                disabled={!canEdit}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="detail-field">
              <label className="detail-field-label">Data de entrega</label>
              <input
                type="date"
                className="detail-input"
                value={task.due_date || ''}
                onChange={(e) => update({ due_date: e.target.value })}
                disabled={!canEdit}
              />
            </div>
            <div className="detail-field">
              <label className="detail-field-label">Destinatário</label>
              {isAdmin ? (
                <select
                  className="detail-select"
                  value={task.assigned_to || ''}
                  onChange={(e) => update({ assigned_to: e.target.value })}
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  className="detail-input"
                  value={profiles.find(p => p.id === task.assigned_to)?.name || ''}
                  disabled
                />
              )}
            </div>
          </div>
        </div>

        <div className="detail-footer">
          {canEdit ? (
            <button className="btn-danger" onClick={onDelete}>
              <Trash2 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Excluir
            </button>
          ) : <span />}
          <button className="btn-secondary" onClick={onClose}>Fechar</button>
        </div>
      </aside>
    </>
  );
}
