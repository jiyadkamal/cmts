import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import Modal from '../components/Modal'
import ProgressBar from '../components/ProgressBar'
import {
    Plus,
    Search,
    Package,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Edit,
    Trash2,
    MoreVertical,
    ShoppingCart,
    Warehouse,
    Filter
} from 'lucide-react'
import { formatCurrency, formatNumber, getStockStatus, getStockColor } from '../utils/helpers'

function Materials() {
    const { hasPermission } = useAuth()
    const { materials, projects, addMaterial, updateMaterial, deleteMaterial, getLowStockMaterials } = useData()
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [stockFilter, setStockFilter] = useState('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingMaterial, setEditingMaterial] = useState(null)
    const [activeMenu, setActiveMenu] = useState(null)

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        unit: '',
        quantity: '',
        minStock: '',
        maxStock: '',
        unitPrice: '',
        supplier: '',
        projectId: '',
        location: ''
    })

    const categories = [...new Set(materials.map(m => m.category))]
    const lowStockMaterials = getLowStockMaterials()
    const totalValue = materials.reduce((sum, m) => sum + (m.quantity * m.unitPrice), 0)

    const filteredMaterials = materials.filter(material => {
        const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            material.supplier.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = categoryFilter === 'all' || material.category === categoryFilter
        const matchesStock = stockFilter === 'all' ||
            (stockFilter === 'low' && material.quantity <= material.minStock) ||
            (stockFilter === 'normal' && material.quantity > material.minStock)
        return matchesSearch && matchesCategory && matchesStock
    })

    const handleOpenModal = (material = null) => {
        if (material) {
            setEditingMaterial(material)
            setFormData({
                name: material.name,
                category: material.category,
                unit: material.unit,
                quantity: material.quantity.toString(),
                minStock: material.minStock.toString(),
                maxStock: material.maxStock.toString(),
                unitPrice: material.unitPrice.toString(),
                supplier: material.supplier,
                projectId: material.projectId?.toString() || '',
                location: material.location || ''
            })
        } else {
            setEditingMaterial(null)
            setFormData({
                name: '',
                category: '',
                unit: '',
                quantity: '',
                minStock: '',
                maxStock: '',
                unitPrice: '',
                supplier: '',
                projectId: '',
                location: ''
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const materialData = {
            ...formData,
            quantity: parseFloat(formData.quantity) || 0,
            minStock: parseFloat(formData.minStock) || 0,
            maxStock: parseFloat(formData.maxStock) || 0,
            unitPrice: parseFloat(formData.unitPrice) || 0,
            projectId: formData.projectId ? parseInt(formData.projectId) : null
        }

        try {
            if (editingMaterial) {
                await updateMaterial({ ...editingMaterial, ...materialData, lastUpdated: new Date().toISOString() })
            } else {
                await addMaterial(materialData)
            }
            setIsModalOpen(false)
        } catch (err) {
            console.error('Error saving material:', err)
            alert('Failed to save material. Please try again.')
        }
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this material?')) {
            try {
                await deleteMaterial(id)
            } catch (err) {
                console.error('Error deleting material:', err)
                alert('Failed to delete material. Please try again.')
            }
        }
        setActiveMenu(null)
    }

    const handleQuantityUpdate = async (material, change) => {
        const newQuantity = Math.max(0, material.quantity + change)
        try {
            await updateMaterial({ ...material, quantity: newQuantity, lastUpdated: new Date().toISOString() })
        } catch (err) {
            console.error('Error updating quantity:', err)
        }
    }

    return (
        <div className="materials-page">
            <style>{`
        .materials-page {
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
        
        .materials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--space-5);
        }
        
        .material-card {
          background: var(--card-gradient);
          border: 1px solid var(--neutral-800);
          border-radius: var(--radius-xl);
          padding: var(--space-5);
          transition: all var(--transition-base);
          position: relative;
        }
        
        .material-card:hover {
          border-color: var(--neutral-700);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
        
        .material-card.low-stock {
          border-color: rgba(239, 68, 68, 0.3);
        }
        
        .material-card.low-stock::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--danger-500);
          border-radius: var(--radius-xl) var(--radius-xl) 0 0;
        }
        
        .material-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--space-4);
        }
        
        .material-icon {
          width: 48px;
          height: 48px;
          background: rgba(249, 115, 22, 0.15);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-400);
        }
        
        .material-actions {
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
          min-width: 140px;
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
        
        .material-info {
          margin-bottom: var(--space-4);
        }
        
        .material-name {
          font-size: var(--font-size-lg);
          font-weight: 600;
          color: var(--neutral-100);
          margin-bottom: var(--space-1);
        }
        
        .material-category {
          font-size: var(--font-size-sm);
          color: var(--neutral-500);
        }
        
        .material-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
          padding: var(--space-4);
          background: var(--neutral-850);
          border-radius: var(--radius-lg);
        }
        
        .detail-item {
          display: flex;
          flex-direction: column;
        }
        
        .detail-label {
          font-size: var(--font-size-xs);
          color: var(--neutral-500);
          margin-bottom: var(--space-1);
        }
        
        .detail-value {
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--neutral-100);
        }
        
        .stock-section {
          margin-bottom: var(--space-4);
        }
        
        .stock-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-2);
        }
        
        .stock-label {
          font-size: var(--font-size-sm);
          color: var(--neutral-400);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        
        .stock-value {
          font-size: var(--font-size-sm);
          font-weight: 600;
        }
        
        .stock-value.low {
          color: var(--danger-400);
        }
        
        .stock-value.warning {
          color: var(--warning-400);
        }
        
        .stock-value.normal {
          color: var(--success-400);
        }
        
        .quantity-controls {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-top: var(--space-3);
        }
        
        .qty-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--neutral-800);
          border: 1px solid var(--neutral-700);
          border-radius: var(--radius-md);
          color: var(--neutral-200);
          font-size: var(--font-size-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .qty-btn:hover {
          background: var(--primary-500);
          border-color: var(--primary-500);
          color: white;
        }
        
        .qty-display {
          flex: 1;
          text-align: center;
          font-weight: 600;
          color: var(--neutral-100);
        }
        
        .material-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: var(--space-4);
          border-top: 1px solid var(--neutral-800);
          font-size: var(--font-size-sm);
        }
        
        .supplier-info {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--neutral-400);
        }
        
        .total-value {
          font-weight: 600;
          color: var(--primary-400);
        }
        
        .low-stock-badge {
          position: absolute;
          top: var(--space-3);
          right: var(--space-3);
        }
      `}</style>

            {/* Header */}
            <div className="page-header">
                <div className="page-title-section">
                    <h1>Materials</h1>
                    <p>Track inventory and manage construction materials</p>
                </div>
                {hasPermission('manage_materials') && (
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        Add Material
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-icon stat-icon-primary">
                        <Package size={24} />
                    </div>
                    <div className="stat-value">{materials.length}</div>
                    <div className="stat-label">Total Items</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon-warning">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-value">{lowStockMaterials.length}</div>
                    <div className="stat-label">Low Stock Items</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon-accent">
                        <Warehouse size={24} />
                    </div>
                    <div className="stat-value">{categories.length}</div>
                    <div className="stat-label">Categories</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon-success">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-value">{formatCurrency(totalValue)}</div>
                    <div className="stat-label">Total Value</div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-row">
                <div className="search-box">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search materials..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
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
                <select
                    className="filter-select"
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                >
                    <option value="all">All Stock Levels</option>
                    <option value="low">Low Stock</option>
                    <option value="normal">Normal Stock</option>
                </select>
            </div>

            {/* Materials Grid */}
            <div className="materials-grid">
                {filteredMaterials.map((material) => {
                    const stockStatus = getStockStatus(material.quantity, material.minStock)
                    const stockColor = getStockColor(material.quantity, material.minStock)
                    const stockPercent = Math.min((material.quantity / material.maxStock) * 100, 100)
                    const isLowStock = material.quantity <= material.minStock

                    return (
                        <div key={material.id} className={`material-card ${isLowStock ? 'low-stock' : ''}`}>
                            {isLowStock && (
                                <div className="low-stock-badge">
                                    <span className="badge badge-danger">
                                        <AlertTriangle size={12} style={{ marginRight: '4px' }} />
                                        Low Stock
                                    </span>
                                </div>
                            )}

                            <div className="material-header">
                                <div className="material-icon">
                                    <Package size={24} />
                                </div>
                                {hasPermission('manage_materials') && (
                                    <div className="material-actions">
                                        <button
                                            className="actions-btn"
                                            onClick={() => setActiveMenu(activeMenu === material.id ? null : material.id)}
                                        >
                                            <MoreVertical size={18} />
                                        </button>
                                        {activeMenu === material.id && (
                                            <div className="actions-menu">
                                                <button onClick={() => { handleOpenModal(material); setActiveMenu(null); }}>
                                                    <Edit size={14} /> Edit
                                                </button>
                                                <button className="danger" onClick={() => handleDelete(material.id)}>
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="material-info">
                                <h3 className="material-name">{material.name}</h3>
                                <p className="material-category">{material.category}</p>
                            </div>

                            <div className="material-details">
                                <div className="detail-item">
                                    <span className="detail-label">Unit Price</span>
                                    <span className="detail-value">{formatCurrency(material.unitPrice)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Unit</span>
                                    <span className="detail-value">{material.unit}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Min Stock</span>
                                    <span className="detail-value">{formatNumber(material.minStock)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Max Stock</span>
                                    <span className="detail-value">{formatNumber(material.maxStock)}</span>
                                </div>
                            </div>

                            <div className="stock-section">
                                <div className="stock-header">
                                    <span className="stock-label">
                                        Current Stock
                                    </span>
                                    <span className={`stock-value ${stockColor}`}>
                                        {formatNumber(material.quantity)} {material.unit}
                                    </span>
                                </div>
                                <ProgressBar
                                    value={stockPercent}
                                    variant={stockColor}
                                />

                                {hasPermission('manage_materials') && (
                                    <div className="quantity-controls">
                                        <button
                                            className="qty-btn"
                                            onClick={() => handleQuantityUpdate(material, -10)}
                                        >
                                            -
                                        </button>
                                        <span className="qty-display">{material.quantity}</span>
                                        <button
                                            className="qty-btn"
                                            onClick={() => handleQuantityUpdate(material, 10)}
                                        >
                                            +
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="material-footer">
                                <span className="supplier-info">
                                    <ShoppingCart size={14} />
                                    {material.supplier}
                                </span>
                                <span className="total-value">
                                    {formatCurrency(material.quantity * material.unitPrice)}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>

            {filteredMaterials.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <Package size={40} />
                    </div>
                    <h3 className="empty-state-title">No materials found</h3>
                    <p className="empty-state-description">
                        {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all'
                            ? "Try adjusting your search or filter criteria"
                            : "Get started by adding your first material"}
                    </p>
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingMaterial ? 'Edit Material' : 'Add New Material'}
                size="large"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleSubmit}>
                            {editingMaterial ? 'Save Changes' : 'Add Material'}
                        </button>
                    </>
                }
            >
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label className="form-label">Material Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter material name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Category *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                placeholder="e.g., Steel, Concrete, Electrical"
                                required
                                list="categories-list"
                            />
                            <datalist id="categories-list">
                                {categories.map(cat => (
                                    <option key={cat} value={cat} />
                                ))}
                            </datalist>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label className="form-label">Unit *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                placeholder="e.g., tons, pieces, feet"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Unit Price ($) *</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.unitPrice}
                                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label className="form-label">Current Quantity *</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                placeholder="0"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Min Stock *</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.minStock}
                                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                                placeholder="0"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Max Stock *</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.maxStock}
                                onChange={(e) => setFormData({ ...formData, maxStock: e.target.value })}
                                placeholder="0"
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label className="form-label">Supplier *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.supplier}
                                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                placeholder="Supplier name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Project</label>
                            <select
                                className="form-select"
                                value={formData.projectId}
                                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                            >
                                <option value="">Select project (optional)</option>
                                {projects.map(project => (
                                    <option key={project.id} value={project.id}>{project.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Storage Location</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="e.g., Warehouse A, On-site Storage"
                        />
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default Materials
