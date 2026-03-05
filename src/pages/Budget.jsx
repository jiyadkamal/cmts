import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import Modal from '../components/Modal'
import ProgressBar from '../components/ProgressBar'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
    Plus,
    Search,
    DollarSign,
    TrendingUp,
    TrendingDown,
    PieChart,
    FileText,
    Calendar,
    Building2,
    Edit,
    Trash2,
    Download,
    Filter
} from 'lucide-react'
import { formatCurrency, formatDate, formatCompact, calculateBudgetUtilization } from '../utils/helpers'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

function Budget() {
    const { hasPermission } = useAuth()
    const { budgets, projects, addExpense, updateExpense, deleteExpense, getTotalBudget, getTotalExpenses } = useData()
    const [searchTerm, setSearchTerm] = useState('')
    const [projectFilter, setProjectFilter] = useState('all')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingExpense, setEditingExpense] = useState(null)

    const [formData, setFormData] = useState({
        projectId: '',
        category: '',
        description: '',
        amount: '',
        date: '',
        vendor: '',
        status: 'Pending'
    })

    const categories = [...new Set(budgets.map(b => b.category))]
    const totalBudget = getTotalBudget()
    const totalExpenses = getTotalExpenses()
    const remainingBudget = totalBudget - totalExpenses
    const utilizationPercent = calculateBudgetUtilization(totalExpenses, totalBudget)

    const filteredExpenses = budgets.filter(expense => {
        const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.vendor.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesProject = projectFilter === 'all' || expense.projectId === parseInt(projectFilter)
        const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter
        return matchesSearch && matchesProject && matchesCategory
    })

    const expensesByCategory = categories.map(cat => ({
        category: cat,
        amount: budgets.filter(b => b.category === cat).reduce((sum, b) => sum + b.amount, 0)
    })).sort((a, b) => b.amount - a.amount)

    const expensesByProject = projects.map(project => ({
        project: project.name,
        budget: project.budget,
        spent: budgets.filter(b => b.projectId === project.id).reduce((sum, b) => sum + b.amount, 0)
    }))

    // Chart data
    const categoryChartData = {
        labels: expensesByCategory.slice(0, 6).map(c => c.category),
        datasets: [{
            data: expensesByCategory.slice(0, 6).map(c => c.amount),
            backgroundColor: [
                'rgba(249, 115, 22, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(236, 72, 153, 0.8)'
            ],
            borderWidth: 0
        }]
    }

    const projectBudgetData = {
        labels: expensesByProject.slice(0, 5).map(p => p.project.length > 12 ? p.project.slice(0, 12) + '...' : p.project),
        datasets: [
            {
                label: 'Budget',
                data: expensesByProject.slice(0, 5).map(p => p.budget / 1000000),
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderRadius: 6
            },
            {
                label: 'Spent',
                data: expensesByProject.slice(0, 5).map(p => p.spent / 1000000),
                backgroundColor: 'rgba(249, 115, 22, 0.8)',
                borderRadius: 6
            }
        ]
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
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
                    callback: (value) => `$${value}M`
                }
            }
        }
    }

    const handleOpenModal = (expense = null) => {
        if (expense) {
            setEditingExpense(expense)
            setFormData({
                projectId: expense.projectId.toString(),
                category: expense.category,
                description: expense.description,
                amount: expense.amount.toString(),
                date: expense.date,
                vendor: expense.vendor,
                status: expense.status
            })
        } else {
            setEditingExpense(null)
            setFormData({
                projectId: '',
                category: '',
                description: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                vendor: '',
                status: 'Pending'
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const expenseData = {
            ...formData,
            projectId: parseInt(formData.projectId),
            amount: parseFloat(formData.amount) || 0
        }

        try {
            if (editingExpense) {
                await updateExpense({ ...editingExpense, ...expenseData })
            } else {
                await addExpense(expenseData)
            }
            setIsModalOpen(false)
        } catch (err) {
            console.error('Error saving expense:', err)
            alert('Failed to save expense. Please try again.')
        }
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this expense?')) {
            try {
                await deleteExpense(id)
            } catch (err) {
                console.error('Error deleting expense:', err)
                alert('Failed to delete expense. Please try again.')
            }
        }
    }

    const getProjectName = (projectId) => {
        const project = projects.find(p => p.id === projectId)
        return project?.name || 'Unknown'
    }

    return (
        <div className="budget-page">
            <style>{`
        .budget-page {
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
        
        .header-actions {
          display: flex;
          gap: var(--space-3);
        }
        
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-6);
          margin-bottom: var(--space-8);
        }
        
        @media (max-width: 1200px) {
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        .budget-stat-card {
          background: var(--card-gradient);
          border: 1px solid var(--neutral-800);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          position: relative;
          overflow: hidden;
        }
        
        .budget-stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, var(--primary-500) 0%, transparent 70%);
          opacity: 0.1;
          transform: translate(20%, -20%);
        }
        
        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-3);
        }
        
        .stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .stat-icon-wrapper.primary {
          background: rgba(249, 115, 22, 0.15);
          color: var(--primary-400);
        }
        
        .stat-icon-wrapper.success {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success-400);
        }
        
        .stat-icon-wrapper.danger {
          background: rgba(239, 68, 68, 0.15);
          color: var(--danger-400);
        }
        
        .stat-icon-wrapper.accent {
          background: rgba(59, 130, 246, 0.15);
          color: var(--accent-400);
        }
        
        .stat-value {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          color: var(--neutral-50);
          margin-bottom: var(--space-1);
        }
        
        .stat-label {
          font-size: var(--font-size-sm);
          color: var(--neutral-400);
        }
        
        .charts-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: var(--space-6);
          margin-bottom: var(--space-8);
        }
        
        @media (max-width: 1024px) {
          .charts-row {
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
        
        .doughnut-container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          margin-bottom: var(--space-4);
        }
        
        .category-legend {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: var(--font-size-sm);
        }
        
        .legend-left {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: var(--radius-sm);
        }
        
        .legend-label {
          color: var(--neutral-300);
        }
        
        .legend-value {
          font-weight: 500;
          color: var(--neutral-100);
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
        
        .expenses-section {
          background: var(--card-gradient);
          border: 1px solid var(--neutral-800);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }
        
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-5) var(--space-6);
          border-bottom: 1px solid var(--neutral-800);
        }
        
        .section-title {
          font-size: var(--font-size-lg);
          font-weight: 600;
        }
        
        .expense-table {
          width: 100%;
        }
        
        .expense-table th,
        .expense-table td {
          padding: var(--space-4) var(--space-6);
          text-align: left;
        }
        
        .expense-table th {
          background: var(--neutral-850);
          font-size: var(--font-size-xs);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--neutral-400);
          border-bottom: 1px solid var(--neutral-800);
        }
        
        .expense-table tbody tr {
          border-bottom: 1px solid var(--neutral-800);
          transition: background var(--transition-fast);
        }
        
        .expense-table tbody tr:hover {
          background: var(--neutral-850);
        }
        
        .expense-table tbody tr:last-child {
          border-bottom: none;
        }
        
        .expense-description {
          font-weight: 500;
          color: var(--neutral-100);
          margin-bottom: var(--space-1);
        }
        
        .expense-vendor {
          font-size: var(--font-size-xs);
          color: var(--neutral-500);
        }
        
        .expense-amount {
          font-weight: 600;
          color: var(--neutral-100);
        }
        
        .expense-actions {
          display: flex;
          gap: var(--space-2);
        }
        
        .action-btn {
          padding: var(--space-2);
          background: transparent;
          border: none;
          color: var(--neutral-400);
          cursor: pointer;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }
        
        .action-btn:hover {
          background: var(--neutral-800);
          color: var(--neutral-100);
        }
        
        .action-btn.danger:hover {
          background: rgba(239, 68, 68, 0.15);
          color: var(--danger-400);
        }
        
        .utilization-section {
          margin-top: var(--space-4);
        }
        
        .utilization-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--space-2);
          font-size: var(--font-size-sm);
        }
        
        .utilization-label {
          color: var(--neutral-400);
        }
        
        .utilization-value {
          font-weight: 600;
          color: var(--neutral-100);
        }
      `}</style>

            {/* Header */}
            <div className="page-header">
                <div className="page-title-section">
                    <h1>Budget & Cost Management</h1>
                    <p>Track expenses and manage project budgets</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary">
                        <Download size={18} />
                        Export Report
                    </button>
                    {hasPermission('edit_budget') && (
                        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                            <Plus size={20} />
                            Add Expense
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="budget-stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-wrapper primary">
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <div className="stat-value">{formatCompact(totalBudget)}</div>
                    <div className="stat-label">Total Budget</div>
                    <div className="utilization-section">
                        <div className="utilization-header">
                            <span className="utilization-label">Utilization</span>
                            <span className="utilization-value">{utilizationPercent.toFixed(0)}%</span>
                        </div>
                        <ProgressBar
                            value={utilizationPercent}
                            variant={utilizationPercent > 90 ? 'danger' : utilizationPercent > 70 ? 'warning' : 'success'}
                        />
                    </div>
                </div>

                <div className="budget-stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-wrapper accent">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <div className="stat-value">{formatCompact(totalExpenses)}</div>
                    <div className="stat-label">Total Expenses</div>
                </div>

                <div className="budget-stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-wrapper success">
                            <TrendingDown size={24} />
                        </div>
                    </div>
                    <div className="stat-value" style={{ color: remainingBudget >= 0 ? 'var(--success-400)' : 'var(--danger-400)' }}>
                        {formatCompact(remainingBudget)}
                    </div>
                    <div className="stat-label">Remaining Budget</div>
                </div>

                <div className="budget-stat-card">
                    <div className="stat-header">
                        <div className="stat-icon-wrapper primary">
                            <FileText size={24} />
                        </div>
                    </div>
                    <div className="stat-value">{budgets.length}</div>
                    <div className="stat-label">Total Transactions</div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-row">
                <div className="chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Budget vs Expenses by Project</h3>
                        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.6)' }}></div>
                                <span className="text-sm text-muted">Budget</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'rgba(249, 115, 22, 0.8)' }}></div>
                                <span className="text-sm text-muted">Spent</span>
                            </div>
                        </div>
                    </div>
                    <div className="chart-container">
                        <Bar data={projectBudgetData} options={chartOptions} />
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Expenses by Category</h3>
                    </div>
                    <div className="doughnut-container">
                        <Doughnut
                            data={categoryChartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: true,
                                plugins: { legend: { display: false } },
                                cutout: '60%'
                            }}
                        />
                    </div>
                    <div className="category-legend">
                        {expensesByCategory.slice(0, 5).map((item, index) => (
                            <div key={item.category} className="legend-item">
                                <div className="legend-left">
                                    <div
                                        className="legend-color"
                                        style={{
                                            background: [
                                                'rgba(249, 115, 22, 0.8)',
                                                'rgba(59, 130, 246, 0.8)',
                                                'rgba(16, 185, 129, 0.8)',
                                                'rgba(245, 158, 11, 0.8)',
                                                'rgba(139, 92, 246, 0.8)'
                                            ][index]
                                        }}
                                    ></div>
                                    <span className="legend-label">{item.category}</span>
                                </div>
                                <span className="legend-value">{formatCurrency(item.amount)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-row">
                <div className="search-box">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="filter-select"
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                >
                    <option value="all">All Projects</option>
                    {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                </select>
                <select
                    className="filter-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Expenses Table */}
            <div className="expenses-section">
                <div className="section-header">
                    <h2 className="section-title">Recent Expenses</h2>
                    <span className="text-sm text-muted">{filteredExpenses.length} transactions</span>
                </div>

                <table className="expense-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Project</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Amount</th>
                            {hasPermission('edit_budget') && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.map((expense) => (
                            <tr key={expense.id}>
                                <td>
                                    <div className="expense-description">{expense.description}</div>
                                    <div className="expense-vendor">{expense.vendor}</div>
                                </td>
                                <td>
                                    <span className="text-sm">{getProjectName(expense.projectId)}</span>
                                </td>
                                <td>
                                    <span className="badge badge-neutral">{expense.category}</span>
                                </td>
                                <td>
                                    <span className="text-sm text-muted">{formatDate(expense.date)}</span>
                                </td>
                                <td>
                                    <span className={`badge badge-${expense.status === 'Paid' ? 'success' : 'warning'}`}>
                                        {expense.status}
                                    </span>
                                </td>
                                <td>
                                    <span className="expense-amount">{formatCurrency(expense.amount)}</span>
                                </td>
                                {hasPermission('edit_budget') && (
                                    <td>
                                        <div className="expense-actions">
                                            <button
                                                className="action-btn"
                                                onClick={() => handleOpenModal(expense)}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="action-btn danger"
                                                onClick={() => handleDelete(expense.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredExpenses.length === 0 && (
                    <div className="empty-state" style={{ padding: 'var(--space-12)' }}>
                        <div className="empty-state-icon">
                            <FileText size={40} />
                        </div>
                        <h3 className="empty-state-title">No expenses found</h3>
                        <p className="empty-state-description">
                            Try adjusting your search or filter criteria
                        </p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
                size="default"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleSubmit}>
                            {editingExpense ? 'Save Changes' : 'Add Expense'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit}>
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

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label className="form-label">Category *</label>
                            <select
                                className="form-select"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                <option value="">Select category</option>
                                <option value="Materials">Materials</option>
                                <option value="Labor">Labor</option>
                                <option value="Equipment">Equipment</option>
                                <option value="Permits">Permits</option>
                                <option value="Consulting">Consulting</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Amount ($) *</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0"
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description *</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Expense description"
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label className="form-label">Vendor *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.vendor}
                                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                placeholder="Vendor name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Date *</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Status</label>
                        <select
                            className="form-select"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                        </select>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default Budget
