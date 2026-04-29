import { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell, Legend
} from 'recharts';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabase';
import './Dashboard.css';

function startOfMonthIso() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function endOfMonthIso() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();
}

function classifyTask(task, columnsById) {
  const today = new Date(); today.setHours(0,0,0,0);
  const due = task.due_date ? new Date(task.due_date) : null;
  if (due) due.setHours(0,0,0,0);
  const col = task.column_id ? columnsById.get(task.column_id) : null;
  const isDoneCol = !!col?.is_done;
  const completed = task.completed_at ? new Date(task.completed_at) : null;

  if (isDoneCol) {
    if (due && completed && completed > due) return 'late_delivered';
    return 'done';
  }
  if (due && due < today) return 'overdue';
  if (!task.seen_at) return 'not_started';
  return 'in_progress';
}

const BUCKET_LABELS = {
  not_started:    { label: 'Não iniciadas',      color: '#94a3b8' },
  in_progress:    { label: 'Em andamento',       color: '#2563eb' },
  done:           { label: 'Feitas',             color: '#22c55e' },
  overdue:        { label: 'Atrasadas',          color: '#ef4444' },
  late_delivered: { label: 'Entregues atrasadas', color: '#f59e0b' },
};

export function Dashboard() {
  const { user, isAdmin, profile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const startIso = startOfMonthIso();
        const endIso = endOfMonthIso();

        let tasksQuery = supabase
          .from('tasks')
          .select('*')
          .gte('created_at', startIso)
          .lt('created_at', endIso);

        if (!isAdmin) {
          tasksQuery = tasksQuery.eq('assigned_to', user.id);
        }
        const { data: tasksData, error: tasksErr } = await tasksQuery;
        if (tasksErr) throw tasksErr;

        const { data: columnsData, error: colsErr } = await supabase
          .from('columns')
          .select('id,is_done,name,board_id');
        if (colsErr) throw colsErr;

        if (cancelled) return;
        setTasks(tasksData || []);
        setColumns(columnsData || []);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user, isAdmin]);

  const stats = useMemo(() => {
    const columnsById = new Map(columns.map(c => [c.id, c]));
    const counts = { not_started: 0, in_progress: 0, done: 0, overdue: 0, late_delivered: 0 };
    for (const t of tasks) {
      counts[classifyTask(t, columnsById)]++;
    }
    return counts;
  }, [tasks, columns]);

  const chartData = useMemo(() => (
    Object.entries(BUCKET_LABELS).map(([key, meta]) => ({
      key,
      name: meta.label,
      value: stats[key],
      fill: meta.color,
    }))
  ), [stats]);

  const monthName = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="dashboard">
      <div className="dashboard-greeting">
        <h2>Olá, {profile?.name}!</h2>
        <p>Resumo do mês de <strong>{monthName}</strong> {isAdmin ? '(todas as tarefas da operação)' : '(suas tarefas)'}.</p>
      </div>

      <div className="stat-grid">
        {Object.entries(BUCKET_LABELS).map(([key, meta]) => (
          <div key={key} className="stat-card" style={{ borderTopColor: meta.color }}>
            <div className="stat-label">{meta.label}</div>
            <div className="stat-value">{stats[key]}</div>
          </div>
        ))}
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h3>Tarefas do mês</h3>
          <span className="chart-sub">Reseta automaticamente no dia 1</span>
        </div>

        {loading ? (
          <div className="chart-empty">Carregando...</div>
        ) : error ? (
          <div className="chart-empty">Erro: {error.message}</div>
        ) : tasks.length === 0 ? (
          <div className="chart-empty">Nenhuma tarefa criada neste mês ainda.</div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  fontSize: '0.85rem',
                }}
              />
              <Legend />
              <Bar dataKey="value" name="Tarefas" radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.key} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
