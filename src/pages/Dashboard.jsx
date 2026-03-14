import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import {
  FolderKanban,
  ListTodo,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Calendar,
  Users
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { formatCurrency, formatDate, formatCompact, getStatusColor } from '../utils/helpers'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function Dashboard() {
  const { user, hasPermission } = useAuth()
  const {
    projects,
    tasks: allTasks,
    materials: allMaterials,
    budgets: allBudgets,
    selectedProjectId,
    selectedProject,
    getTotalBudget,
    getTotalExpenses
  } = useData()

  // Filter data based on selected project
  const tasks = selectedProjectId ? allTasks.filter(t => t.projectId === selectedProjectId) : []
  const materials = selectedProjectId ? allMaterials.filter(m => m.projectId === selectedProjectId) : []
  const budgets = selectedProjectId ? allBudgets.filter(b => b.projectId === selectedProjectId) : allBudgets

  const activeProjects = projects.filter(p => p.status === 'In Progress').length
  const completedProjects = projects.filter(p => p.status === 'Completed').length

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'Completed').length
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length

  // Low stock for selected project items
  const lowStockItems = materials.filter(m => m.quantity <= m.minStock).length

  // Budget stats
  // If a project is selected, show its specific budget and spent amount.
  // Otherwise, show the totals across all projects.
  const totalBudget = selectedProjectId
    ? (selectedProject?.budget || 0)
    : projects.reduce((sum, p) => sum + (p.budget || 0), 0)

  const totalExpenses = budgets.reduce((sum, b) => sum + (b.amount || 0), 0)
  const budgetUtilization = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0

  // Recent tasks
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  // Calculate Real Expense Trend (Last 6 Months)
  const getExpenseTrend = () => {
    const months = []
    const data = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = d.toLocaleString('default', { month: 'short' })
      months.push(monthName)

      // Sum expenses for this month
      const monthStart = d
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)

      const monthSum = budgets.reduce((sum, b) => {
        const expenseDate = new Date(b.date || b.createdAt)
        if (expenseDate >= monthStart && expenseDate <= monthEnd) {
          return sum + (b.amount || 0)
        }
        return sum
      }, 0)

      data.push(monthSum / 1000) // Convert to K for easier display if needed, or leave as is. 
      // Showing in K or M based on scale. Let's use actual values but scale them for the chart.
    }

    return { labels: months, data }
  }

  const trend = getExpenseTrend()

  const budgetTrendData = {
    labels: trend.labels,
    datasets: [{
      label: 'Expenses',
      data: trend.data,
      borderColor: 'rgb(249, 115, 22)',
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: 'rgb(249, 115, 22)',
      pointBorderColor: 'rgb(249, 115, 22)',
      pointRadius: 4
    }]
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `$${context.parsed.y.toFixed(2)}K`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(255, 255, 255, 0.5)' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          callback: (value) => `$${value}K`
        }
      }
    }
  }

  // Task status chart
  const taskStatusData = {
    labels: ['Completed', 'In Progress', 'Todo'],
    datasets: [{
      data: [
        tasks.filter(t => t.status === 'Completed').length,
        tasks.filter(t => t.status === 'In Progress').length,
        tasks.filter(t => t.status === 'Todo').length
      ],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(59, 130, 246, 0.8)'
      ],
      borderWidth: 0,
      cutout: '70%'
    }]
  }

  return (
    <div className="dashboard">
      <style>{`
        .dashboard {
          animation: fadeInUp var(--transition-slow) ease-out;
        }
        
        .welcome-section {
          margin-bottom: var(--space-8);
        }
        
        .welcome-title {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          margin-bottom: var(--space-2);
        }
        
        .welcome-title span {
          background: linear-gradient(135deg, var(--primary-400) 0%, var(--primary-500) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .welcome-subtitle {
          color: var(--neutral-400);
          font-size: var(--font-size-base);
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-6);
          margin-bottom: var(--space-8);
        }
        
        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 600px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .stat-card {
          animation: fadeInUp var(--transition-slow) ease-out;
          animation-fill-mode: backwards;
        }
        
        .stat-card:nth-child(1) { animation-delay: 0ms; }
        .stat-card:nth-child(2) { animation-delay: 100ms; }
        .stat-card:nth-child(3) { animation-delay: 200ms; }
        .stat-card:nth-child(4) { animation-delay: 300ms; }
        
        .charts-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-6);
          margin-bottom: var(--space-8);
        }
        
        @media (max-width: 1024px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .chart-card {
          background: var(--card-gradient);
          border: 1px solid var(--neutral-800);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
        }
        
        .chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-6);
        }
        
        .chart-title {
          font-size: var(--font-size-lg);
          font-weight: 600;
        }
        
        .chart-container {
          height: 280px;
        }
        
        .bottom-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-6);
        }
        
        @media (max-width: 1024px) {
          .bottom-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .task-item {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4);
          background: var(--neutral-850);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-3);
          transition: all var(--transition-fast);
        }
        
        .task-item:hover {
          background: var(--neutral-800);
          transform: translateX(4px);
        }
        
        .task-item:last-child {
          margin-bottom: 0;
        }
        
        .task-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .task-icon.todo {
          background: rgba(59, 130, 246, 0.15);
          color: var(--accent-400);
        }
        
        .task-icon.in-progress {
          background: rgba(249, 115, 22, 0.15);
          color: var(--primary-400);
        }
        
        .task-icon.completed {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success-400);
        }
        
        .task-content {
          flex: 1;
          min-width: 0;
        }
        
        .task-title {
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--neutral-100);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .task-meta {
          font-size: var(--font-size-xs);
          color: var(--neutral-500);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        
        .project-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4);
          background: var(--neutral-850);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-3);
          transition: all var(--transition-fast);
        }
        
        .project-item:hover {
          background: var(--neutral-800);
        }
        
        .project-info {
          flex: 1;
          min-width: 0;
        }
        
        .project-name {
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--neutral-100);
          margin-bottom: var(--space-1);
        }
        
        .project-client {
          font-size: var(--font-size-xs);
          color: var(--neutral-500);
        }
        
        .doughnut-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }
        
        .doughnut-value {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          color: var(--neutral-50);
        }
        
        .doughnut-label {
          font-size: var(--font-size-xs);
          color: var(--neutral-400);
        }
        
        .alert-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-3);
        }
        
        .alert-item:last-child {
          margin-bottom: 0;
        }
        
        .alert-icon {
          color: var(--warning-400);
        }
        
        .alert-text {
          font-size: var(--font-size-sm);
          color: var(--neutral-200);
        }
        
        .view-all-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--font-size-sm);
          color: var(--primary-400);
          transition: all var(--transition-fast);
        }
        
        .view-all-link:hover {
          color: var(--primary-300);
          gap: var(--space-2);
        }
      `}</style>

      {/* Welcome Section */}
      <div className="welcome-section">
        <h1 className="welcome-title">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, <span>{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="welcome-subtitle">
          Here's what's happening with your construction projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">
            <FolderKanban size={24} />
          </div>
          <div className="stat-value">{activeProjects}</div>
          <div className="stat-label">Active Projects</div>
          <div className="stat-change stat-change-up">
            <TrendingUp size={14} />
            {completedProjects} completed
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-accent">
            <ListTodo size={24} />
          </div>
          <div className="stat-value">{inProgressTasks}</div>
          <div className="stat-label">Tasks In Progress</div>
          <div className="stat-change stat-change-up">
            <CheckCircle2 size={14} />
            {completedTasks}/{totalTasks} done
          </div>
        </div>

        {hasPermission('manage_materials') && (
          <div className="stat-card">
            <div className="stat-icon stat-icon-warning">
              <Package size={24} />
            </div>
            <div className="stat-value">{materials.length}</div>
            <div className="stat-label">Material Items</div>
            {lowStockItems > 0 && (
              <div className="stat-change stat-change-down">
                <AlertTriangle size={14} />
                {lowStockItems} low stock
              </div>
            )}
          </div>
        )}

        {hasPermission('view_budget') && (
          <div className="stat-card">
            <div className="stat-icon stat-icon-success">
              <DollarSign size={24} />
            </div>
            <div className="stat-value">{formatCompact(totalExpenses)}</div>
            <div className="stat-label">Total Expenses</div>
            <div className="stat-change">
              <span style={{ color: budgetUtilization > 80 ? 'var(--danger-400)' : 'var(--success-400)' }}>
                {budgetUtilization.toFixed(0)}% of budget
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <div className="chart-card" style={{ position: 'relative' }}>
          <div className="chart-header">
            <h3 className="chart-title">Task Status</h3>
          </div>
          <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
              <Doughnut
                data={taskStatusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: { legend: { display: false } }
                }}
              />
              <div className="doughnut-center">
                <div className="doughnut-value">{totalTasks}</div>
                <div className="doughnut-label">Total Tasks</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.8)' }}></div>
              <span className="text-sm text-muted">Completed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(249, 115, 22, 0.8)' }}></div>
              <span className="text-sm text-muted">In Progress</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.8)' }}></div>
              <span className="text-sm text-muted">Todo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Trend & Tasks */}
      <div className="bottom-grid">
        {hasPermission('view_budget') && (
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Expense Trend</h3>
              <Link to="/budget" className="view-all-link">
                View Details <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="chart-container" style={{ height: '220px' }}>
              <Line data={budgetTrendData} options={lineOptions} />
            </div>
          </div>
        )}

        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Recent Tasks</h3>
            <Link to="/tasks" className="view-all-link">
              View All <ArrowUpRight size={16} />
            </Link>
          </div>
          <div>
            {recentTasks.map(task => (
              <div key={task.id} className="task-item">
                <div className={`task-icon ${task.status.toLowerCase().replace(' ', '-')}`}>
                  {task.status === 'Completed' ? <CheckCircle2 size={20} /> :
                    task.status === 'In Progress' ? <Clock size={20} /> :
                      <ListTodo size={20} />}
                </div>
                <div className="task-content">
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    <Calendar size={12} />
                    {formatDate(task.dueDate)}
                    <span>•</span>
                    {task.assignee}
                  </div>
                </div>
                <span className={`badge badge-${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {hasPermission('manage_materials') && lowStockItems > 0 && (
        <div className="chart-card" style={{ marginTop: 'var(--space-6)' }}>
          <div className="chart-header">
            <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <AlertTriangle size={20} color="var(--warning-400)" />
              Low Stock Alerts
            </h3>
            <Link to="/materials" className="view-all-link">
              Manage Inventory <ArrowUpRight size={16} />
            </Link>
          </div>
          <div>
            {materials.filter(m => m.quantity <= m.minStock).slice(0, 3).map(material => (
              <div key={material.id} className="alert-item">
                <AlertTriangle size={18} className="alert-icon" />
                <span className="alert-text">
                  <strong>{material.name}</strong> is running low ({material.quantity} {material.unit} remaining, minimum: {material.minStock})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
