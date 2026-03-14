import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    LayoutDashboard,
    FolderKanban,
    ListTodo,
    Package,
    DollarSign,
    Users,
    LogOut,
    Bell,
    Search,
    HardHat,
    ChevronRight,
    Folder
} from 'lucide-react'
import { useData } from '../context/DataContext'

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['Admin', 'Engineer', 'Contractor', 'Client'] },
    { name: 'Projects', href: '/projects', icon: FolderKanban, roles: ['Admin', 'Engineer', 'Contractor', 'Client'] },
    { name: 'Tasks', href: '/tasks', icon: ListTodo, roles: ['Admin', 'Engineer', 'Contractor'] },
    { name: 'Materials', href: '/materials', icon: Package, roles: ['Admin', 'Engineer', 'Contractor'] },
    { name: 'Budget', href: '/budget', icon: DollarSign, roles: ['Admin', 'Engineer', 'Contractor', 'Client'] },
    { name: 'Users', href: '/users', icon: Users, roles: ['Admin'] },
]

function Layout() {
    const { user, logout } = useAuth()
    const { projects, selectedProjectId, setSelectedProjectId } = useData()
    const location = useLocation()

    const filteredNav = navigation.filter(item => item.roles.includes(user?.role))

    const getPageTitle = () => {
        const path = location.pathname
        if (path === '/') return 'Dashboard'
        if (path.startsWith('/projects/')) return 'Project Details'
        const navItem = navigation.find(item => item.href === path)
        return navItem?.name || 'CMTS'
    }

    const getBreadcrumbs = () => {
        const path = location.pathname
        const crumbs = [{ name: 'Home', href: '/' }]

        if (path !== '/') {
            if (path.startsWith('/projects/')) {
                crumbs.push({ name: 'Projects', href: '/projects' })
                crumbs.push({ name: 'Details', href: path })
            } else {
                const navItem = navigation.find(item => item.href === path)
                if (navItem) {
                    crumbs.push({ name: navItem.name, href: path })
                }
            }
        }

        return crumbs
    }

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">
                            <HardHat size={24} />
                        </div>
                        <span className="sidebar-logo-text">CMTS</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-section">
                        <div className="sidebar-section-title">Main Menu</div>
                        {filteredNav.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive && location.pathname === item.href ? 'active' : ''}`
                                }
                                end={item.href === '/'}
                            >
                                <item.icon className="sidebar-link-icon" size={20} />
                                {item.name}
                            </NavLink>
                        ))}
                    </div>

                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="avatar" style={{ background: 'var(--accent-gradient)' }}>
                            {user?.avatar}
                        </div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.name}</div>
                            <div className="sidebar-user-role">{user?.role}</div>
                        </div>
                        <button
                            onClick={logout}
                            className="btn btn-ghost btn-icon"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Header */}
                <header className="header">
                    <div className="header-left">
                        <div>
                            <h1 className="header-title">{getPageTitle()}</h1>
                            <div className="header-breadcrumb">
                                {getBreadcrumbs().map((crumb, index) => (
                                    <span key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {index > 0 && <ChevronRight size={14} className="header-breadcrumb-separator" />}
                                        <NavLink
                                            to={crumb.href}
                                            style={{
                                                color: index === getBreadcrumbs().length - 1 ? 'var(--neutral-200)' : 'inherit'
                                            }}
                                        >
                                            {crumb.name}
                                        </NavLink>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="header-right">
                        {/* Project Selector */}
                        <div className="project-selector-wrapper">
                            <div className="project-selector-icon">
                                <Folder size={18} />
                            </div>
                            <select
                                className="project-selector"
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                            >
                                {projects.length === 0 ? (
                                    <option value="">No Projects Joined</option>
                                ) : (
                                    projects.map(project => (
                                        <option key={project.id} value={project.id}>
                                            {project.name}
                                        </option>
                                    ))
                                )}
                            </select>
                        </div>

                        <div className="search-box">
                            <Search className="search-icon" size={18} />
                            <input type="text" placeholder="Search..." />
                        </div>
                        <button className="header-icon-btn" style={{ position: 'relative' }}>
                            <Bell size={20} />
                            <span className="notification-dot"></span>
                        </button>
                        <div className="avatar" style={{ cursor: 'pointer' }}>
                            {user?.avatar}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="page-content">
                    <Outlet />
                </div>
            </main>

            <style>{`
                .project-selector-wrapper {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    background: var(--neutral-850);
                    border: 1px solid var(--neutral-700);
                    border-radius: var(--radius-lg);
                    padding: 0 var(--space-3);
                    height: 40px;
                    transition: all var(--transition-base);
                }

                .project-selector-wrapper:hover {
                    border-color: var(--primary-500);
                    background: var(--neutral-800);
                }

                .project-selector-icon {
                    color: var(--primary-400);
                    display: flex;
                    align-items: center;
                }

                .project-selector {
                    background: transparent;
                    border: none;
                    color: var(--neutral-100);
                    font-size: var(--font-size-sm);
                    font-weight: 500;
                    cursor: pointer;
                    outline: none;
                    padding-right: var(--space-2);
                    max-width: 200px;
                }

                .project-selector option {
                    background: var(--neutral-900);
                    color: var(--neutral-100);
                }
            `}</style>
        </div>
    )
}

export default Layout
