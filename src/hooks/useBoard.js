import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase';

export function useBoard(ownerId) {
  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!ownerId) return;
    setLoading(true);
    setError(null);
    try {
      const { data: boardRow, error: boardErr } = await supabase
        .from('boards')
        .select('*')
        .eq('owner_id', ownerId)
        .single();
      if (boardErr) throw boardErr;
      setBoard(boardRow);

      const [colsRes, tasksRes, profsRes] = await Promise.all([
        supabase.from('columns').select('*').eq('board_id', boardRow.id).order('position'),
        supabase.from('tasks').select('*').eq('board_id', boardRow.id).order('position'),
        supabase.from('profiles').select('id,name,role').order('name'),
      ]);
      if (colsRes.error) throw colsRes.error;
      if (tasksRes.error) throw tasksRes.error;
      if (profsRes.error) throw profsRes.error;

      setColumns(colsRes.data || []);
      setTasks(tasksRes.data || []);
      setProfiles(profsRes.data || []);
    } catch (e) {
      console.error('useBoard:', e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [ownerId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, [fetchAll]);

  const createTask = async (data) => {
    if (!board) return;
    const firstCol = columns[0];
    const payload = {
      board_id: board.id,
      column_id: data.column_id ?? firstCol?.id ?? null,
      title: data.title,
      description: data.description || null,
      reference_link: data.reference_link || null,
      drive_link: data.drive_link || null,
      priority: data.priority || 'medium',
      due_date: data.due_date || null,
      assigned_to: data.assigned_to || board.owner_id,
      created_by: data.created_by || null,
      position: tasks.length,
    };
    const { error: err } = await supabase.from('tasks').insert(payload);
    if (err) throw err;
    await fetchAll();
  };

  const updateTask = async (id, patch) => {
    const { error: err } = await supabase.from('tasks').update(patch).eq('id', id);
    if (err) throw err;
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...patch } : t)));
  };

  const deleteTask = async (id) => {
    const { error: err } = await supabase.from('tasks').delete().eq('id', id);
    if (err) throw err;
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const moveTask = async (taskId, newColumnId) => {
    await updateTask(taskId, { column_id: newColumnId });
  };

  const markTaskSeen = async (taskId) => {
    const t = tasks.find(x => x.id === taskId);
    if (!t || t.seen_at) return;
    await updateTask(taskId, { seen_at: new Date().toISOString() });
  };

  const addColumn = async (name) => {
    if (!board) return;
    const position = columns.length ? Math.max(...columns.map(c => c.position)) + 1 : 0;
    const { error: err } = await supabase
      .from('columns')
      .insert({ board_id: board.id, name, position, is_done: false });
    if (err) throw err;
    await fetchAll();
  };

  const updateColumn = async (id, patch) => {
    const { error: err } = await supabase.from('columns').update(patch).eq('id', id);
    if (err) throw err;
    setColumns(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)));
  };

  const deleteColumn = async (id, moveTasksTo) => {
    if (moveTasksTo) {
      const { error: moveErr } = await supabase
        .from('tasks')
        .update({ column_id: moveTasksTo })
        .eq('column_id', id);
      if (moveErr) throw moveErr;
    }
    const { error: err } = await supabase.from('columns').delete().eq('id', id);
    if (err) throw err;
    await fetchAll();
  };

  return {
    board,
    columns,
    tasks,
    profiles,
    loading,
    error,
    refetch: fetchAll,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    markTaskSeen,
    addColumn,
    updateColumn,
    deleteColumn,
  };
}
