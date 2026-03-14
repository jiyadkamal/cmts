import { useParams, Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import ProgressBar from '../components/ProgressBar'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  ListTodo,
  Package,
  TrendingUp,
  Building2,
  User
} from 'lucide-react'
import { formatCurrency, formatDate, getDaysRemainingText, getStatusColor, getPriorityColor } from '../utils/helpers'

function ProjectDetail() {
  const { id } = useParams()
  const { hasPermission } = useAuth()
  const { getProjectById, getTasksByProject, getBudgetByProject } = useData()

  const project = getProjectById(id)
  const tasks = getTasksByProject(id)
  const expenses = getBudgetByProject(id)

  if (!project) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <Building2 size={40} />
        </div>
        <h3 className="empty-state-title">Project not found</h3>
        <p className="empty-state-description">The project you're looking for doesn't exist.</p>
        <Link to="/projects" className="btn btn-primary">
          <ArrowLeft size={20} />
          Back to Projects
        </Link>
      </div>
    )
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const budgetUtilization = project.budget > 0 ? (totalExpenses / project.budget) * 100 : 0
  const completedTasks = tasks.filter(t => t.status === 'Completed').length
  const completedMilestones = project.milestones?.filter(m => m.status === 'Completed').length || 0
  const totalMilestones = project.milestones?.length || 0

  const getMilestoneIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 size={18} className="milestone-icon completed" />
      case 'In Progress':
        return <Clock size={18} className="milestone-icon in-progress" />
      default:
        return <Circle size={18} className="milestone-icon pending" />
    }
  }

  return (
    <div className="project-detail">
      <style>{`
        .project-detail {
          animation: fadeInUp var(--transition-slow) ease-out;
        }
        
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-sm);
          color: var(--neutral-400);
          margin-bottom: var(--space-6);
          transition: color var(--transition-fast);
        }
        
        .back-link:hover {
          color: var(--primary-400);
        }
        
        .project-hero {
          background: var(--card-gradient);
          border: 1px solid var(--neutral-800);
          border-radius: var(--radius-2xl);
          padding: var(--space-8);
          margin-bottom: var(--space-8);
          position: relative;
          overflow: hidden;
        }
        
        .project-hero::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, transparent 70%);
          transform: translate(30%, -30%);
        }
        
        .hero-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-6);
          position: relative;
          z-index: 1;
        }
        
        .hero-badges {
          display: flex;
          gap: var(--space-2);
        }
        
        .project-title {
          font-size: var(--font-size-4xl);
          font-weight: 700;
          margin-bottom: var(--space-2);
        }
        
        .project-client {
          font-size: var(--font-size-lg);
          color: var(--neutral-400);
          margin-bottom: var(--space-6);
        }
        
        .project-description {
          font-size: var(--font-size-base);
          color: var(--neutral-300);
          max-width: 800px;
          line-height: 1.7;
          margin-bottom: var(--space-8);
        }
        
        .hero-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-6);
        }
        
        @media (max-width: 900px) {
          .hero-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        .hero-stat {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        
        .hero-stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(249, 115, 22, 0.15);
          color: var(--primary-400);
        }
        
        .hero-stat-content {
          flex: 1;
        }
        
        .hero-stat-value {
          font-size: var(--font-size-xl);
          font-weight: 600;
          color: var(--neutral-50);
        }
        
        .hero-stat-label {
          font-size: var(--font-size-sm);
          color: var(--neutral-500);
        }
        
        .detail-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: var(--space-6);
        }
        
        @media (max-width: 1024px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .section-card {
          background: var(--card-gradient);
          border: 1px solid var(--neutral-800);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          margin-bottom: var(--space-6);
        }
        
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-5);
        }
        
        .section-title {
          font-size: var(--font-size-lg);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        
        .milestone-list {
          position: relative;
        }
        
        .milestone-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-4);
          padding: var(--space-4);
          background: var(--neutral-850);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-3);
          transition: all var(--transition-fast);
        }
        
        .milestone-item:hover {
          background: var(--neutral-800);
        }
        
        .milestone-item:last-child {
          margin-bottom: 0;
        }
        
        .milestone-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .milestone-icon.completed {
          color: var(--success-400);
        }
        
        .milestone-icon.in-progress {
          color: var(--primary-400);
        }
        
        .milestone-icon.pending {
          color: var(--neutral-600);
        }
        
        .milestone-content {
          flex: 1;
        }
        
        .milestone-name {
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--neutral-100);
          margin-bottom: var(--space-1);
        }
        
        .milestone-date {
          font-size: var(--font-size-xs);
          color: var(--neutral-500);
        }
        
        .task-list {
          max-height: 400px;
          overflow-y: auto;
        }
        
        .task-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-2);
          transition: background var(--transition-fast);
        }
        
        .task-item:hover {
          background: var(--neutral-850);
        }
        
        .task-status-icon {
          flex-shrink: 0;
        }
        
        .task-status-icon.completed {
          color: var(--success-400);
        }
        
        .task-status-icon.in-progress {
          color: var(--primary-400);
        }
        
        .task-status-icon.todo {
          color: var(--accent-400);
        }
        
        .task-info {
          flex: 1;
          min-width: 0;
        }
        
        .task-title {
          font-size: var(--font-size-sm);
          color: var(--neutral-200);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .task-meta {
          font-size: var(--font-size-xs);
          color: var(--neutral-500);
        }
        
        .budget-overview {
          margin-bottom: var(--space-6);
        }
        
        .budget-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) 0;
          border-bottom: 1px solid var(--neutral-800);
        }
        
        .budget-row:last-child {
          border-bottom: none;
        }
        
        .budget-label {
          font-size: var(--font-size-sm);
          color: var(--neutral-400);
        }
        
        .budget-value {
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--neutral-100);
        }
        
        .budget-value.primary {
          color: var(--primary-400);
        }
        
        .budget-value.success {
          color: var(--success-400);
        }
        
        .budget-value.danger {
          color: var(--danger-400);
        }
        
        
        .expense-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3);
          background: var(--neutral-850);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-2);
        }
        
        .expense-info {
          flex: 1;
        }
        
        .expense-desc {
          font-size: var(--font-size-sm);
          color: var(--neutral-200);
          margin-bottom: var(--space-1);
        }
        
        .expense-date {
          font-size: var(--font-size-xs);
          color: var(--neutral-500);
        }
        
        .expense-amount {
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--neutral-100);
        }
      `}</style>

      {/* Back Link */}
      <Link to="/projects" className="back-link">
        <ArrowLeft size={18} />
        Back to Projects
      </Link>

      {/* Hero Section */}
      <div className="project-hero">
        <div className="hero-header">
          <div>
            <h1 className="project-title">{project.name}</h1>
            <p className="project-client">{project.client}</p>
          </div>
          <div className="hero-badges">
            <span className={`badge badge-${getStatusColor(project.status)}`}>
              {project.status}
            </span>
            <span className={`badge badge-${getPriorityColor(project.priority)}`}>
              {project.priority} Priority
            </span>
          </div>
        </div>

        <p className="project-description">{project.description}</p>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-icon">
              <MapPin size={24} />
            </div>
            <div className="hero-stat-content">
              <div className="hero-stat-value">{project.location.split(',')[0]}</div>
              <div className="hero-stat-label">Location</div>
            </div>
          </div>

          <div className="hero-stat">
            <div className="hero-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-400)' }}>
              <Calendar size={24} />
            </div>
            <div className="hero-stat-content">
              <div className="hero-stat-value">{formatDate(project.endDate)}</div>
              <div className="hero-stat-label">{getDaysRemainingText(project.endDate)}</div>
            </div>
          </div>

          <div className="hero-stat">
            <div className="hero-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success-400)' }}>
              <DollarSign size={24} />
            </div>
            <div className="hero-stat-content">
              <div className="hero-stat-value">{formatCurrency(project.budget)}</div>
              <div className="hero-stat-label">Total Budget</div>
            </div>
          </div>

        </div>
      </div>

      {/* Detail Grid */}
      <div className="detail-grid">
        <div className="detail-main">
          {/* Milestones */}
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">
                <CheckCircle2 size={20} style={{ color: 'var(--success-400)' }} />
                Milestones
              </h2>
              <span className="text-sm text-muted">
                {completedMilestones}/{totalMilestones} completed
              </span>
            </div>

            <div className="milestone-list">
              {project.milestones?.map((milestone) => (
                <div key={milestone.id} className="milestone-item">
                  {getMilestoneIcon(milestone.status)}
                  <div className="milestone-content">
                    <div className="milestone-name">{milestone.name}</div>
                    <div className="milestone-date">Due: {formatDate(milestone.date)}</div>
                  </div>
                  <span className={`badge badge-${getStatusColor(milestone.status)}`}>
                    {milestone.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">
                <ListTodo size={20} style={{ color: 'var(--accent-400)' }} />
                Related Tasks
              </h2>
              <Link to="/tasks" className="btn btn-secondary btn-sm">
                View All
              </Link>
            </div>

            <div className="task-list">
              {tasks.length > 0 ? tasks.map((task) => (
                <div key={task.id} className="task-item">
                  {task.status === 'Completed' ? (
                    <CheckCircle2 size={18} className="task-status-icon completed" />
                  ) : task.status === 'In Progress' ? (
                    <Clock size={18} className="task-status-icon in-progress" />
                  ) : (
                    <Circle size={18} className="task-status-icon todo" />
                  )}
                  <div className="task-info">
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta">{task.assignee} • Due {formatDate(task.dueDate)}</div>
                  </div>
                  <span className={`badge badge-${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              )) : (
                <p className="text-muted text-sm" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                  No tasks assigned to this project yet.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="detail-sidebar">
          {/* Budget Overview */}
          {hasPermission('view_budget') && (
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  <DollarSign size={20} style={{ color: 'var(--success-400)' }} />
                  Budget
                </h2>
              </div>

              <div className="budget-overview">
                <div className="budget-row">
                  <span className="budget-label">Total Budget</span>
                  <span className="budget-value">{formatCurrency(project.budget)}</span>
                </div>
                <div className="budget-row">
                  <span className="budget-label">Spent</span>
                  <span className="budget-value primary">{formatCurrency(totalExpenses)}</span>
                </div>
                <div className="budget-row">
                  <span className="budget-label">Remaining</span>
                  <span className={`budget-value ${project.budget - totalExpenses < 0 ? 'danger' : 'success'}`}>
                    {formatCurrency(project.budget - totalExpenses)}
                  </span>
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-label">
                  <span className="text-muted">Utilization</span>
                  <span>{budgetUtilization.toFixed(0)}%</span>
                </div>
                <ProgressBar
                  value={budgetUtilization}
                  variant={budgetUtilization > 90 ? 'danger' : budgetUtilization > 70 ? 'warning' : 'success'}
                />
              </div>
            </div>
          )}

          {/* Project Manager */}
          <div className="section-card">
            <div className="section-header">
              <h2 className="section-title">
                <User size={20} style={{ color: 'var(--primary-400)' }} />
                Project Manager
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div className="avatar" style={{ background: 'var(--accent-gradient)' }}>
                {project.manager?.split(' ').map(n => n[0]).join('') || 'PM'}
              </div>
              <div>
                <div style={{ fontWeight: 500, color: 'var(--neutral-100)' }}>{project.manager || 'Not assigned'}</div>
                <div className="text-sm text-muted">Project Manager</div>
              </div>
            </div>
          </div>

          {/* Recent Expenses */}
          {hasPermission('view_budget') && expenses.length > 0 && (
            <div className="section-card">
              <div className="section-header">
                <h2 className="section-title">
                  Recent Expenses
                </h2>
              </div>

              <div>
                {expenses.slice(0, 4).map((expense) => (
                  <div key={expense.id} className="expense-item">
                    <div className="expense-info">
                      <div className="expense-desc">{expense.description.slice(0, 30)}...</div>
                      <div className="expense-date">{formatDate(expense.date)}</div>
                    </div>
                    <span className="expense-amount">{formatCurrency(expense.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail
