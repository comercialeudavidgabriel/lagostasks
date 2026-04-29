import { useState } from 'react';
import { TaskCard } from './TaskCard';
import { ColumnHeader, AddColumn, DeleteColumnDialog } from './ColumnManager';

export function TaskBoard({
  tasks, columns, profiles,
  onSelectTask, onMoveTask,
  canManageColumns,
  onAddColumn, onUpdateColumn, onDeleteColumn,
}) {
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [columnPendingDelete, setColumnPendingDelete] = useState(null);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) setDragOverColumn(columnId);
  };

  const handleDragLeave = (e, columnId) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (dragOverColumn === columnId) setDragOverColumn(null);
  };

  const handleDrop = async (e, columnId) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      try { await onMoveTask(taskId, columnId); }
      catch (err) { console.error('Erro ao mover task:', err); }
    }
    setDragOverColumn(null);
  };

  const requestDelete = (column) => {
    setColumnPendingDelete(column);
  };

  const confirmDelete = async (moveTo) => {
    if (!columnPendingDelete) return;
    try {
      await onDeleteColumn(columnPendingDelete.id, moveTo);
    } catch (err) {
      console.error('Erro ao remover coluna:', err);
    }
    setColumnPendingDelete(null);
  };

  return (
    <>
      <div className="board-container">
        {columns.map(column => {
          const columnTasks = tasks.filter(task => task.column_id === column.id);
          const isOver = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              className={`board-column ${isOver ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={(e) => handleDragLeave(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <ColumnHeader
                column={column}
                count={columnTasks.length}
                canManage={canManageColumns}
                onRename={(name) => onUpdateColumn(column.id, { name })}
                onDelete={() => requestDelete(column)}
                onToggleDone={(is_done) => onUpdateColumn(column.id, { is_done })}
              />

              <div className="column-cards">
                {columnTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    profiles={profiles}
                    onClick={() => onSelectTask(task.id)}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  />
                ))}
                {columnTasks.length === 0 && (
                  <div className="column-empty">Solte uma tarefa aqui</div>
                )}
              </div>
            </div>
          );
        })}

        {canManageColumns && (
          <div className="board-column board-column-add">
            <AddColumn onAdd={onAddColumn} />
          </div>
        )}
      </div>

      {columnPendingDelete && (
        <DeleteColumnDialog
          column={columnPendingDelete}
          otherColumns={columns.filter(c => c.id !== columnPendingDelete.id)}
          taskCount={tasks.filter(t => t.column_id === columnPendingDelete.id).length}
          onConfirm={confirmDelete}
          onCancel={() => setColumnPendingDelete(null)}
        />
      )}
    </>
  );
}
