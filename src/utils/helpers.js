// Date formatting
export const formatDate = (dateString) => {
    if (!dateString) return '-'
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('en-US', options)
}

export const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }
    return new Date(dateString).toLocaleDateString('en-US', options)
}

export const formatRelativeTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(dateString)
}

// Currency formatting
export const formatCurrency = (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return '-'
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}

export const formatNumber = (number) => {
    if (number === null || number === undefined) return '-'
    return new Intl.NumberFormat('en-US').format(number)
}

export const formatCompact = (number) => {
    if (number === null || number === undefined) return '-'
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short'
    }).format(number)
}

// Percentage formatting
export const formatPercentage = (value, decimals = 0) => {
    if (value === null || value === undefined) return '-'
    return `${value.toFixed(decimals)}%`
}

// Status helpers
export const getStatusColor = (status) => {
    const colors = {
        'Completed': 'success',
        'In Progress': 'primary',
        'Todo': 'info',
        'Pending': 'warning',
        'On Hold': 'warning',
        'Cancelled': 'danger',
        'Paid': 'success',
        'Overdue': 'danger',
        'Active': 'success',
        'Inactive': 'neutral'
    }
    return colors[status] || 'neutral'
}

export const getPriorityColor = (priority) => {
    const colors = {
        'Critical': 'danger',
        'High': 'warning',
        'Medium': 'primary',
        'Low': 'info'
    }
    return colors[priority] || 'neutral'
}

// Progress helpers
export const getProgressColor = (progress) => {
    if (progress >= 75) return 'success'
    if (progress >= 50) return 'primary'
    if (progress >= 25) return 'warning'
    return 'danger'
}

// Days remaining
export const getDaysRemaining = (endDate) => {
    if (!endDate) return null
    const end = new Date(endDate)
    const now = new Date()
    const diffMs = end - now
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    return diffDays
}

export const getDaysRemainingText = (endDate) => {
    const days = getDaysRemaining(endDate)
    if (days === null) return '-'
    if (days < 0) return `${Math.abs(days)} days overdue`
    if (days === 0) return 'Due today'
    if (days === 1) return '1 day left'
    return `${days} days left`
}

// Stock status
export const getStockStatus = (quantity, minStock) => {
    if (quantity <= minStock) return 'Low Stock'
    if (quantity <= minStock * 1.5) return 'Warning'
    return 'In Stock'
}

export const getStockColor = (quantity, minStock) => {
    if (quantity <= minStock) return 'danger'
    if (quantity <= minStock * 1.5) return 'warning'
    return 'success'
}

// Generate unique ID
export const generateId = () => {
    return Date.now() + Math.random().toString(36).substr(2, 9)
}

// Truncate text
export const truncateText = (text, maxLength = 100) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
}

// Calculate budget utilization
export const calculateBudgetUtilization = (spent, budget) => {
    if (!budget || budget === 0) return 0
    return Math.min((spent / budget) * 100, 100)
}

// Group array by key
export const groupBy = (array, key) => {
    return array.reduce((groups, item) => {
        const value = item[key]
        groups[value] = groups[value] || []
        groups[value].push(item)
        return groups
    }, {})
}

// Sort array by key
export const sortBy = (array, key, direction = 'asc') => {
    return [...array].sort((a, b) => {
        if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
        if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
        return 0
    })
}

// Filter array by search term
export const filterBySearch = (array, searchTerm, keys) => {
    if (!searchTerm) return array
    const term = searchTerm.toLowerCase()
    return array.filter(item =>
        keys.some(key => {
            const value = item[key]
            if (typeof value === 'string') {
                return value.toLowerCase().includes(term)
            }
            return false
        })
    )
}

// Chart colors
export const chartColors = {
    primary: 'rgb(249, 115, 22)',
    primaryLight: 'rgba(249, 115, 22, 0.5)',
    accent: 'rgb(59, 130, 246)',
    accentLight: 'rgba(59, 130, 246, 0.5)',
    success: 'rgb(16, 185, 129)',
    successLight: 'rgba(16, 185, 129, 0.5)',
    warning: 'rgb(245, 158, 11)',
    warningLight: 'rgba(245, 158, 11, 0.5)',
    danger: 'rgb(239, 68, 68)',
    dangerLight: 'rgba(239, 68, 68, 0.5)',
    neutral: 'rgb(113, 113, 122)',
    neutralLight: 'rgba(113, 113, 122, 0.5)'
}

// Chart.js common options
export const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        }
    },
    scales: {
        x: {
            grid: {
                color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
                color: 'rgba(255, 255, 255, 0.5)'
            }
        },
        y: {
            grid: {
                color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
                color: 'rgba(255, 255, 255, 0.5)'
            }
        }
    }
}
