import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import Modal from '../components/Modal'
import {
    Plus,
    Search,
    Filter,
    Calendar,
    Clock,
    User,
    CheckCircle2,
    Circle,
    AlertCircle,
    MoreVertical,
    Edit,
    Trash2,
    Flag
} from 'lucide-react'
import { formatDate, getPriorityColor, getStatusColor } from '../utils/helpers'

function Tasks() {
    const { hasPermission, user } = useAuth()
    const { tasks, projects, addTask, updateTask, deleteTask, users, selectedProjectId } = useData()
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTask, setEditingTask] = useState(null)
    const [activeMenu, setActiveMenu] = useState(null)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        projectId: '',
        status: 'Todo',
        priority: 'Medium',
        assignee: '',
        assigneeId: '',
        dueDate: '',
        estimatedHours: ''
    })

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesProject = !selectedProjectId || task.projectId === selectedProjectId
        return matchesSearch && matchesProject
    })

    const todoTasks = filteredTasks.filter(t => t.status === 'Todo')
    const inProgressTasks = filteredTasks.filter(t => t.status === 'In Progress')
    const completedTasks = filteredTasks.filter(t => t.status === 'Completed')

    const handleOpenModal = (task = null) => {
        if (task) {
            setEditingTask(task)
            setFormData({
                title: task.title,
                description: task.description || '',
                projectId: task.projectId.toString(),
                status: task.status,
                priority: task.priority,
                assignee: task.assignee,
                assigneeId: task.assigneeId?.toString() || '',
                dueDate: task.dueDate,
                estimatedHours: task.estimatedHours?.toString() || ''
            })
        } else {
            setEditingTask(null)
            setFormData({
                title: '',
                description: '',
                projectId: selectedProjectId || '',
                status: 'Todo',
                priority: 'Medium',
                assignee: '',
                assigneeId: '',
                dueDate: '',
                estimatedHours: ''
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const taskData = {
            ...formData,
            projectId: formData.projectId, // Assuming Firestore IDs are strings now
            assigneeId: formData.assigneeId || null,
            estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null
        }

        try {
            if (editingTask) {
                await updateTask({ ...editingTask, ...taskData })
            } else {
                await addTask(taskData)
            }
            setIsModalOpen(false)
        } catch (err) {
            console.error('Error saving task:', err)
            alert('Failed to save task. Please try again.')
        }
    }

    const handleStatusChange = async (task, newStatus) => {
        try {
            await updateTask({ ...task, status: newStatus })
        } catch (err) {
            console.error('Error updating task status:', err)
        }
        setActiveMenu(null)
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteTask(id)
            } catch (err) {
                console.error('Error deleting task:', err)
                alert('Failed to delete task. Please try again.')
            }
        }
        setActiveMenu(null)
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed':
                return <CheckCircle2 size={16} style={{ color: 'var(--success-400)' }} />
            case 'In Progress':
                return <Clock size={16} style={{ color: 'var(--primary-400)' }} />
            default:
                return <Circle size={16} style={{ color: 'var(--accent-400)' }} />
        }
    }

    const getProjectName = (projectId) => {
        const project = projects.find(p => p.id === projectId)
        return project?.name || 'Unknown Project'
    }

    const TaskCard = ({ task }) => (
        <div className="kanban-card">
            <div className="card-header">
                <span className={`badge badge-${getPriorityColor(task.priority)}`}>
                    <Flag size={10} style={{ marginRight: '4px' }} />
                    {task.priority}
                </span>
                {hasPermission('update_tasks') && (
                    <div className="card-actions">
                        <button
                            className="actions-btn"
                            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === task.id ? null : task.id); }}
                        >
                            <MoreVertical size={16} />
                        </button>
                        {activeMenu === task.id && (
                            <div className="actions-menu" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => handleOpenModal(task)}>
                                    <Edit size={14} /> Edit
                                </button>
                                <div className="menu-divider"></div>
                                <button onClick={() => handleStatusChange(task, 'Todo')} disabled={task.status === 'Todo'}>
                                    <Circle size={14} /> Set Todo
                                </button>
                                <button onClick={() => handleStatusChange(task, 'In Progress')} disabled={task.status === 'In Progress'}>
                                    <Clock size={14} /> Set In Progress
                                </button>
                                <button onClick={() => handleStatusChange(task, 'Completed')} disabled={task.status === 'Completed'}>
                                    <CheckCircle2 size={14} /> Set Completed
                                </button>
                                <div className="menu-divider"></div>
                                <button className="danger" onClick={() => handleDelete(task.id)}>
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <h4 className="kanban-card-title">{task.title}</h4>

            <p className="card-description">{task.description?.slice(0, 80)}{task.description?.length > 80 ? '...' : ''}</p>

            <div className="card-project">
                {getProjectName(task.projectId)}
            </div>

            <div className="kanban-card-meta">
                <div className="card-meta-item">
                    <User size={14} />
                    <span>{task.assignee}</span>
                </div>
                <div className="card-meta-item">
                    <Calendar size={14} />
                    <span>{formatDate(task.dueDate)}</span>
                </div>
            </div>
        </div>
    )

    return (
        <div className="tasks-page">
            <style>{`
        .tasks-page {
          animation: fadeInUp var(--transition-slow) ease-out;
        }
        
        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-8);
          flex-wrap: wrap;
          gap: var(--space-4);
        }
        
        .page-title-section h1 {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          margin-bottom: var(--space-2);
        }
        
        .page-title-section p {
          color: var(--neutral-400);
        }
        
        .filters-row {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
          flex-wrap: wrap;
        }
        
        .search-box {
          flex: 1;
          max-width: 300px;
        }
        
        .filter-select {
          padding: var(--space-3) var(--space-4);
          padding-right: 40px;
          background: var(--neutral-850);
          border: 1px solid var(--neutral-700);
          border-radius: var(--radius-lg);
          color: var(--neutral-100);
          font-size: var(--font-size-sm);
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
        }
        
        .task-stats {
          display: flex;
          gap: var(--space-4);
          margin-left: auto;
        }
        
        .task-stat {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          background: var(--neutral-850);
          border-radius: var(--radius-lg);
          font-size: var(--font-size-sm);
        }
        
        .kanban-board {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-6);
          min-height: 600px;
        }
        
        @media (max-width: 1024px) {
          .kanban-board {
            grid-template-columns: 1fr;
          }
        }
        
        .kanban-column {
          background: var(--neutral-900);
          border: 1px solid var(--neutral-800);
          border-radius: var(--radius-xl);
          padding: var(--space-4);
        }
        
        .kanban-column.todo {
          border-top: 3px solid var(--accent-500);
        }
        
        .kanban-column.in-progress {
          border-top: 3px solid var(--primary-500);
        }
        
        .kanban-column.completed {
          border-top: 3px solid var(--success-500);
        }
        
        .kanban-column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-4);
          padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--neutral-800);
        }
        
        .kanban-column-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-sm);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .kanban-column-count {
          background: var(--neutral-800);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-full);
          font-size: var(--font-size-xs);
          color: var(--neutral-400);
        }
        
        .kanban-cards {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          min-height: 200px;
        }
        
        .kanban-card {
          background: var(--neutral-850);
          border: 1px solid var(--neutral-700);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          cursor: pointer;
          transition: all var(--transition-fast);
          position: relative;
        }
        
        .kanban-card:hover {
          border-color: var(--primary-500);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
        
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-3);
        }
        
        .card-actions {
          position: relative;
        }
        
        .actions-btn {
          padding: var(--space-1);
          background: transparent;
          border: none;
          color: var(--neutral-500);
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }
        
        .actions-btn:hover {
          background: var(--neutral-700);
          color: var(--neutral-200);
        }
        
        .actions-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: var(--neutral-850);
          border: 1px solid var(--neutral-700);
          border-radius: var(--radius-lg);
          padding: var(--space-2);
          min-width: 160px;
          z-index: var(--z-dropdown);
          box-shadow: var(--shadow-xl);
        }
        
        .actions-menu button {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          width: 100%;
          padding: var(--space-2) var(--space-3);
          background: transparent;
          border: none;
          color: var(--neutral-300);
          font-size: var(--font-size-sm);
          cursor: pointer;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }
        
        .actions-menu button:hover:not(:disabled) {
          background: var(--neutral-800);
          color: var(--neutral-100);
        }
        
        .actions-menu button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .actions-menu button.danger:hover {
          background: rgba(239, 68, 68, 0.15);
          color: var(--danger-400);
        }
        
        .menu-divider {
          height: 1px;
          background: var(--neutral-700);
          margin: var(--space-2) 0;
        }
        
        .kanban-card-title {
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--neutral-100);
          margin-bottom: var(--space-2);
          line-height: 1.4;
        }
        
        .card-description {
          font-size: var(--font-size-xs);
          color: var(--neutral-500);
          margin-bottom: var(--space-3);
          line-height: 1.5;
        }
        
        .card-project {
          font-size: var(--font-size-xs);
          color: var(--primary-400);
          background: rgba(249, 115, 22, 0.1);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
          display: inline-block;
          margin-bottom: var(--space-3);
        }
        
        .kanban-card-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: var(--font-size-xs);
          color: var(--neutral-500);
        }
        
        .card-meta-item {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }
        
        .empty-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-8);
          text-align: center;
          color: var(--neutral-600);
        }
        
        .empty-column-icon {
          margin-bottom: var(--space-3);
        }
        
        .empty-column-text {
          font-size: var(--font-size-sm);
        }
      `}</style>

            {/* Header */}
            <div className="page-header">
                <div className="page-title-section">
                    <h1>Tasks</h1>
                    <p>Manage and track all construction tasks</p>
                </div>
                {hasPermission('create_tasks') && (
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        New Task
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="filters-row">
                <div className="search-box">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Local filter removed in favor of global selector */}

                <div className="task-stats">
                    <div className="task-stat">
                        <Circle size={14} style={{ color: 'var(--accent-400)' }} />
                        <span>{todoTasks.length} Todo</span>
                    </div>
                    <div className="task-stat">
                        <Clock size={14} style={{ color: 'var(--primary-400)' }} />
                        <span>{inProgressTasks.length} In Progress</span>
                    </div>
                    <div className="task-stat">
                        <CheckCircle2 size={14} style={{ color: 'var(--success-400)' }} />
                        <span>{completedTasks.length} Completed</span>
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="kanban-board">
                {/* Todo Column */}
                <div className="kanban-column todo">
                    <div className="kanban-column-header">
                        <div className="kanban-column-title">
                            <Circle size={16} style={{ color: 'var(--accent-400)' }} />
                            Todo
                        </div>
                        <span className="kanban-column-count">{todoTasks.length}</span>
                    </div>
                    <div className="kanban-cards">
                        {todoTasks.length > 0 ? todoTasks.map(task => (
                            <TaskCard key={task.id} task={task} />
                        )) : (
                            <div className="empty-column">
                                <Circle size={32} className="empty-column-icon" />
                                <span className="empty-column-text">No tasks to do</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* In Progress Column */}
                <div className="kanban-column in-progress">
                    <div className="kanban-column-header">
                        <div className="kanban-column-title">
                            <Clock size={16} style={{ color: 'var(--primary-400)' }} />
                            In Progress
                        </div>
                        <span className="kanban-column-count">{inProgressTasks.length}</span>
                    </div>
                    <div className="kanban-cards">
                        {inProgressTasks.length > 0 ? inProgressTasks.map(task => (
                            <TaskCard key={task.id} task={task} />
                        )) : (
                            <div className="empty-column">
                                <Clock size={32} className="empty-column-icon" />
                                <span className="empty-column-text">No tasks in progress</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Completed Column */}
                <div className="kanban-column completed">
                    <div className="kanban-column-header">
                        <div className="kanban-column-title">
                            <CheckCircle2 size={16} style={{ color: 'var(--success-400)' }} />
                            Completed
                        </div>
                        <span className="kanban-column-count">{completedTasks.length}</span>
                    </div>
                    <div className="kanban-cards">
                        {completedTasks.length > 0 ? completedTasks.map(task => (
                            <TaskCard key={task.id} task={task} />
                        )) : (
                            <div className="empty-column">
                                <CheckCircle2 size={32} className="empty-column-icon" />
                                <span className="empty-column-text">No completed tasks</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTask ? 'Edit Task' : 'Create New Task'}
                size="large"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleSubmit}>
                            {editingTask ? 'Save Changes' : 'Create Task'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Task Title *</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Enter task title"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-textarea"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Task description..."
                            rows={3}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label className="form-label">Project *</label>
                            <select
                                className="form-select"
                                value={formData.projectId}
                                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                required
                            >
                                <option value="">Select project</option>
                                {projects.map(project => (
                                    <option key={project.id} value={project.id}>{project.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                className="form-select"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Todo">Todo</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select
                                className="form-select"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Due Date *</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label className="form-label">Assignee</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.assignee}
                                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                                placeholder="Assignee name"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Estimated Hours</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.estimatedHours}
                                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                                placeholder="0"
                                min="0"
                            />
                        </div>
                    </div>
                </form>
            </Modal>
        </div >
    )
}

export default Tasks
