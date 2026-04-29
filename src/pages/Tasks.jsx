import { useState } from 'react';
import { TaskBoard } from '../components/TaskBoard';
import { TaskList } from '../components/TaskList';
import { TaskDetailSidebar } from '../components/TaskDetailSidebar';
import { TaskFormModal } from '../components/TaskFormModal';
import { NewTasksAlert } from '../components/NewTasksAlert';
import { useBoard } from '../hooks/useBoard';
import './Tasks.css';

export function Tasks({ displayMode, viewingBoardOwnerId, currentUserId, isAdmin }) {
  const {
    board, columns, tasks, profiles, loading, error,
    createTask, updateTask, deleteTask, moveTask, markTaskSeen,
    addColumn, updateColumn, deleteColumn,
  } = useBoard(viewingBoardOwnerId);

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;
  const isOwnBoard = viewingBoardOwnerId === currentUserId;
  const canManageColumns = isAdmin || isOwnBoard;
  const canEditTasks = isAdmin || isOwnBoard;
  const boardOwner = profiles.find(p => p.id === viewingBoardOwnerId);

  const handleSelectTask = async (taskId) => {
    setSelectedTaskId(taskId);
    await markTaskSeen(taskId);
  };

  const handleCreate = async (data) => {
    const assigned_to = isAdmin ? (data.assigned_to || viewingBoardOwnerId) : currentUserId;
    await createTask({
      ...data,
      assigned_to,
      created_by: currentUserId,
    });
    setIsFormOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedTask) return;
    await deleteTask(selectedTask.id);
    setSelectedTaskId(null);
  };

  if (loading) {
    return (
      <div className="tasks-state">Carregando quadro...</div>
    );
  }
  if (error) {
    return (
      <div className="tasks-state tasks-state-error">
        Erro ao carregar: {error.message}
      </div>
    );
  }
  if (!board) {
    return <div className="tasks-state">Quadro não encontrado.</div>;
  }

  return (
    <div className="tasks-container">
      <NewTasksAlert tasks={tasks} currentUserId={currentUserId} />

      <div className="tasks-header-actions">
        {!isOwnBoard && boardOwner && (
          <div className="viewing-as">
            Visualizando o quadro de <strong>{boardOwner.name}</strong>
          </div>
        )}
        <button className="btn-primary" onClick={() => setIsFormOpen(true)}>
          + Nova Tarefa
        </button>
      </div>

      <div className="tasks-content">
        {displayMode === 'board' ? (
          <TaskBoard
            tasks={tasks}
            columns={columns}
            profiles={profiles}
            onSelectTask={handleSelectTask}
            onMoveTask={moveTask}
            canManageColumns={canManageColumns}
            onAddColumn={addColumn}
            onUpdateColumn={updateColumn}
            onDeleteColumn={deleteColumn}
            currentUserId={currentUserId}
          />
        ) : (
          <TaskList
            tasks={tasks}
            columns={columns}
            profiles={profiles}
            onSelectTask={handleSelectTask}
            currentUserId={currentUserId}
          />
        )}
      </div>

      {selectedTask && (
        <TaskDetailSidebar
          task={selectedTask}
          profiles={profiles}
          columns={columns}
          isAdmin={isAdmin}
          canEdit={canEditTasks}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={(patch) => updateTask(selectedTask.id, patch)}
          onDelete={handleDelete}
        />
      )}

      {isFormOpen && (
        <TaskFormModal
          profiles={profiles}
          columns={columns}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          defaultAssigneeId={isAdmin ? viewingBoardOwnerId : currentUserId}
          onClose={() => setIsFormOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
