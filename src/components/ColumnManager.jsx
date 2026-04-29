import { useState } from 'react';
import { Pencil, Trash2, Check, X, Plus, CheckCircle2 } from 'lucide-react';

export function ColumnHeader({ column, count, canManage, onRename, onDelete, onToggleDone }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(column.name);

  const commit = async () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== column.name) {
      await onRename(trimmed);
    } else {
      setName(column.name);
    }
    setEditing(false);
  };

  return (
    <div className="column-header">
      <span className={`column-header-dot ${column.is_done ? 'done' : ''}`}
            style={!column.is_done ? { backgroundColor: column.color || 'var(--color-text-secondary)' } : undefined} />

      {editing ? (
        <input
          autoFocus
          className="column-name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') { setName(column.name); setEditing(false); }
          }}
          onBlur={commit}
        />
      ) : (
        <span className="column-name" onDoubleClick={() => canManage && setEditing(true)}>
          {column.name}
        </span>
      )}

      <span className="column-count">{count}</span>

      {canManage && !editing && (
        <div className="column-actions">
          <button
            className="column-action-btn"
            onClick={() => onToggleDone(!column.is_done)}
            title={column.is_done ? 'Marcar como não-final' : 'Marcar como etapa final (Done)'}
          >
            <CheckCircle2 size={14} className={column.is_done ? 'is-done-active' : ''} />
          </button>
          <button className="column-action-btn" onClick={() => setEditing(true)} title="Renomear">
            <Pencil size={14} />
          </button>
          <button className="column-action-btn column-action-danger" onClick={onDelete} title="Remover">
            <Trash2 size={14} />
          </button>
        </div>
      )}
      {canManage && editing && (
        <div className="column-actions">
          <button className="column-action-btn" onMouseDown={(e) => e.preventDefault()} onClick={commit} title="Salvar">
            <Check size={14} />
          </button>
          <button className="column-action-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => { setName(column.name); setEditing(false); }} title="Cancelar">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export function AddColumn({ onAdd }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setAdding(false); return; }
    await onAdd(trimmed);
    setName('');
    setAdding(false);
  };

  if (!adding) {
    return (
      <button className="add-column-btn" onClick={() => setAdding(true)}>
        <Plus size={16} />
        <span>Adicionar etapa</span>
      </button>
    );
  }

  return (
    <div className="add-column-form">
      <input
        autoFocus
        placeholder="Nome da etapa"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') { setName(''); setAdding(false); }
        }}
      />
      <div className="add-column-actions">
        <button className="btn-primary" onClick={submit}>Adicionar</button>
        <button className="btn-secondary" onClick={() => { setName(''); setAdding(false); }}>Cancelar</button>
      </div>
    </div>
  );
}

export function DeleteColumnDialog({ column, otherColumns, taskCount, onConfirm, onCancel }) {
  const [target, setTarget] = useState(otherColumns[0]?.id || '');

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <h2>Remover etapa "{column.name}"</h2>
        </div>
        <div className="modal-body">
          {taskCount > 0 ? (
            <>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                Esta etapa contém <strong>{taskCount}</strong> tarefa(s). Para qual etapa devemos mover essas tarefas antes de excluir?
              </p>
              <div className="detail-field">
                <label className="detail-field-label">Mover tarefas para</label>
                <select className="detail-select" value={target} onChange={(e) => setTarget(e.target.value)}>
                  {otherColumns.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              Esta etapa está vazia. Confirma a remoção?
            </p>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className="btn-danger" onClick={() => onConfirm(taskCount > 0 ? target : null)}>
            Remover
          </button>
        </div>
      </div>
    </div>
  );
}
