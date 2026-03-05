function ProgressBar({ value, max = 100, size = 'default', variant = 'primary', showLabel = false }) {
    const percentage = Math.min((value / max) * 100, 100)

    const sizeStyles = {
        small: { height: '4px' },
        default: { height: '8px' },
        large: { height: '12px' }
    }

    const getVariantClass = () => {
        if (variant === 'auto') {
            if (percentage >= 75) return 'progress-bar-success'
            if (percentage >= 50) return 'progress-bar-primary'
            if (percentage >= 25) return 'progress-bar-warning'
            return 'progress-bar-danger'
        }
        return `progress-bar-${variant}`
    }

    return (
        <div>
            {showLabel && (
                <div className="flex justify-between mb-2" style={{ marginBottom: '8px' }}>
                    <span className="text-sm text-muted">Progress</span>
                    <span className="text-sm font-medium">{Math.round(percentage)}%</span>
                </div>
            )}
            <div className={`progress-bar ${getVariantClass()}`} style={sizeStyles[size]}>
                <div
                    className="progress-bar-fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

export default ProgressBar
