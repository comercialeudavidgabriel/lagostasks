import { LayoutList, KanbanSquare, Search, Bell } from 'lucide-react';
import './Header.css';

export function Header({ title, currentView, taskDisplay, setTaskDisplay }) {
  return (
    <header className="header">
      <div className="header-left">
        <h2 className="page-title">{title}</h2>
      </div>
      
      <div className="header-right">
        {currentView === 'tasks' && (
          <div className="view-toggles">
            <button 
              className={`toggle-btn ${taskDisplay === 'board' ? 'active' : ''}`}
              onClick={() => setTaskDisplay('board')}
              title="Visualização em Kanban"
            >
              <KanbanSquare size={18} />
              <span>Board</span>
            </button>
            <button 
              className={`toggle-btn ${taskDisplay === 'list' ? 'active' : ''}`}
              onClick={() => setTaskDisplay('list')}
              title="Visualização em Lista"
            >
              <LayoutList size={18} />
              <span>Lista</span>
            </button>
          </div>
        )}
        
        <div className="header-actions">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Buscar..." className="search-input" />
          </div>
          <button className="btn-icon">
            <Bell size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
