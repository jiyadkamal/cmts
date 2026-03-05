import { X } from 'lucide-react'

function Modal({ isOpen, onClose, title, children, size = 'default', footer }) {
    if (!isOpen) return null

    const sizeClasses = {
        small: '400px',
        default: '500px',
        large: '700px',
        xlarge: '900px'
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                style={{ maxWidth: sizeClasses[size] }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Modal
