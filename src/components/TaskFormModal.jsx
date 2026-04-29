import { useState } from 'react';
import { X } from 'lucide-react';

export function TaskFormModal({
  profiles, columns, isAdmin, currentUserId, defaultAssigneeId,
  onClose, onCreate
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    reference_link: '',
    drive_link: '',
    column_id: columns[0]?.id || '',
    priority: 'medium',
    due_date: '',
    assigned_to: defaultAssigneeId || currentUserId,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = (patch) => setForm(prev => ({ ...prev, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await onCreate({
        title: form.title.trim(),
        description: form.description.trim(),
        reference_link: form.reference_link.trim(),
        drive_link: form.drive_link.trim(),
        column_id: form.column_id || null,
        priority: form.priority,
        due_date: form.due_date || null,
        assigned_to: isAdmin ? form.assigned_to : currentUserId,
      });
    } catch (err) {
      setError(err.message || 'Erro ao criar tarefa.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal-card" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>Nova tarefa</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-field">
            <label className="detail-field-label">Título *</label>
            <input
              className="detail-input"
              placeholder="Ex: Criar landing page"
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              autoFocus
              required
            />
          </div>

          <div className="detail-field">
            <label className="detail-field-label">Texto da solicitação</label>
            <textarea
              className="detail-textarea"
              placeholder="Descreva o que precisa ser feito, copy, contexto..."
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
            />
          </div>

          <div className="field-row">
            <div className="detail-field">
              <label className="detail-field-label">Link de referência</label>
              <input
                className="detail-input"
                placeholder="https://..."
                value={form.reference_link}
                onChange={(e) => update({ reference_link: e.target.value })}
              />
            </div>
            <div className="detail-field">
              <label className="detail-field-label">Link do Drive</label>
              <input
                className="detail-input"
                placeholder="https://drive.google.com/..."
                value={form.drive_link}
                onChange={(e) => update({ drive_link: e.target.value })}
              />
            </div>
          </div>

          <div className="field-row">
            <div className="detail-field">
              <label className="detail-field-label">Status</label>
              <select
                className="detail-select"
                value={form.column_id}
                onChange={(e) => update({ column_id: e.target.value })}
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
                value={form.priority}
                onChange={(e) => update({ priority: e.target.value })}
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
                value={form.due_date}
                onChange={(e) => update({ due_date: e.target.value })}
              />
            </div>
            <div className="detail-field">
              <label className="detail-field-label">Destinatário</label>
              {isAdmin ? (
                <select
                  className="detail-select"
                  value={form.assigned_to}
                  onChange={(e) => update({ assigned_to: e.target.value })}
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}{p.role === 'admin' ? ' (admin)' : ''}</option>
                  ))}
                </select>
              ) : (
                <input
                  className="detail-input"
                  value={(profiles.find(p => p.id === currentUserId)?.name) || 'Você'}
                  disabled
                  title="Colaboradores só podem se auto-atribuir tarefas"
                />
              )}
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Criando...' : 'Criar tarefa'}
          </button>
        </div>
      </form>
    </div>
  );
}
