import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import Modal from '../components/Modal'
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Calendar,
    MapPin,
    Users,
    DollarSign,
    Clock,
    ArrowUpRight,
    Edit,
    Trash2,
    Eye,
    Building2
} from 'lucide-react'
import { formatCurrency, formatDate, getDaysRemainingText, getPriorityColor } from '../utils/helpers'

function Projects() {
    const { hasPermission, user } = useAuth()
    const { projects, addProject, updateProject, deleteProject, joinProject } = useData()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProject, setEditingProject] = useState(null)
    const [activeMenu, setActiveMenu] = useState(null)
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
    const [joinProjectId, setJoinProjectId] = useState('')

    const initialFormState = {
        name: '',
        client: '',
        manager: '',
        description: '',
        location: '',
        budget: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        priority: 'Medium',
        status: 'In Progress',
        milestones: []
    }

    const [formData, setFormData] = useState(initialFormState)

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.client.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const handleOpenModal = (project = null) => {
        if (project) {
            setEditingProject(project)
            setFormData({
                name: project.name,
                client: project.client,
                manager: project.manager || '',
                description: project.description || '',
                location: project.location,
                budget: project.budget,
                startDate: project.startDate,
                endDate: project.endDate,
                priority: project.priority || 'Medium',
                status: project.status || 'In Progress',
                milestones: project.milestones || []
            })
        } else {
            setEditingProject(null)
            setFormData(initialFormState)
        }
        setIsModalOpen(true)
    }


    const handleSubmit = async (e) => {
        e.preventDefault()
        const projectData = {
            ...formData,
            budget: parseFloat(formData.budget) || 0,
            status: 'In Progress',
            milestones: editingProject?.milestones || []
        }

        try {
            if (editingProject) {
                await updateProject({ ...editingProject, ...projectData })
            } else {
                await addProject(projectData)
            }
            setIsModalOpen(false)
        } catch (err) {
            console.error('Error saving project:', err)
            alert('Failed to save project. Please try again.')
        }
    }

    const handleJoinProject = async (e) => {
        e.preventDefault()
        if (!joinProjectId.trim()) return

        try {
            await joinProject(joinProjectId.trim())
            setIsJoinModalOpen(false)
            setJoinProjectId('')
            alert('Successfully joined the project!')
        } catch (err) {
            console.error('Error joining project:', err)
            alert(err.message || 'Failed to join project. Please check the ID.')
        }
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this project?')) {
            try {
                await deleteProject(id)
            } catch (err) {
                console.error('Error deleting project:', err)
                alert('Failed to delete project. Please try again.')
            }
        }
        setActiveMenu(null)
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed':
                return { background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success-400)' }
            case 'In Progress':
                return { background: 'rgba(249, 115, 22, 0.15)', color: 'var(--primary-400)' }
            case 'On Hold':
                return { background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning-400)' }
            default:
                return { background: 'var(--neutral-800)', color: 'var(--neutral-400)' }
        }
    }

    return (
        <div className="projects-page">
            <style>{`
        .projects-page {
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
          max-width: 400px;
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
        
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: var(--space-6);
        }
        
        .project-card {
          background: var(--card-gradient);
          border: 1px solid var(--neutral-800);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          transition: all var(--transition-base);
          position: relative;
        }
        
        .project-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--primary-gradient);
          opacity: 0;
          transition: opacity var(--transition-fast);
        }
        
        .project-card:hover {
          border-color: var(--neutral-700);
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
        }
        
        .project-card:hover::before {
          opacity: 1;
        }
        
        .project-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-4);
        }
        
        .project-icon {
          width: 48px;
          height: 48px;
          background: rgba(249, 115, 22, 0.15);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-400);
        }
        
        .project-actions {
          position: relative;
        }
        
        .actions-btn {
          padding: var(--space-2);
          background: transparent;
          border: none;
          color: var(--neutral-400);
          cursor: pointer;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }
        
        .actions-btn:hover {
          background: var(--neutral-800);
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
          min-width: 150px;
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
        
        .actions-menu button:hover {
          background: var(--neutral-800);
          color: var(--neutral-100);
        }
        
        .actions-menu button.danger:hover {
          background: rgba(239, 68, 68, 0.15);
          color: var(--danger-400);
        }
        
        .project-name {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--neutral-50);
          margin-bottom: var(--space-2);
        }
        
        .project-client {
          font-size: var(--font-size-sm);
          color: var(--neutral-400);
          margin-bottom: var(--space-4);
        }
        
        .project-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
          margin-bottom: var(--space-5);
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-sm);
          color: var(--neutral-400);
        }
        
        .meta-item svg {
          color: var(--neutral-500);
        }
        
        
        .project-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: var(--space-4);
          border-top: 1px solid var(--neutral-800);
        }
        
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: var(--space-1) var(--space-3);
          font-size: var(--font-size-xs);
          font-weight: 500;
          border-radius: var(--radius-full);
        }
        
        .view-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--font-size-sm);
          color: var(--primary-400);
          transition: all var(--transition-fast);
        }
        
        .view-link:hover {
          color: var(--primary-300);
          gap: var(--space-2);
        }
        

      `}</style>

            {/* Header */}
            <div className="page-header">
                <div className="page-title-section">
                    <h1>Projects</h1>
                    <p>Manage and track all your construction projects</p>
                </div>
                <div className="page-actions" style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    {user?.role !== 'Contractor' && user?.role !== 'Admin' && (
                        <button className="btn btn-secondary" onClick={() => setIsJoinModalOpen(true)}>
                            <Plus size={20} />
                            Join Project
                        </button>
                    )}
                    {hasPermission('create_projects') && (
                        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                            <Plus size={20} />
                            New Project
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="filters-row">
                <div className="search-box">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                </select>
            </div>

            {/* Projects Grid */}
            <div className="projects-grid">
                {filteredProjects.map((project, index) => (
                    <div
                        key={project.id}
                        className="project-card"
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className="project-header">
                            <div className="project-icon">
                                <Building2 size={24} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <div className="priority-indicator-static">
                                    <span className={`badge badge-${getPriorityColor(project.priority)}`}>
                                        {project.priority}
                                    </span>
                                </div>
                                {hasPermission('view_projects') && (
                                    <div className="project-actions">
                                        <button
                                            className="actions-btn"
                                            onClick={() => setActiveMenu(activeMenu === project.id ? null : project.id)}
                                        >
                                            <MoreVertical size={20} />
                                        </button>
                                        {activeMenu === project.id && (
                                            <div className="actions-menu">
                                                {hasPermission('create_projects') && (
                                                    <button onClick={() => { handleOpenModal(project); setActiveMenu(null); }}>
                                                        <Edit size={16} /> Edit
                                                    </button>
                                                )}
                                                <Link to={`/projects/${project.id}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%', padding: 'var(--space-2) var(--space-3)', color: 'var(--neutral-300)', fontSize: 'var(--font-size-sm)', borderRadius: 'var(--radius-md)' }}>
                                                    <Eye size={16} /> View Details
                                                </Link>
                                                {hasPermission('create_projects') && (
                                                    <button className="danger" onClick={() => handleDelete(project.id)}>
                                                        <Trash2 size={16} /> Delete
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <h3 className="project-name">{project.name}</h3>
                        <p className="project-client">{project.client}</p>

                        {project.ownerId === user?.id && (
                            <div className="project-id-badge" style={{
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--neutral-500)',
                                marginBottom: 'var(--space-4)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-2)',
                                cursor: 'help'
                            }} title="Share this ID with others to join">
                                <span>ID: {project.id}</span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(project.id)
                                        alert('Project ID copied to clipboard!')
                                    }}
                                    style={{ background: 'none', border: 'none', color: 'var(--primary-400)', cursor: 'pointer', padding: 0 }}
                                >
                                    Copy
                                </button>
                            </div>
                        )}

                        <div className="project-meta">
                            <div className="meta-item">
                                <MapPin size={16} />
                                <span>{project.location.split(',')[0]}</span>
                            </div>
                            <div className="meta-item">
                                <DollarSign size={16} />
                                <span>{formatCurrency(project.budget)}</span>
                            </div>
                            <div className="meta-item">
                                <Calendar size={16} />
                                <span>{formatDate(project.endDate)}</span>
                            </div>
                            <div className="meta-item">
                                <Clock size={16} />
                                <span>{getDaysRemainingText(project.endDate)}</span>
                            </div>
                        </div>


                        <div className="project-footer">
                            <span className="status-badge" style={getStatusStyle(project.status)}>
                                {project.status}
                            </span>
                            <Link to={`/projects/${project.id}`} className="view-link">
                                View Details <ArrowUpRight size={16} />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProjects.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <Building2 size={40} />
                    </div>
                    <h3 className="empty-state-title">No projects found</h3>
                    <p className="empty-state-description">
                        {searchTerm || statusFilter !== 'all'
                            ? "Try adjusting your search or filter criteria"
                            : "Get started by creating your first project"}
                    </p>
                    {hasPermission('create_projects') && !searchTerm && statusFilter === 'all' && (
                        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                            <Plus size={20} />
                            Create Project
                        </button>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProject ? 'Edit Project' : 'Create New Project'}
                size="large"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleSubmit}>
                            {editingProject ? 'Save Changes' : 'Create Project'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Project Name *</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter project name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            className="form-textarea"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Project description..."
                            rows={3}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label className="form-label">Client *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.client}
                                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                placeholder="Client name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Location</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="Project location"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label className="form-label">Start Date *</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">End Date *</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label className="form-label">Budget ($) *</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.budget}
                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                placeholder="0"
                                min="0"
                                required
                            />
                        </div>

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
                    </div>

                    <div className="form-group">
                        <label className="form-label">Project Manager</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.manager}
                            onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                            placeholder="Manager name"
                        />
                    </div>
                </form>
            </Modal>

            {/* Join Project Modal */}
            <Modal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
                title="Join Project"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setIsJoinModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleJoinProject} disabled={!joinProjectId.trim()}>
                            Join Project
                        </button>
                    </>
                }
            >
                <form onSubmit={handleJoinProject}>
                    <p style={{ color: 'var(--neutral-400)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
                        Enter the Project ID shared with you by the contractor to join and view project details.
                    </p>
                    <div className="form-group">
                        <label className="form-label">Project ID *</label>
                        <input
                            type="text"
                            className="form-input"
                            value={joinProjectId}
                            onChange={(e) => setJoinProjectId(e.target.value)}
                            placeholder="Enter project ID"
                            required
                        />
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default Projects
