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

export function TaskList({ tasks, columns, profiles, onSelectTask }) {
  const getColumnName = (id) => columns.find(c => c.id === id)?.name || '—';

  return (
    <div className="list-container">
      <table className="list-table">
        <thead>
          <tr>
            <th>Tarefa</th>
            <th>Status</th>
            <th>Prioridade</th>
            <th>Data de Entrega</th>
            <th>Destinatário</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => {
            const assignee = profiles.find(p => p.id === task.assigned_to);
            return (
              <tr key={task.id} onClick={() => onSelectTask(task.id)}>
                <td style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {!task.seen_at && <span className="new-pill" style={{ marginRight: 8 }}>Novo</span>}
                  {task.title}
                </td>
                <td>
                  <span className="badge" style={{
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text-primary)'
                  }}>
                    {getColumnName(task.column_id)}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${task.priority}`}>
                    {task.priority === 'low' ? 'Baixa' : task.priority === 'medium' ? 'Média' : 'Alta'}
                  </span>
                </td>
                <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  {formatDate(task.due_date)}
                </td>
                <td>
                  {assignee && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img
                        src={avatarFor(assignee.name)}
                        alt={assignee.name}
                        style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                      />
                      <span style={{ fontSize: '0.875rem' }}>{assignee.name}</span>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
          {tasks.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '2rem' }}>
                Nenhuma tarefa neste quadro ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
